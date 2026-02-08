import { useState, FormEvent, useEffect, useRef } from 'react';
import Form from '../../../../../components/form/Form';
import Label from '../../../../../components/form/Label';
import { MdSave, MdAdd, MdDelete } from 'react-icons/md';
import {
  savePrescription,
  updatePrescription,
  getPrescriptionById,
  PrescriptionPayload,
  Medication,
} from '../../../../../services/prescriptionService';

interface PrescriptionData {
  id?: string;
  medical_record_id?: string;
  valid_until?: string;
  notes: string;
  medications: Medication[];
}

interface PrescriptionFormProps {
  appointmentId?: string;
  petId?: string;
  veterinarianId?: string;
  medicalRecordId?: string;
  prescriptionId?: string;
  onSave: (data: PrescriptionData) => void;
  onCancel: () => void;
}

export default function PrescriptionForm({
  appointmentId = '',
  petId = '',
  veterinarianId = '',
  medicalRecordId = '',
  prescriptionId = '',
  onSave,
  onCancel,
}: PrescriptionFormProps) {
  const [formData, setFormData] = useState<PrescriptionData>({
    medical_record_id: medicalRecordId,
    valid_until: '',
    notes: '',
    medications: [],
  });

  const [currentMedication, setCurrentMedication] = useState<Medication>({
    medication_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    route: '',
    instructions: '',
    quantity: '',
    refills_allowed: 0,
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

  // Load prescription if prescriptionId is provided
  useEffect(() => {
    console.log('===================================');
    console.log('PrescriptionForm useEffect triggered');
    console.log('appointmentId:', appointmentId);
    console.log('petId:', petId);
    console.log('veterinarianId:', veterinarianId);
    console.log('medicalRecordId:', medicalRecordId);
    console.log('prescriptionId:', prescriptionId);
    console.log('===================================');

    if (prescriptionId && prescriptionId.trim() !== '') {
      loadPrescription();
    }
  }, [prescriptionId]);

  const loadPrescription = async () => {
    setLoading(true);
    setError(null);
    console.log('Starting loadPrescription for ID:', prescriptionId);
    try {
      console.log(
        'Calling getPrescriptionById with prescriptionId:',
        prescriptionId,
      );
      const prescription = await getPrescriptionById(prescriptionId);
      console.log('Prescription loaded successfully:', prescription);

      // Format valid_until for datetime-local input
      let formattedValidUntil = '';
      if (prescription.valid_until) {
        formattedValidUntil = prescription.valid_until.slice(0, 16);
        console.log('Valid until from API:', prescription.valid_until);
        console.log('Valid until formatted:', formattedValidUntil);
      }

      setFormData({
        id: prescription.id,
        medical_record_id: prescription.medical_record_id,
        valid_until: formattedValidUntil,
        notes: prescription.notes || '',
        medications: prescription.medications || [],
      });

      console.log('✅ Form data updated successfully');
      console.log(
        '✅ Medications count:',
        prescription.medications?.length || 0,
      );
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to load prescription';
      setError(errorMsg);
      console.error('Error loading prescription:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBasicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleMedicationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setCurrentMedication((prev) => ({
      ...prev,
      [name]: name === 'refills_allowed' ? parseInt(value) || 0 : value,
    }));
  };

  const addMedication = () => {
    if (
      !currentMedication.medication_name ||
      !currentMedication.dosage ||
      !currentMedication.frequency ||
      !currentMedication.duration
    ) {
      setError(
        'Please fill in required medication fields: name, dosage, frequency, and duration',
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      medications: [...prev.medications, currentMedication],
    }));

    // Reset current medication
    setCurrentMedication({
      medication_name: '',
      dosage: '',
      frequency: '',
      duration: '',
      route: '',
      instructions: '',
      quantity: '',
      refills_allowed: 0,
    });

    setError(null);
    setSuccess('Medication added successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  const removeMedication = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.medications.length === 0) {
      setError('Please add at least one medication');
      setLoading(false);
      return;
    }

    try {
      if (prescriptionId && prescriptionId.trim() !== '') {
        // Update existing prescription using PATCH
        console.log('Updating prescription:', prescriptionId);
        console.log('Medications:', formData.medications);

        await updatePrescription(prescriptionId, formData.medications);

        setSuccess('Prescription updated successfully!');
      } else {
        // Create new prescription using POST
        const payload: PrescriptionPayload = {
          appointment_id: appointmentId,
          pet_id: petId,
          medical_record_id: formData.medical_record_id,
          valid_until: formData.valid_until || undefined,
          notes: formData.notes || undefined,
          medications: formData.medications,
        };

        console.log('Creating new prescription:', payload);

        await savePrescription(appointmentId, payload);

        setSuccess('Prescription saved successfully!');
      }

      setTimeout(() => {
        onSave(formData);
      }, 1000);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to save prescription';
      setError(errorMsg);
      console.error('Error saving prescription:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-4xl mx-auto'>
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
          {/* Basic Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='medical_record_id'>Medical Record ID</Label>
              <input
                type='text'
                id='medical_record_id'
                name='medical_record_id'
                value={formData.medical_record_id}
                onChange={handleBasicChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Optional'
              />
            </div>

            <div>
              <Label htmlFor='valid_until'>Valid Until</Label>
              <input
                type='datetime-local'
                id='valid_until'
                name='valid_until'
                value={formData.valid_until}
                onChange={handleBasicChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor='notes'>Prescription Notes</Label>
            <textarea
              id='notes'
              name='notes'
              value={formData.notes}
              onChange={handleBasicChange}
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Additional notes for this prescription...'
            />
          </div>

          {/* Medications Section */}
          <div className='border-t pt-6'>
            <h3 className='text-lg font-semibold mb-4'>Medications</h3>

            {/* Add New Medication Form */}
            <div className='bg-gray-50 p-4 rounded-lg mb-4'>
              <h4 className='font-medium mb-3'>Add Medication</h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='medication_name'>Medication Name *</Label>
                  <input
                    type='text'
                    id='medication_name'
                    name='medication_name'
                    value={currentMedication.medication_name}
                    onChange={handleMedicationChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='e.g., Amoxicillin'
                  />
                </div>

                <div>
                  <Label htmlFor='dosage'>Dosage *</Label>
                  <input
                    type='text'
                    id='dosage'
                    name='dosage'
                    value={currentMedication.dosage}
                    onChange={handleMedicationChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='e.g., 250mg'
                  />
                </div>

                <div>
                  <Label htmlFor='frequency'>Frequency *</Label>
                  <input
                    type='text'
                    id='frequency'
                    name='frequency'
                    value={currentMedication.frequency}
                    onChange={handleMedicationChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='e.g., Twice daily'
                  />
                </div>

                <div>
                  <Label htmlFor='duration'>Duration *</Label>
                  <input
                    type='text'
                    id='duration'
                    name='duration'
                    value={currentMedication.duration}
                    onChange={handleMedicationChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='e.g., 7 days'
                  />
                </div>

                <div>
                  <Label htmlFor='route'>Route</Label>
                  <input
                    type='text'
                    id='route'
                    name='route'
                    value={currentMedication.route}
                    onChange={handleMedicationChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='e.g., oral'
                  />
                </div>

                <div>
                  <Label htmlFor='quantity'>Quantity</Label>
                  <input
                    type='text'
                    id='quantity'
                    name='quantity'
                    value={currentMedication.quantity}
                    onChange={handleMedicationChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='e.g., 14 tablets/mL'
                  />
                </div>

                <div>
                  <Label htmlFor='refills_allowed'>Refills Allowed</Label>
                  <input
                    type='number'
                    id='refills_allowed'
                    name='refills_allowed'
                    value={currentMedication.refills_allowed}
                    onChange={handleMedicationChange}
                    min='0'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                <div className='md:col-span-2'>
                  <Label htmlFor='instructions'>Instructions for Owner</Label>
                  <textarea
                    id='instructions'
                    name='instructions'
                    value={currentMedication.instructions}
                    onChange={handleMedicationChange}
                    rows={2}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='e.g., Give with food if stomach upset occurs'
                  />
                </div>
              </div>

              <button
                type='button'
                onClick={addMedication}
                className='mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
              >
                <MdAdd size={20} />
                Add Medication
              </button>
            </div>

            {/* Medications List */}
            {formData.medications.length > 0 && (
              <div className='space-y-3'>
                <h4 className='font-medium'>
                  Added Medications ({formData.medications.length})
                </h4>
                {formData.medications.map((med, index) => (
                  <div
                    key={index}
                    className='bg-white border border-gray-200 rounded-lg p-4'
                  >
                    <div className='flex justify-between items-start mb-2'>
                      <div>
                        <h5 className='font-semibold text-lg'>
                          {med.medication_name}
                        </h5>
                        <p className='text-sm text-gray-500'>
                          Prescription #{index + 1}
                        </p>
                      </div>
                      <button
                        type='button'
                        onClick={() => removeMedication(index)}
                        className='text-red-500 hover:text-red-700'
                      >
                        <MdDelete size={20} />
                      </button>
                    </div>

                    <div className='grid grid-cols-2 gap-4 text-sm'>
                      <div>
                        <p className='text-gray-500 uppercase text-xs'>
                          DOSAGE
                        </p>
                        <p className='font-semibold'>{med.dosage}</p>
                      </div>
                      <div>
                        <p className='text-gray-500 uppercase text-xs'>
                          FREQUENCY
                        </p>
                        <p className='font-semibold'>{med.frequency}</p>
                      </div>
                      <div>
                        <p className='text-gray-500 uppercase text-xs'>
                          DURATION
                        </p>
                        <p className='font-semibold'>{med.duration}</p>
                      </div>
                      <div>
                        <p className='text-gray-500 uppercase text-xs'>ROUTE</p>
                        <p className='font-semibold'>{med.route || '-'}</p>
                      </div>
                    </div>

                    {med.instructions && (
                      <div className='mt-3'>
                        <p className='text-gray-500 uppercase text-xs mb-1'>
                          Instructions for Owner
                        </p>
                        <p className='text-sm bg-blue-50 p-2 rounded'>
                          {med.instructions}
                        </p>
                      </div>
                    )}

                    <div className='grid grid-cols-2 gap-4 mt-3 text-sm'>
                      <div>
                        <p className='text-gray-500 uppercase text-xs'>
                          QUANTITY
                        </p>
                        <p className='font-semibold'>{med.quantity || '-'}</p>
                      </div>
                      <div>
                        <p className='text-gray-500 uppercase text-xs'>
                          REFILLS ALLOWED
                        </p>
                        <p className='font-semibold'>
                          {med.refills_allowed || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Prescription Summary */}
            {formData.medications.length > 0 && (
              <div className='mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <h4 className='font-semibold text-blue-900 mb-2'>
                  PRESCRIPTION SUMMARY
                </h4>
                <div className='text-sm text-blue-800'>
                  <p>
                    <span className='font-medium'>Total Medications:</span>{' '}
                    {formData.medications.length}
                  </p>
                  <p>
                    <span className='font-medium'>Prescription Type:</span>{' '}
                    Standard prescription
                  </p>
                  <p>
                    <span className='font-medium'>Status:</span> Ready to create
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end gap-3 pt-4 border-t'>
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
              className='flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={loading || formData.medications.length === 0}
            >
              <MdSave size={20} />
              {loading ? 'Saving...' : 'Save Prescription'}
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}
