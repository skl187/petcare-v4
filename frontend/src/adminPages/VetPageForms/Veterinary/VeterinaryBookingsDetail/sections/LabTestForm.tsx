import { useState, FormEvent, useEffect, useRef } from 'react';
import Form from '../../../../../components/form/Form';
import Label from '../../../../../components/form/Label';
import { MdSave, MdAdd, MdDelete } from 'react-icons/md';
import {
  saveLabTest,
  updateLabTest,
  getLabTestById,
  LabTestPayload,
  LabTest,
} from '../../../../../services/labTestService';

interface LabTestData {
  id?: string;
  medical_record_id?: string;
  lab_tests: LabTest[];
}

interface LabTestFormProps {
  appointmentId?: string;
  petId?: string;
  medicalRecordId?: string;
  labTestId?: string;
  onSave: (data: LabTestData) => void;
  onCancel: () => void;
}

export default function LabTestForm({
  appointmentId = '',
  petId = '',
  medicalRecordId = '',
  labTestId = '',
  onSave,
  onCancel,
}: LabTestFormProps) {
  const [formData, setFormData] = useState<LabTestData>({
    medical_record_id: medicalRecordId,
    lab_tests: [],
  });

  const [currentLabTest, setCurrentLabTest] = useState<LabTest>({
    test_name: '',
    test_type: '',
    lab_name: '',
    urgency: 'routine',
    cost: undefined,
    normal_range: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const errorBannerRef = useRef<HTMLDivElement>(null);

  // Scroll to error banner when error appears
  useEffect(() => {
    if (error && errorBannerRef.current) {
      errorBannerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [error]);

  // Load lab test if labTestId is provided
  useEffect(() => {
    console.log('===================================');
    console.log('LabTestForm useEffect triggered');
    console.log('appointmentId:', appointmentId);
    console.log('petId:', petId);
    console.log('medicalRecordId:', medicalRecordId);
    console.log('labTestId:', labTestId);
    console.log('===================================');

    if (labTestId && labTestId.trim() !== '') {
      loadLabTest();
    }
  }, [labTestId]);

  const loadLabTest = async () => {
    setLoading(true);
    setError(null);
    console.log('Starting loadLabTest for ID:', labTestId);
    try {
      console.log('Calling getLabTestById with labTestId:', labTestId);
      const labTest = await getLabTestById(labTestId);
      console.log('Lab test loaded successfully:', labTest);

      // Load lab test data into current form for editing
      setCurrentLabTest({
        test_name: labTest.test_name,
        test_type: labTest.test_type,
        lab_name: labTest.lab_name || '',
        urgency: labTest.urgency,
        cost: labTest.cost,
        normal_range: labTest.normal_range || '',
      });

      setFormData({
        id: labTest.id,
        medical_record_id: labTest.medical_record_id,
        lab_tests: [],
      });

      console.log('✅ Form data updated successfully');
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to load lab test';
      setError(errorMsg);
      console.error('Error loading lab test:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add lab test to the array
  const addLabTest = () => {
    if (!currentLabTest.test_name.trim()) {
      setError('Test name is required');
      return;
    }

    if (!currentLabTest.test_type.trim()) {
      setError('Test type is required');
      setLoading(false);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      lab_tests: [...prev.lab_tests, currentLabTest],
    }));

    // Reset current lab test
    setCurrentLabTest({
      test_name: '',
      test_type: '',
      lab_name: '',
      urgency: 'routine',
      cost: undefined,
      normal_range: '',
    });

    setError(null);
  };

  // Remove lab test from the array
  const removeLabTest = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      lab_tests: prev.lab_tests.filter((_, i) => i !== index),
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setCurrentLabTest((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (labTestId && labTestId.trim() !== '') {
      // Edit mode validation - check currentLabTest
      if (
        !currentLabTest.test_name.trim() ||
        !currentLabTest.test_type.trim()
      ) {
        setError('Test name and test type are required');
        setLoading(false);
        return;
      }
    } else {
      // Create mode validation - check lab_tests array
      if (formData.lab_tests.length === 0) {
        setError('Please add at least one lab test');
        setLoading(false);
        return;
      }
    }

    try {
      if (labTestId && labTestId.trim() !== '') {
        // Update existing lab test using PATCH
        console.log('Updating lab test:', labTestId);
        console.log('Lab Test Data:', currentLabTest);

        await updateLabTest(labTestId, currentLabTest);

        setSuccess('Lab test updated successfully!');
      } else {
        // Create new lab test using POST
        const payload: LabTestPayload = {
          appointment_id: appointmentId,
          pet_id: petId,
          medical_record_id: formData.medical_record_id,
          lab_tests: formData.lab_tests,
        };

        console.log('Creating new lab test:', payload);

        await saveLabTest(appointmentId, payload);

        setSuccess('Lab test saved successfully!');
      }

      setTimeout(() => {
        onSave(formData);
      }, 1000);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to save lab test';
      setError(errorMsg);
      console.error('Error saving lab test:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-3xl mx-auto'>
      {error && (
        <div
          ref={errorBannerRef}
          className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg'
        >
          <p className='text-red-600 text-sm'>{error}</p>
        </div>
      )}

      {success && (
        <div className='mb-4 p-4 bg-green-50 border border-green-200 rounded-lg'>
          <p className='text-green-600 text-sm'>{success}</p>
        </div>
      )}

      <Form onSubmit={handleSubmit}>
        <div className='space-y-6'>
          {/* Current Lab Test - Add New Test Section (only show in create mode) */}
          <div className='bg-purple-50 p-4 rounded-lg border border-purple-200'>
            <h3 className='text-lg font-semibold text-purple-900 mb-4'>
              {labTestId ? 'Edit Lab Test' : 'Add Lab Test'}
            </h3>

            {/* Basic Information */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='test_name'>Test Name *</Label>
                <input
                  type='text'
                  id='test_name'
                  name='test_name'
                  value={currentLabTest.test_name}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                  placeholder='e.g., Complete Blood Count'
                />
              </div>

              <div>
                <Label htmlFor='test_type'>Test Type *</Label>
                <input
                  type='text'
                  id='test_type'
                  name='test_type'
                  value={currentLabTest.test_type}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                  placeholder='e.g., hematology, urinalysis, chemistry'
                />
              </div>

              <div>
                <Label htmlFor='urgency'>Urgency *</Label>
                <select
                  id='urgency'
                  name='urgency'
                  value={currentLabTest.urgency}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                >
                  <option value='routine'>Routine</option>
                  <option value='urgent'>Urgent</option>
                  <option value='stat'>STAT</option>
                </select>
              </div>

              <div>
                <Label htmlFor='lab_name'>Laboratory Name</Label>
                <input
                  type='text'
                  id='lab_name'
                  name='lab_name'
                  value={currentLabTest.lab_name}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                  placeholder='e.g., LabCorp Veterinary'
                />
              </div>

              <div>
                <Label htmlFor='cost'>Cost ($)</Label>
                <input
                  type='number'
                  id='cost'
                  name='cost'
                  value={currentLabTest.cost || ''}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setCurrentLabTest((prev) => ({
                      ...prev,
                      [name]: value ? parseFloat(value) : undefined,
                    }));
                  }}
                  step='0.01'
                  min='0'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                  placeholder='e.g., 150.00'
                />
              </div>
            </div>

            {/* Normal Range */}
            <div>
              <Label htmlFor='normal_range'>
                Normal Range / Reference Values
              </Label>
              <textarea
                id='normal_range'
                name='normal_range'
                value={currentLabTest.normal_range}
                onChange={handleChange}
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                placeholder='e.g., RBC: 5.5-8.5 M/uL, WBC: 4.5-11 K/uL'
              />
            </div>

            {/* Add Test Button - only show in create mode */}
            {!labTestId && (
              <div className='flex justify-end'>
                <button
                  type='button'
                  onClick={addLabTest}
                  className='flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500'
                >
                  <MdAdd size={20} />
                  Add Lab Test
                </button>
              </div>
            )}
          </div>

          {/* Added Lab Tests List - only show in create mode */}
          {!labTestId && formData.lab_tests.length > 0 && (
            <div className='mt-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Added Lab Tests ({formData.lab_tests.length})
              </h3>
              <div className='space-y-3'>
                {formData.lab_tests.map((test, index) => (
                  <div
                    key={index}
                    className='bg-white border border-purple-200 rounded-lg p-4'
                  >
                    <div className='flex justify-between items-start'>
                      <div className='flex-1 space-y-2'>
                        <div className='flex items-center gap-2'>
                          <h4 className='font-semibold text-gray-900'>
                            {test.test_name}
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              test.urgency === 'stat'
                                ? 'bg-red-100 text-red-800'
                                : test.urgency === 'urgent'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {test.urgency.toUpperCase()}
                          </span>
                        </div>
                        <div className='text-sm text-gray-600 space-y-1'>
                          <p>
                            <span className='font-medium'>Type:</span>{' '}
                            {test.test_type}
                          </p>
                          {test.lab_name && (
                            <p>
                              <span className='font-medium'>Laboratory:</span>{' '}
                              {test.lab_name}
                            </p>
                          )}
                          {test.cost != null && (
                            <p>
                              <span className='font-medium'>Cost:</span> $
                              {typeof test.cost === 'number'
                                ? test.cost.toFixed(2)
                                : Number(test.cost).toFixed(2)}
                            </p>
                          )}
                          {test.normal_range && (
                            <p>
                              <span className='font-medium'>Normal Range:</span>{' '}
                              {test.normal_range}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type='button'
                        onClick={() => removeLabTest(index)}
                        className='ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                        title='Remove test'
                      >
                        <MdDelete size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medical Record ID (Optional) */}
          <div className='mt-6'>
            <Label htmlFor='medical_record_id'>Medical Record ID</Label>
            <input
              type='text'
              id='medical_record_id'
              name='medical_record_id'
              value={formData.medical_record_id}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  medical_record_id: e.target.value,
                }))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
              placeholder='Optional'
            />
          </div>

          {/* Summary Section - only show in create mode */}
          {!labTestId && formData.lab_tests.length > 0 && (
            <div className='mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4'>
              <h4 className='font-semibold text-purple-900 mb-2'>
                ORDER SUMMARY
              </h4>
              <div className='text-sm text-purple-800 space-y-1'>
                <p>
                  <span className='font-medium'>Total Tests:</span>{' '}
                  {formData.lab_tests.length}
                </p>
                <p>
                  <span className='font-medium'>Total Cost:</span> $
                  {formData.lab_tests
                    .reduce(
                      (sum, test) =>
                        sum +
                        (typeof test.cost === 'number'
                          ? test.cost
                          : Number(test.cost || 0)),
                      0,
                    )
                    .toFixed(2)}
                </p>
                <p>
                  <span className='font-medium'>Urgency Breakdown:</span>
                </p>
                <ul className='ml-4 space-y-1'>
                  {formData.lab_tests.filter((t) => t.urgency === 'stat')
                    .length > 0 && (
                    <li>
                      STAT:{' '}
                      {
                        formData.lab_tests.filter((t) => t.urgency === 'stat')
                          .length
                      }
                    </li>
                  )}
                  {formData.lab_tests.filter((t) => t.urgency === 'urgent')
                    .length > 0 && (
                    <li>
                      Urgent:{' '}
                      {
                        formData.lab_tests.filter((t) => t.urgency === 'urgent')
                          .length
                      }
                    </li>
                  )}
                  {formData.lab_tests.filter((t) => t.urgency === 'routine')
                    .length > 0 && (
                    <li>
                      Routine:{' '}
                      {
                        formData.lab_tests.filter(
                          (t) => t.urgency === 'routine',
                        ).length
                      }
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className='mt-6 flex gap-3 justify-end'>
            <button
              type='button'
              onClick={onCancel}
              className='px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50'
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={
                loading || (!labTestId && formData.lab_tests.length === 0)
              }
            >
              <MdSave size={20} />
              {loading
                ? 'Saving...'
                : labTestId
                  ? 'Update Lab Test'
                  : 'Submit Lab Tests'}
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}
