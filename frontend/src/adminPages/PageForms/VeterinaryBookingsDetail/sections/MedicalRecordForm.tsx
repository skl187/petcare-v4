import { useState, FormEvent, useEffect, useRef } from 'react';
import Form from '../../../../components/form/Form';
import Label from '../../../../components/form/Label';
import DatePickerInput from '../../../../components/form/DatePickerInput/DatePickerInput';
import { MdSave } from 'react-icons/md';
import {
  saveMedicalRecord,
  updateMedicalRecord,
  getMedicalRecordById,
  MedicalRecordPayload,
} from '../../../../services/medicalRecordService';

interface MedicalRecordData {
  id?: string;
  recordDate: string;
  recordType: 'consultation' | 'checkup' | 'emergency' | 'surgery';
  diagnosis: string;
  symptoms: Record<string, string | number>;
  vitalSigns: Record<string, string | number>;
  physicalExamination: string;
  treatmentPlan: string;
  recommendations: string;
  followupRequired: boolean;
  followupDate: string;
  notes: string;
}

interface MedicalRecordFormProps {
  appointmentId?: string;
  petId?: string;
  veterinarianId?: string;
  recordId?: string;
  onSave: (data: MedicalRecordData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function MedicalRecordForm({
  appointmentId = '',
  petId = '',
  veterinarianId = '',
  recordId = '',
  onSave,
  onCancel,
}: MedicalRecordFormProps) {
  // Check if we're in view/edit mode (existing record) or create mode
  const isViewMode = !!recordId && recordId.trim() !== '';
  const [formData, setFormData] = useState<MedicalRecordData>({
    recordDate: new Date().toISOString().slice(0, 16),
    recordType: 'consultation',
    diagnosis: '',
    symptoms: {},
    vitalSigns: {
      temperature: '',
      heartRate: '',
      respiratoryRate: '',
      weight: '',
    },
    physicalExamination: '',
    treatmentPlan: '',
    recommendations: '',
    followupRequired: false,
    followupDate: '',
    notes: '',
  });

  const [symptomsInput, setSymptomsInput] = useState('');
  const [symptomValue, setSymptomValue] = useState('');
  const [vitalSignsInputs, setVitalSignsInputs] = useState({
    temperature: '',
    heartRate: '',
    respiratoryRate: '',
    weight: '',
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
        block: 'start',
      });
    }
  }, [error]);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-dismiss success after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Load medical record data if recordId is provided
  useEffect(() => {
    console.log('recordId changed:', recordId);
    if (recordId && recordId.trim()) {
      console.log('Loading medical record with ID:', recordId);
      loadMedicalRecord();
    }
  }, [recordId]);

  // Log props when component mounts or props change
  useEffect(() => {
    console.log('=== MedicalRecordForm Mounted/Updated ===');
    console.log('MedicalRecordForm props:', {
      appointmentId,
      petId,
      veterinarianId,
      recordId,
    });
    console.log('===================================');
  }, [appointmentId, petId, veterinarianId, recordId]);

  const loadMedicalRecord = async () => {
    setLoading(true);
    setError(null);
    console.log('Starting loadMedicalRecord for ID:', recordId);
    try {
      console.log('Calling getMedicalRecordById with recordId:', recordId);
      const record = await getMedicalRecordById(recordId);
      console.log('Medical record loaded successfully:', record);

      // Format followup_date for datetime-local input (YYYY-MM-DDTHH:MM)
      let formattedFollowupDate = '';
      if (record.followup_date) {
        // API returns: "2026-02-05T18:30:00.000Z"
        // Input needs: "2026-02-05T18:30"
        formattedFollowupDate = record.followup_date.slice(0, 16);
        console.log('Followup date from API:', record.followup_date);
        console.log('Followup date formatted:', formattedFollowupDate);
      }

      setFormData({
        id: record.id,
        recordDate: record.record_date.slice(0, 16),
        recordType: record.record_type as
          | 'consultation'
          | 'checkup'
          | 'emergency'
          | 'surgery',
        diagnosis: record.diagnosis,
        symptoms: record.symptoms || {},
        vitalSigns: record.vital_signs || {},
        physicalExamination: record.physical_examination,
        treatmentPlan: record.treatment_plan,
        recommendations: record.recommendations,
        followupRequired: record.followup_required,
        followupDate: formattedFollowupDate,
        notes: record.notes || '',
      });
      setVitalSignsInputs({
        temperature: (record.vital_signs as any)?.temperature || '',
        heartRate: (record.vital_signs as any)?.heartRate || '',
        respiratoryRate: (record.vital_signs as any)?.respiratoryRate || '',
        weight: (record.vital_signs as any)?.weight || '',
      });
      console.log('✅ Form data updated successfully');
      console.log('✅ Followup required:', record.followup_required);
      console.log('✅ Followup date set to:', formattedFollowupDate);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to load medical record';
      setError(errorMsg);
      console.error('Error loading medical record:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBasicChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleVitalSignChange = (field: string, value: string) => {
    setVitalSignsInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
    setFormData((prev) => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [field]: value,
      },
    }));
  };

  const handleAddSymptom = () => {
    if (symptomsInput.trim() && symptomValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        symptoms: {
          ...prev.symptoms,
          [symptomsInput.trim()]: symptomValue.trim(),
        },
      }));
      setSymptomsInput('');
      setSymptomValue('');
    }
  };

  const handleRemoveSymptom = (key: string) => {
    setFormData((prev) => {
      const newSymptoms = { ...prev.symptoms };
      delete newSymptoms[key];
      return {
        ...prev,
        symptoms: newSymptoms,
      };
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload: MedicalRecordPayload = {
        appointment_id: appointmentId,
        pet_id: petId,
        record_type: formData.recordType,
        diagnosis: formData.diagnosis,
        symptoms: formData.symptoms,
        vital_signs: formData.vitalSigns,
        physical_examination: formData.physicalExamination,
        treatment_plan: formData.treatmentPlan,
        recommendations: formData.recommendations,
        followup_required: formData.followupRequired,
        followup_date: formData.followupDate || undefined,
        notes: formData.notes || undefined,
        is_confidential: false,
      };

      console.log('Sending payload:', payload);

      if (formData.id) {
        // Update existing record
        const response = await updateMedicalRecord(formData.id, payload);
        console.log('Medical record updated:', response);
        setSuccess('Medical record updated successfully!');
      } else {
        // Create new record
        const response = await saveMedicalRecord(payload);
        console.log('Medical record saved:', response);
        setSuccess('Medical record created successfully!');
      }

      // Close form after success
      setTimeout(() => {
        onSave(formData);
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save medical record';
      setError(errorMessage);
      console.error('Error saving medical record:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div
          ref={errorBannerRef}
          className='mb-4 p-4 bg-red-50 border border-red-300 text-red-800 rounded-lg flex items-start gap-3'
        >
          <span className='text-red-600 font-bold text-lg mt-0.5'>✕</span>
          <div>
            <p className='font-semibold text-red-900'>Error</p>
            <p className='text-sm text-red-700 mt-1'>{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className='mb-4 p-4 bg-green-50 border border-green-300 text-green-800 rounded-lg flex items-start gap-3'>
          <span className='text-green-600 font-bold text-lg mt-0.5'>✓</span>
          <div>
            <p className='font-semibold text-green-900'>Success</p>
            <p className='text-sm text-green-700 mt-1'>{success}</p>
          </div>
        </div>
      )}

      {loading && !formData.id && (
        <div className='mb-4 p-4 bg-blue-50 border border-blue-300 text-blue-800 rounded-lg flex items-start gap-3'>
          <span className='text-blue-600 font-bold text-lg mt-0.5'>ⓘ</span>
          <div>
            <p className='font-semibold text-blue-900'>Loading</p>
            <p className='text-sm text-blue-700 mt-1'>
              Loading medical record...
            </p>
          </div>
        </div>
      )}

      <Form onSubmit={handleSubmit} className='space-y-6'>
        {/* Record Metadata */}
        <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
          <h4 className='font-semibold text-gray-900 mb-4'>
            Record Information
          </h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Record Date */}
            <DatePickerInput
              label='Record Date *'
              value={formData.recordDate ? new Date(formData.recordDate) : null}
              onChange={(date) => {
                if (date) {
                  // Format for datetime-local: YYYY-MM-DDTHH:mm
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  handleBasicChange({
                    target: {
                      name: 'recordDate',
                      value: `${year}-${month}-${day}T${hours}:${minutes}`,
                    },
                  } as any);
                }
              }}
              showTimeSelect={true}
              required={true}
            />

            {/* Record Type */}
            <div>
              <Label htmlFor='recordType'>Record Type *</Label>
              <select
                id='recordType'
                name='recordType'
                value={formData.recordType}
                onChange={handleBasicChange}
                disabled={isViewMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                required
              >
                <option value='consultation'>Consultation</option>
                <option value='checkup'>Checkup</option>
                <option value='emergency'>Emergency</option>
                <option value='surgery'>Surgery</option>
              </select>
            </div>
          </div>
        </div>

        {/* Diagnosis */}
        <div>
          <Label htmlFor='diagnosis'>Diagnosis *</Label>
          <textarea
            id='diagnosis'
            name='diagnosis'
            value={formData.diagnosis}
            onChange={handleBasicChange}
            disabled={isViewMode}
            placeholder='Enter detailed diagnosis'
            rows={3}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            required
          />
        </div>

        {/* Symptoms */}
        <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
          <Label className='block mb-4 font-semibold'>Add Symptoms</Label>
          <div className='space-y-3'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <div>
                <label className='block text-xs font-medium text-gray-700 mb-1'>
                  Symptom Name
                </label>
                <input
                  type='text'
                  value={symptomsInput}
                  onChange={(e) => setSymptomsInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSymptom();
                    }
                  }}
                  disabled={isViewMode}
                  placeholder='e.g., itching'
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>
              <div>
                <label className='block text-xs font-medium text-gray-700 mb-1'>
                  Severity/Value
                </label>
                <input
                  type='text'
                  value={symptomValue}
                  onChange={(e) => setSymptomValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSymptom();
                    }
                  }}
                  disabled={isViewMode}
                  placeholder='e.g., severe'
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            </div>
            <button
              type='button'
              onClick={handleAddSymptom}
              disabled={isViewMode}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition ${
                isViewMode ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Add Symptom
            </button>
            {Object.keys(formData.symptoms).length > 0 && (
              <div className='pt-3 border-t border-gray-300'>
                <p className='text-xs font-semibold text-gray-700 mb-2'>
                  Added Symptoms:
                </p>
                <div className='flex flex-wrap gap-2'>
                  {Object.entries(formData.symptoms).map(([key, value]) => (
                    <div
                      key={key}
                      className='bg-white border border-blue-300 text-blue-900 px-3 py-1 rounded-full text-sm flex items-center gap-2'
                    >
                      <span>
                        {key}: {value}
                      </span>
                      <button
                        type='button'
                        onClick={() => handleRemoveSymptom(key)}
                        className='text-blue-600 hover:text-blue-900 font-bold ml-1'
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vital Signs */}
        <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
          <h4 className='font-semibold text-gray-900 mb-4'>Vital Signs</h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='temperature'>Temperature (°F)</Label>
              <input
                type='text'
                id='temperature'
                placeholder='e.g., 102.5°F'
                value={vitalSignsInputs.temperature}
                onChange={(e) =>
                  handleVitalSignChange('temperature', e.target.value)
                }
                disabled={isViewMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
            </div>

            <div>
              <Label htmlFor='heartRate'>Heart Rate (bpm)</Label>
              <input
                type='text'
                id='heartRate'
                placeholder='e.g., 120 bpm'
                value={vitalSignsInputs.heartRate}
                onChange={(e) =>
                  handleVitalSignChange('heartRate', e.target.value)
                }
                disabled={isViewMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
            </div>

            <div>
              <Label htmlFor='respiratoryRate'>
                Respiratory Rate (breaths/min)
              </Label>
              <input
                type='text'
                id='respiratoryRate'
                placeholder='e.g., 28 breaths/min'
                value={vitalSignsInputs.respiratoryRate}
                onChange={(e) =>
                  handleVitalSignChange('respiratoryRate', e.target.value)
                }
                disabled={isViewMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
            </div>

            <div>
              <Label htmlFor='weight'>Weight (kg)</Label>
              <input
                type='text'
                id='weight'
                placeholder='e.g., 25.5 kg'
                value={vitalSignsInputs.weight}
                onChange={(e) =>
                  handleVitalSignChange('weight', e.target.value)
                }
                disabled={isViewMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>
        </div>

        {/* Physical Examination */}
        <div>
          <Label htmlFor='physicalExamination'>Physical Examination *</Label>
          <textarea
            id='physicalExamination'
            name='physicalExamination'
            value={formData.physicalExamination}
            onChange={handleBasicChange}
            disabled={isViewMode}
            placeholder='Enter detailed physical examination findings'
            rows={4}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            required
          />
        </div>

        {/* Treatment Plan */}
        <div>
          <Label htmlFor='treatmentPlan'>Treatment Plan *</Label>
          <textarea
            id='treatmentPlan'
            name='treatmentPlan'
            value={formData.treatmentPlan}
            onChange={handleBasicChange}
            disabled={isViewMode}
            placeholder='Enter treatment plan and medications prescribed'
            rows={4}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            required
          />
        </div>

        {/* Recommendations */}
        <div>
          <Label htmlFor='recommendations'>Recommendations *</Label>
          <textarea
            id='recommendations'
            name='recommendations'
            value={formData.recommendations}
            onChange={handleBasicChange}
            disabled={isViewMode}
            placeholder='Enter care recommendations and discharge instructions'
            rows={4}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            required
          />
        </div>

        {/* Follow-up Section */}
        <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
          <div className='flex items-center gap-3 mb-4'>
            <input
              type='checkbox'
              id='followupRequired'
              name='followupRequired'
              checked={formData.followupRequired}
              onChange={handleBasicChange}
              disabled={isViewMode}
              className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 ${
                isViewMode ? 'cursor-not-allowed' : ''
              }`}
            />
            <Label htmlFor='followupRequired' className='mb-0'>
              Follow-up Required
            </Label>
          </div>

          {formData.followupRequired && (
            <DatePickerInput
              label='Follow-up Date'
              value={
                formData.followupDate ? new Date(formData.followupDate) : null
              }
              onChange={(date) => {
                if (date) {
                  // Format for datetime-local: YYYY-MM-DDTHH:mm
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  handleBasicChange({
                    target: {
                      name: 'followupDate',
                      value: `${year}-${month}-${day}T${hours}:${minutes}`,
                    },
                  } as any);
                }
              }}
            />
          )}
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor='notes'>Additional Notes</Label>
          <textarea
            id='notes'
            name='notes'
            value={formData.notes}
            onChange={handleBasicChange}
            disabled={isViewMode}
            placeholder='Enter any additional notes or observations'
            rows={3}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isViewMode ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          />
        </div>

        {/* Form Actions */}
        <div className='flex gap-3 pt-4 border-t border-gray-200'>
          <button
            type='submit'
            disabled={loading || isViewMode}
            className='flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition'
          >
            <MdSave className='w-5 h-5' />
            {loading
              ? 'Saving...'
              : formData.id
                ? 'Update Record'
                : 'Save Medical Record'}
          </button>
          <button
            type='button'
            onClick={onCancel}
            disabled={loading}
            className='flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-medium transition'
          >
            {isViewMode ? 'Close' : 'Cancel'}
          </button>
        </div>
      </Form>
    </div>
  );
}
