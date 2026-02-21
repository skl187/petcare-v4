import { useState, FormEvent, useEffect, useRef } from 'react';
import Form from '../../../../components/form/Form';
import Label from '../../../../components/form/Label';
import DatePickerInput from '../../../../components/form/DatePickerInput/DatePickerInput';
import { MdSave, MdAdd, MdDelete } from 'react-icons/md';
import {
  saveVaccination,
  updateVaccination,
  getVaccinationById,
  VaccinationPayload,
  Vaccination,
} from '../../../../services/vaccinationService';
// import { formatDate } from '../../../../utils/formatDate';

interface VaccinationData {
  id?: string;
  medical_record_id?: string;
  vaccinations: Vaccination[];
}

interface VaccinationFormProps {
  appointmentId?: string;
  petId?: string;
  veterinarianId?: string;
  medicalRecordId?: string;
  vaccinationId?: string;
  onSave: (data: VaccinationData) => void;
  onCancel: () => void;
}

export default function VaccinationForm({
  appointmentId = '',
  petId = '',
  veterinarianId = '',
  medicalRecordId = '',
  vaccinationId = '',
  onSave,
  onCancel,
}: VaccinationFormProps) {
  const [formData, setFormData] = useState<VaccinationData>({
    medical_record_id: medicalRecordId,
    vaccinations: [],
  });

  const [currentVaccination, setCurrentVaccination] = useState<Vaccination>({
    vaccine_name: '',
    vaccine_type: '',
    manufacturer: '',
    batch_number: '',
    site_of_injection: '',
    next_due_date: '',
    cost: undefined,
    notes: '',
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

  // Load vaccination if vaccinationId is provided
  useEffect(() => {
    console.log('===================================');
    console.log('VaccinationForm useEffect triggered');
    console.log('appointmentId:', appointmentId);
    console.log('petId:', petId);
    console.log('veterinarianId:', veterinarianId);
    console.log('medicalRecordId:', medicalRecordId);
    console.log('vaccinationId:', vaccinationId);
    console.log('===================================');

    if (vaccinationId && vaccinationId.trim() !== '') {
      loadVaccination();
    }
  }, [vaccinationId]);

  const loadVaccination = async () => {
    setLoading(true);
    setError(null);
    console.log('Starting loadVaccination for ID:', vaccinationId);
    try {
      console.log(
        'Calling getVaccinationById with vaccinationId:',
        vaccinationId,
      );
      const vaccination = await getVaccinationById(vaccinationId);
      console.log('Vaccination loaded successfully:', vaccination);

      // API returns flat structure - map directly to currentVaccination
      setCurrentVaccination({
        vaccine_name: (vaccination as any).vaccine_name || '',
        vaccine_type: (vaccination as any).vaccine_type || '',
        manufacturer: (vaccination as any).manufacturer || '',
        batch_number: (vaccination as any).batch_number || '',
        site_of_injection: (vaccination as any).site_of_injection || '',
        next_due_date: (vaccination as any).next_due_date || '',
        cost: (vaccination as any).cost
          ? Number((vaccination as any).cost)
          : undefined,
        notes: (vaccination as any).notes || '',
      });

      setFormData({
        id: vaccination.id,
        medical_record_id: vaccination.medical_record_id,
        vaccinations: [],
      });

      console.log('✅ Form data updated successfully');
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to load vaccination';
      setError(errorMsg);
      console.error('Error loading vaccination:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add vaccination to the array
  const addVaccination = () => {
    if (!currentVaccination.vaccine_name.trim()) {
      setError('Vaccine name is required');
      return;
    }
    if (!currentVaccination.vaccine_type.trim()) {
      setError('Vaccine type is required');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      vaccinations: [...prev.vaccinations, currentVaccination],
    }));

    // Reset current vaccination
    setCurrentVaccination({
      vaccine_name: '',
      vaccine_type: '',
      manufacturer: '',
      batch_number: '',
      site_of_injection: '',
      next_due_date: '',
      cost: undefined,
      notes: '',
    });

    setError(null);
  };

  // Remove vaccination from array
  const removeVaccination = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      vaccinations: prev.vaccinations.filter((_, i) => i !== index),
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setCurrentVaccination((prev) => ({
      ...prev,
      [name]: name === 'cost' ? (value ? parseFloat(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation - in edit mode check currentVaccination, in create mode check array
    if (vaccinationId && vaccinationId.trim() !== '') {
      // Edit mode validation
      if (!currentVaccination.vaccine_name.trim()) {
        setError('Vaccine name is required');
        setLoading(false);
        return;
      }
      if (!currentVaccination.vaccine_type.trim()) {
        setError('Vaccine type is required');
        setLoading(false);
        return;
      }
    } else {
      // Create mode validation
      if (formData.vaccinations.length === 0) {
        setError('Please add at least one vaccination');
        setLoading(false);
        return;
      }
    }

    try {
      if (vaccinationId && vaccinationId.trim() !== '') {
        // Update existing vaccination using PATCH - send single object
        console.log('Updating vaccination:', vaccinationId);
        console.log('Current vaccination:', currentVaccination);

        await updateVaccination(vaccinationId, currentVaccination);

        setSuccess('Vaccination updated successfully!');
      } else {
        // Create new vaccination using POST
        const payload: VaccinationPayload = {
          appointment_id: appointmentId,
          pet_id: petId,
          medical_record_id: formData.medical_record_id,
          vaccinations: formData.vaccinations,
        };

        console.log('Creating new vaccination:', payload);

        await saveVaccination(appointmentId, payload);

        setSuccess('Vaccination saved successfully!');
      }

      setTimeout(() => {
        onSave(formData);
      }, 1000);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to save vaccination';
      setError(errorMsg);
      console.error('Error saving vaccination:', err);
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
          {/* Current Vaccination - Add New Vaccination Section */}
          <div className='bg-teal-50 p-4 rounded-lg border border-teal-200'>
            <h3 className='text-lg font-semibold text-teal-900 mb-4'>
              Add Vaccination
            </h3>

            {/* Basic Information */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='vaccine_name'>Vaccine Name *</Label>
                <input
                  type='text'
                  id='vaccine_name'
                  name='vaccine_name'
                  value={currentVaccination.vaccine_name}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
                  placeholder='e.g., Rabies, DHPP, Bordetella'
                />
              </div>

              <div>
                <Label htmlFor='vaccine_type'>Vaccine Type *</Label>
                <select
                  id='vaccine_type'
                  name='vaccine_type'
                  value={currentVaccination.vaccine_type}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
                >
                  <option value=''>Select type</option>
                  <option value='rabies'>Rabies</option>
                  <option value='combination'>Combination</option>
                  <option value='respiratory'>Respiratory</option>
                  <option value='leptospirosis'>Leptospirosis</option>
                  <option value='lyme'>Lyme Disease</option>
                  <option value='canine_influenza'>Canine Influenza</option>
                  <option value='feline_leukemia'>Feline Leukemia</option>
                  <option value='other'>Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor='manufacturer'>Manufacturer</Label>
                <input
                  type='text'
                  id='manufacturer'
                  name='manufacturer'
                  value={currentVaccination.manufacturer}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
                  placeholder='e.g., Merial, Zoetis, Merck'
                />
              </div>

              <div>
                <Label htmlFor='batch_number'>Batch Number</Label>
                <input
                  type='text'
                  id='batch_number'
                  name='batch_number'
                  value={currentVaccination.batch_number}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
                  placeholder='e.g., RB2026001'
                />
              </div>

              <div>
                <Label htmlFor='site_of_injection'>Site of Injection</Label>
                <input
                  type='text'
                  id='site_of_injection'
                  name='site_of_injection'
                  value={currentVaccination.site_of_injection}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
                  placeholder='e.g., Right hind leg, Intranasal'
                />
              </div>

              <DatePickerInput
                label='Next Due Date'
                value={
                  currentVaccination.next_due_date
                    ? new Date(currentVaccination.next_due_date)
                    : null
                }
                onChange={(date) => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    handleChange({
                      target: {
                        name: 'next_due_date',
                        value: `${year}-${month}-${day}`,
                      },
                    } as any);
                  }
                }}
              />

              <div>
                <Label htmlFor='cost'>Cost ($)</Label>
                <input
                  type='number'
                  id='cost'
                  name='cost'
                  value={currentVaccination.cost || ''}
                  onChange={handleChange}
                  step='0.01'
                  min='0'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
                  placeholder='0.00'
                />
              </div>
            </div>

            {/* Notes */}
            <div className='mt-4'>
              <Label htmlFor='notes'>Notes</Label>
              <textarea
                id='notes'
                name='notes'
                value={currentVaccination.notes}
                onChange={handleChange}
                rows={3}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
                placeholder='Additional notes or observations'
              />
            </div>

            {/* Add Vaccination Button - Only show in create mode */}
            {!vaccinationId && (
              <div className='flex justify-end mt-4'>
                <button
                  type='button'
                  onClick={addVaccination}
                  className='flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500'
                >
                  <MdAdd size={20} />
                  Add Vaccination
                </button>
              </div>
            )}
          </div>

          {/* Added Vaccinations List - Only show in create mode */}
          {!vaccinationId && formData.vaccinations.length > 0 && (
            <div className='mt-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Added Vaccinations ({formData.vaccinations.length})
              </h3>
              <div className='space-y-3'>
                {formData.vaccinations.map((vaccination, index) => (
                  <div
                    key={index}
                    className='bg-white border border-teal-200 rounded-lg p-4'
                  >
                    <div className='flex justify-between items-start'>
                      <div className='flex-1 space-y-2'>
                        <div className='flex items-center gap-2'>
                          <h4 className='font-semibold text-gray-900'>
                            {vaccination.vaccine_name}
                          </h4>
                          <span className='px-2 py-1 text-xs font-medium bg-teal-100 text-teal-800 rounded'>
                            {vaccination.vaccine_type}
                          </span>
                        </div>
                        <div className='text-sm text-gray-600 space-y-1'>
                          {vaccination.manufacturer && (
                            <p>
                              <span className='font-medium'>Manufacturer:</span>{' '}
                              {vaccination.manufacturer}
                            </p>
                          )}
                          {vaccination.batch_number && (
                            <p>
                              <span className='font-medium'>Batch:</span>{' '}
                              {vaccination.batch_number}
                            </p>
                          )}
                          {vaccination.site_of_injection && (
                            <p>
                              <span className='font-medium'>Site:</span>{' '}
                              {vaccination.site_of_injection}
                            </p>
                          )}
                          {vaccination.next_due_date && (
                            <p>
                              <span className='font-medium'>Next Due:</span>{' '}
                              {new Date(
                                vaccination.next_due_date,
                              ).toLocaleDateString()}
                            </p>
                          )}
                          {vaccination.cost != null && (
                            <p>
                              <span className='font-medium'>Cost:</span> $
                              {typeof vaccination.cost === 'number'
                                ? vaccination.cost.toFixed(2)
                                : Number(vaccination.cost).toFixed(2)}
                            </p>
                          )}
                          {vaccination.notes && (
                            <p>
                              <span className='font-medium'>Notes:</span>{' '}
                              {vaccination.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type='button'
                        onClick={() => removeVaccination(index)}
                        className='ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg'
                      >
                        <MdDelete size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Section */}
          {formData.vaccinations.length > 0 && (
            <div className='mt-6 bg-teal-50 border border-teal-200 rounded-lg p-4'>
              <h4 className='font-semibold text-teal-900 mb-2'>
                VACCINATION SUMMARY
              </h4>
              <div className='text-sm text-teal-800 space-y-1'>
                <p>
                  <span className='font-medium'>Total Vaccinations:</span>{' '}
                  {formData.vaccinations.length}
                </p>
                <p>
                  <span className='font-medium'>Total Cost:</span> $
                  {formData.vaccinations
                    .reduce(
                      (sum, vac) =>
                        sum +
                        (typeof vac.cost === 'number'
                          ? vac.cost
                          : Number(vac.cost || 0)),
                      0,
                    )
                    .toFixed(2)}
                </p>
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
              className='flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={
                loading ||
                (!vaccinationId && formData.vaccinations.length === 0)
              }
            >
              <MdSave size={20} />
              {loading
                ? 'Saving...'
                : vaccinationId
                  ? 'Update Vaccination'
                  : 'Submit Vaccinations'}
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}
