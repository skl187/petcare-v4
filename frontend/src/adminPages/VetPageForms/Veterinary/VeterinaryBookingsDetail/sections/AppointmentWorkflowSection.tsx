import { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdClose } from 'react-icons/md';
import { AppointmentDetail } from '../VeterinaryBookingsDetail';
import MedicalRecordForm from './MedicalRecordForm';
import { formatDate, formatTime, formatDateTime } from '../../../../../utils/formatDate';
import PrescriptionForm from './PrescriptionForm';
import LabTestForm from './LabTestForm';
import VaccinationForm from './VaccinationForm';
import {
  getMedicalRecordById,
  MedicalRecordDetail,
} from '../../../../../services/medicalRecordService';
import {
  getPrescriptionById,
  PrescriptionDetail,
} from '../../../../../services/prescriptionService';
import {
  getLabTestById,
  LabTestDetail,
} from '../../../../../services/labTestService';
import { VaccinationDetail } from '../../../../../services/vaccinationService';

interface AppointmentWorkflowSectionProps {
  appointment: AppointmentDetail;
  activeTab: 'medical-record' | 'prescriptions' | 'lab-tests' | 'vaccinations';
  onTabChange: (
    tab: 'medical-record' | 'prescriptions' | 'lab-tests' | 'vaccinations',
  ) => void;
  onRefreshAppointment?: () => void;
  readOnly?: boolean;
}

export default function AppointmentWorkflowSection({
  appointment,
  activeTab,
  onTabChange,
  onRefreshAppointment,
  readOnly = false,
}: AppointmentWorkflowSectionProps) {
  const [showMedicalRecordModal, setShowMedicalRecordModal] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecordDetail[]>(
    [],
  );

  // Prescription state
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [editingPrescriptionId, setEditingPrescriptionId] = useState<
    string | null
  >(null);
  const [prescriptions, setPrescriptions] = useState<PrescriptionDetail[]>([]);

  // Lab test state
  const [showLabTestModal, setShowLabTestModal] = useState(false);
  const [editingLabTestId, setEditingLabTestId] = useState<string | null>(null);
  const [labTests, setLabTests] = useState<LabTestDetail[]>([]);

  // Vaccination state
  const [showVaccinationModal, setShowVaccinationModal] = useState(false);
  const [editingVaccinationId, setEditingVaccinationId] = useState<
    string | null
  >(null);
  const [vaccinations, setVaccinations] = useState<VaccinationDetail[]>([]);

  // Load medical records from appointment data
  useEffect(() => {
    console.log('🚀 === AppointmentWorkflowSection useEffect START ===');
    console.log('🚀 appointment.id:', appointment.id);
    console.log('🚀 appointment object:', appointment);
    console.log(
      '🚀 appointment.vaccinations exists?:',
      !!appointment.vaccinations,
    );
    console.log('🚀 appointment.vaccinations value:', appointment.vaccinations);
    console.log('=== AppointmentWorkflowSection useEffect triggered ===');
    console.log('appointment:', appointment);
    console.log('appointment.medical_records:', appointment.medical_records);

    // Load medical records
    if (
      appointment.medical_records &&
      Array.isArray(appointment.medical_records) &&
      appointment.medical_records.length > 0
    ) {
      console.log(
        '✅ Found medical records:',
        appointment.medical_records.length,
      );

      const loadMedicalRecords = async () => {
        const recordsData: MedicalRecordDetail[] = [];

        for (const record of appointment.medical_records!) {
          console.log('🔄 Processing record:', record.id);
          try {
            console.log(
              '📡 About to call getMedicalRecordById with ID:',
              record.id,
            );
            const fullRecord = await getMedicalRecordById(record.id);
            console.log('✅ Got full record:', fullRecord.id);
            recordsData.push(fullRecord);
          } catch (error) {
            console.error('❌ Failed to fetch record', record.id, ':', error);
          }
        }

        console.log('🎉 Loaded all records. Count:', recordsData.length);
        setMedicalRecords(recordsData);
      };

      loadMedicalRecords();
    } else {
      console.log('❌ medical_records is not available or empty');
      setMedicalRecords([]);
    }

    // Load prescriptions
    if (appointment.prescriptions && Array.isArray(appointment.prescriptions)) {
      console.log('✅ Found prescriptions:', appointment.prescriptions.length);
      const loadPrescriptions = async () => {
        const prescriptionsData: PrescriptionDetail[] = [];
        for (const prescription of appointment.prescriptions!) {
          console.log('🔄 Processing prescription:', prescription.id);
          try {
            const fullPrescription = await getPrescriptionById(prescription.id);
            console.log('✅ Got full prescription:', fullPrescription.id);
            prescriptionsData.push(fullPrescription);
          } catch (error) {
            console.error(
              '❌ Failed to fetch prescription',
              prescription.id,
              ':',
              error,
            );
          }
        }
        console.log(
          '🎉 Loaded all prescriptions. Count:',
          prescriptionsData.length,
        );
        setPrescriptions(prescriptionsData);
      };
      loadPrescriptions();
    }

    // Load lab tests
    if (appointment.lab_tests && Array.isArray(appointment.lab_tests)) {
      console.log('✅ Found lab tests:', appointment.lab_tests.length);
      const loadLabTests = async () => {
        const labTestsData: LabTestDetail[] = [];
        for (const labTest of appointment.lab_tests!) {
          console.log('🔄 Processing lab test:', labTest.id);
          try {
            const singleLabTest = await getLabTestById(labTest.id);
            console.log('✅ Got full lab test:', singleLabTest.id);
            // Convert SingleLabTestResponse to LabTestDetail format
            const labTestDetail: LabTestDetail = {
              id: singleLabTest.id,
              medical_record_id: singleLabTest.medical_record_id,
              appointment_id: singleLabTest.appointment_id,
              pet_id: singleLabTest.pet_id,
              lab_tests: [
                {
                  test_name: singleLabTest.test_name,
                  test_type: singleLabTest.test_type,
                  lab_name: singleLabTest.lab_name,
                  urgency: singleLabTest.urgency,
                  cost:
                    singleLabTest.cost != null
                      ? Number(singleLabTest.cost)
                      : undefined,
                  normal_range: singleLabTest.normal_range,
                },
              ],
            };
            labTestsData.push(labTestDetail);
          } catch (error) {
            console.error(
              '❌ Failed to fetch lab test',
              labTest.id,
              ':',
              error,
            );
          }
        }
        console.log('🎉 Loaded all lab tests. Count:', labTestsData.length);
        setLabTests(labTestsData);
      };
      loadLabTests();
    }
  }, [appointment.id]);

  // Load vaccinations independently - runs in separate useEffect
  useEffect(() => {
    console.log('🔵 === VACCINATION useEffect START (INDEPENDENT) ===');
    console.log('🔍 appointment.vaccinations:', appointment.vaccinations);
    console.log('� === REACHED VACCINATION LOADING CODE ===');
    console.log(
      '🔍 Checking vaccinations in appointment:',
      appointment.vaccinations,
    );
    console.log('🔍 Is array?:', Array.isArray(appointment.vaccinations));
    console.log('🔍 Length:', appointment.vaccinations?.length);
    if (
      appointment.vaccinations &&
      Array.isArray(appointment.vaccinations) &&
      appointment.vaccinations.length > 0
    ) {
      console.log('✅ Found vaccinations:', appointment.vaccinations.length);
      console.log(
        '📦 Vaccination data from appointment:',
        JSON.stringify(appointment.vaccinations, null, 2),
      );

      // Transform flat vaccination data to VaccinationDetail format
      const vaccinationsData: VaccinationDetail[] =
        appointment.vaccinations.map((vaccination) => {
          console.log('🔄 Processing vaccination ID:', vaccination.id);
          console.log(
            '📦 Full vaccination object:',
            JSON.stringify(vaccination, null, 2),
          );

          // Check if already in nested format
          if (
            'vaccinations' in vaccination &&
            Array.isArray((vaccination as any).vaccinations)
          ) {
            console.log('✅ Vaccination already in nested format');
            return vaccination as any as VaccinationDetail;
          }

          // Transform flat structure to nested VaccinationDetail format
          const vaccinationDetail: VaccinationDetail = {
            id: vaccination.id,
            medical_record_id: (vaccination as any).medical_record_id,
            appointment_id:
              (vaccination as any).appointment_id || appointment.id,
            pet_id: (vaccination as any).pet_id || appointment.petId,
            veterinarian_id: (vaccination as any).veterinarian_id,
            vaccinations: [
              {
                vaccine_name:
                  (vaccination as any).vaccine_name ||
                  vaccination.vaccine_name ||
                  '',
                vaccine_type:
                  (vaccination as any).vaccine_type ||
                  vaccination.vaccine_type ||
                  '',
                manufacturer: (vaccination as any).manufacturer || null,
                batch_number: (vaccination as any).batch_number || null,
                site_of_injection:
                  (vaccination as any).site_of_injection || null,
                next_due_date: (vaccination as any).next_due_date || null,
                cost:
                  (vaccination as any).cost != null
                    ? Number((vaccination as any).cost)
                    : undefined,
                notes: (vaccination as any).notes || null,
              },
            ],
          };

          console.log(
            '✅ Transformed vaccination:',
            JSON.stringify(vaccinationDetail, null, 2),
          );
          return vaccinationDetail;
        });

      console.log(
        '🎉 ALL vaccinations transformed. Count:',
        vaccinationsData.length,
      );
      console.log(
        '📦 Final vaccinations data:',
        JSON.stringify(vaccinationsData, null, 2),
      );
      setVaccinations(vaccinationsData);
    } else {
      console.log('❌ No vaccinations found in appointment');
      setVaccinations([]);
    }
  }, [appointment.id, appointment.vaccinations]);

  const handleCreateMedicalRecord = () => {
    setEditingRecordId(null);
    setShowMedicalRecordModal(true);
  };

  const handleEditMedicalRecord = (recordId: string) => {
    console.log('Edit medical record clicked with ID:', recordId);
    setEditingRecordId(recordId);
    setShowMedicalRecordModal(true);
  };

  const handleSaveMedicalRecord = async () => {
    setShowMedicalRecordModal(false);
    setEditingRecordId(null);
    // Refresh appointment data to reload medical records
    if (onRefreshAppointment) {
      onRefreshAppointment();
    }
  };

  const handleCancelMedicalRecord = () => {
    setShowMedicalRecordModal(false);
    setEditingRecordId(null);
  };

  const handleCreatePrescription = () => {
    setEditingPrescriptionId(null);
    setShowPrescriptionModal(true);
  };

  const handleEditPrescription = (prescriptionId: string) => {
    console.log('Edit prescription clicked with ID:', prescriptionId);
    setEditingPrescriptionId(prescriptionId);
    setShowPrescriptionModal(true);
  };

  const handleSavePrescription = async () => {
    setShowPrescriptionModal(false);
    setEditingPrescriptionId(null);
    if (onRefreshAppointment) {
      onRefreshAppointment();
    }
  };

  const handleCancelPrescription = () => {
    setShowPrescriptionModal(false);
    setEditingPrescriptionId(null);
  };

  const handleCreateLabTest = () => {
    setEditingLabTestId(null);
    setShowLabTestModal(true);
  };

  const handleEditLabTest = (labTestId: string) => {
    console.log('Edit lab test clicked with ID:', labTestId);
    setEditingLabTestId(labTestId);
    setShowLabTestModal(true);
  };

  const handleSaveLabTest = async () => {
    setShowLabTestModal(false);
    setEditingLabTestId(null);
    if (onRefreshAppointment) {
      onRefreshAppointment();
    }
  };

  const handleCancelLabTest = () => {
    setShowLabTestModal(false);
    setEditingLabTestId(null);
  };

  const handleOrderLabTest = () => {
    handleCreateLabTest();
  };

  const handleCreateVaccination = () => {
    setEditingVaccinationId(null);
    setShowVaccinationModal(true);
  };

  const handleEditVaccination = (vaccinationId: string) => {
    setEditingVaccinationId(vaccinationId);
    setShowVaccinationModal(true);
  };

  const handleSaveVaccination = () => {
    setShowVaccinationModal(false);
    setEditingVaccinationId(null);
    if (onRefreshAppointment) {
      onRefreshAppointment();
    }
  };

  const handleCancelVaccination = () => {
    setShowVaccinationModal(false);
    setEditingVaccinationId(null);
  };

  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      <h2 className='text-lg font-bold text-gray-900 mb-6'>
        APPOINTMENT WORKFLOW
      </h2>

      {/* Tabs */}
      <div className='flex gap-4 border-b border-gray-200 mb-6 overflow-x-auto'>
        <button
          onClick={() => onTabChange('medical-record')}
          className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition ${
            activeTab === 'medical-record'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Medical Record
        </button>
        <button
          onClick={() => onTabChange('prescriptions')}
          className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition ${
            activeTab === 'prescriptions'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Prescriptions
        </button>
        <button
          onClick={() => onTabChange('lab-tests')}
          className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition ${
            activeTab === 'lab-tests'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Lab Tests
        </button>
        <button
          onClick={() => onTabChange('vaccinations')}
          className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition ${
            activeTab === 'vaccinations'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Vaccinations
        </button>
      </div>

      {/* Tab Content */}
      <div className='space-y-6'>
        {activeTab === 'medical-record' && (
          <div>
            {medicalRecords.length === 0 && (
              <div className='mb-6'>
                <h3 className='text-sm font-semibold text-gray-600 mb-2'>
                  Subjective, Objective, Assessment, Plan (SOAP)
                </h3>
                {!readOnly && (
                  <button
                    onClick={handleCreateMedicalRecord}
                    className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition'
                  >
                    <MdAdd className='w-5 h-5' />
                    Create Medical Record
                  </button>
                )}
                {readOnly && medicalRecords.length === 0 && (
                  <p className='text-gray-500 text-sm'>
                    No medical records available
                  </p>
                )}
              </div>
            )}

            {medicalRecords.length > 0 && (
              <div className='space-y-4'>
                {medicalRecords.map((record, index) => {
                  console.log('Displaying medical record:', record);
                  return (
                    <div
                      key={record.id || index}
                      className='bg-blue-50 rounded-lg p-4 border border-blue-200'
                    >
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                        <div>
                          <p className='text-xs text-gray-600 font-semibold'>
                            DATE
                          </p>
                          <p className='text-sm text-gray-900'>
                            {formatDateTime(record.record_date)}
                          </p>
                        </div>
                        <div>
                          <p className='text-xs text-gray-600 font-semibold'>
                            TYPE
                          </p>
                          <p className='text-sm text-gray-900 capitalize'>
                            {record.record_type}
                          </p>
                        </div>
                      </div>

                      <div className='mb-4'>
                        <p className='text-xs text-gray-600 font-semibold mb-1'>
                          DIAGNOSIS
                        </p>
                        <p className='text-sm text-gray-700'>
                          {record.diagnosis}
                        </p>
                      </div>

                      {Object.keys(record.symptoms).length > 0 && (
                        <div className='mb-4'>
                          <p className='text-xs text-gray-600 font-semibold mb-2'>
                            SYMPTOMS
                          </p>
                          <div className='flex flex-wrap gap-2'>
                            {Object.entries(record.symptoms).map(
                              ([key, value]) => (
                                <span
                                  key={key}
                                  className='bg-white text-blue-700 text-xs px-2 py-1 rounded border border-blue-200'
                                >
                                  {key}: {value}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      <div className='mb-4'>
                        <p className='text-xs text-gray-600 font-semibold mb-1'>
                          PHYSICAL EXAMINATION
                        </p>
                        <p className='text-sm text-gray-700'>
                          {record.physical_examination}
                        </p>
                      </div>

                      <div className='mb-4'>
                        <p className='text-xs text-gray-600 font-semibold mb-1'>
                          TREATMENT PLAN
                        </p>
                        <p className='text-sm text-gray-700'>
                          {record.treatment_plan}
                        </p>
                      </div>

                      <div className='mb-4'>
                        <p className='text-xs text-gray-600 font-semibold mb-1'>
                          RECOMMENDATIONS
                        </p>
                        <p className='text-sm text-gray-700'>
                          {record.recommendations}
                        </p>
                      </div>

                      {record.followup_required && (
                        <div className='mb-4'>
                          <p className='text-xs text-gray-600 font-semibold mb-1'>
                            FOLLOW-UP DATE
                          </p>
                          <p className='text-sm text-gray-700'>
                            {record.followup_date && formatDate(record.followup_date)}
                          </p>
                        </div>
                      )}

                      {record.notes && (
                        <div className='mb-4'>
                          <p className='text-xs text-gray-600 font-semibold mb-1'>
                            NOTES
                          </p>
                          <p className='text-sm text-gray-700'>
                            {record.notes}
                          </p>
                        </div>
                      )}

                      {!readOnly && (
                        <div className='flex gap-2 pt-4 border-t border-blue-200'>
                          <button
                            onClick={() =>
                              record.id && handleEditMedicalRecord(record.id)
                            }
                            className='flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition'
                          >
                            <MdEdit className='w-4 h-4' />
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div>
            {!readOnly && (
              <div className='mb-6'>
                <button
                  onClick={handleCreatePrescription}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition'
                >
                  <MdAdd className='w-5 h-5' />
                  Add Prescription
                </button>
              </div>
            )}

            {prescriptions.length === 0 && (
              <div className='mb-6'>
                <h3 className='text-sm font-semibold text-gray-600 mb-2'>
                  No prescriptions created yet
                </h3>
                {readOnly && (
                  <p className='text-gray-500 text-sm'>
                    No prescriptions available
                  </p>
                )}
              </div>
            )}

            {prescriptions.length > 0 && (
              <div className='space-y-4'>
                {prescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    className='bg-purple-50 rounded-lg p-4 border border-purple-200'
                  >
                    <div className='mb-4'>
                      <h4 className='font-semibold text-lg mb-1'>
                        Prescription
                      </h4>
                      {prescription.valid_until && (
                        <p className='text-sm text-gray-600'>
                          Valid Until:{' '}
                          {formatDateTime(prescription.valid_until)}
                        </p>
                      )}
                    </div>

                    <div className='mb-4'>
                      <p className='text-xs text-gray-600 font-semibold mb-2'>
                        MEDICATIONS ({prescription.medications.length})
                      </p>
                      <div className='space-y-2'>
                        {prescription.medications.map((med, idx) => (
                          <div
                            key={idx}
                            className='bg-white rounded p-3 border border-purple-100'
                          >
                            <p className='font-medium text-gray-900'>
                              {med.medication_name}
                            </p>
                            <div className='grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600'>
                              <p>
                                <span className='font-medium'>Dosage:</span>{' '}
                                {med.dosage}
                              </p>
                              <p>
                                <span className='font-medium'>Frequency:</span>{' '}
                                {med.frequency}
                              </p>
                              <p>
                                <span className='font-medium'>Duration:</span>{' '}
                                {med.duration}
                              </p>
                              <p>
                                <span className='font-medium'>Route:</span>{' '}
                                {med.route || '-'}
                              </p>
                            </div>
                            {med.instructions && (
                              <p className='mt-2 text-sm text-gray-700 bg-blue-50 p-2 rounded'>
                                {med.instructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {prescription.notes && (
                      <div className='mb-4'>
                        <p className='text-xs text-gray-600 font-semibold mb-1'>
                          NOTES
                        </p>
                        <p className='text-sm text-gray-700'>
                          {prescription.notes}
                        </p>
                      </div>
                    )}

                    {!readOnly && (
                      <div className='flex gap-2 pt-4 border-t border-purple-200'>
                        <button
                          onClick={() =>
                            handleEditPrescription(prescription.id)
                          }
                          className='flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition'
                        >
                          <MdEdit className='w-4 h-4' />
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'lab-tests' && (
          <div>
            {!readOnly && (
              <div className='mb-6'>
                <button
                  onClick={handleOrderLabTest}
                  className='bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition'
                >
                  <MdAdd className='w-5 h-5' />
                  Add Lab Test
                </button>
              </div>
            )}

            {labTests.length === 0 && (
              <div className='mb-6'>
                <h3 className='text-sm font-semibold text-gray-600 mb-2'>
                  No lab tests ordered yet
                </h3>
                {readOnly && (
                  <p className='text-gray-500 text-sm'>
                    No lab tests available
                  </p>
                )}
              </div>
            )}

            {labTests.length > 0 && (
              <div className='space-y-4'>
                {labTests.map((labTestDetail) => (
                  <div key={labTestDetail.id}>
                    {labTestDetail.lab_tests.map((test, index) => (
                      <div
                        key={`${labTestDetail.id}-${index}`}
                        className='bg-purple-50 rounded-lg p-4 border border-purple-200 mb-4'
                      >
                        <div className='flex justify-between items-start mb-4'>
                          <div>
                            <h4 className='font-semibold text-lg text-purple-900'>
                              {test.test_name}
                            </h4>
                            <p className='text-sm text-purple-700 capitalize'>
                              Type: {test.test_type}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
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

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                          {test.lab_name && (
                            <div>
                              <p className='text-xs text-gray-600 font-semibold'>
                                LABORATORY
                              </p>
                              <p className='text-sm text-gray-900'>
                                {test.lab_name}
                              </p>
                            </div>
                          )}
                          {test.cost != null && (
                            <div>
                              <p className='text-xs text-gray-600 font-semibold'>
                                COST
                              </p>
                              <p className='text-sm text-gray-900 font-medium'>
                                $
                                {typeof test.cost === 'number'
                                  ? test.cost.toFixed(2)
                                  : parseFloat(test.cost).toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>

                        {test.normal_range && (
                          <div className='mb-4'>
                            <p className='text-xs text-gray-600 font-semibold mb-1'>
                              NORMAL RANGE / REFERENCE VALUES
                            </p>
                            <p className='text-sm text-gray-700 bg-white p-2 rounded border border-purple-100'>
                              {test.normal_range}
                            </p>
                          </div>
                        )}

                        {!readOnly &&
                          index === labTestDetail.lab_tests.length - 1 && (
                            <div className='flex gap-2 pt-4 border-t border-purple-200'>
                              <button
                                onClick={() =>
                                  handleEditLabTest(labTestDetail.id)
                                }
                                className='flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition'
                              >
                                <MdEdit className='w-4 h-4' />
                                Edit
                              </button>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'vaccinations' && (
          <div>
            {(() => {
              console.log(
                '🔍 VACCINATION TAB - Rendering with vaccinations:',
                vaccinations,
              );
              console.log('🔍 VACCINATION TAB - Count:', vaccinations.length);
              return null;
            })()}
            {!readOnly && (
              <div className='mb-6'>
                <button
                  onClick={handleCreateVaccination}
                  className='bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition'
                >
                  <MdAdd className='w-5 h-5' />
                  Add Vaccination
                </button>
              </div>
            )}

            {vaccinations.length === 0 && (
              <div className='mb-6'>
                <h3 className='text-sm font-semibold text-gray-600 mb-2'>
                  No vaccinations recorded yet
                </h3>
                {readOnly && (
                  <p className='text-gray-500 text-sm'>
                    No vaccinations available
                  </p>
                )}
              </div>
            )}

            {vaccinations.length > 0 && (
              <div className='space-y-4'>
                {vaccinations.map((vaccinationDetail) => (
                  <div
                    key={vaccinationDetail.id}
                    className='bg-teal-50 rounded-lg p-4 border border-teal-200'
                  >
                    {vaccinationDetail.vaccinations.map(
                      (vaccination, index) => (
                        <div key={index} className='mb-4 last:mb-0'>
                          <div className='flex items-start justify-between mb-3'>
                            <div>
                              <h4 className='text-lg font-semibold text-gray-900'>
                                {vaccination.vaccine_name}
                              </h4>
                              <span className='inline-block mt-1 px-2 py-1 text-xs font-medium bg-teal-100 text-teal-800 rounded'>
                                {vaccination.vaccine_type}
                              </span>
                            </div>
                          </div>

                          <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mb-4'>
                            {vaccination.manufacturer && (
                              <div>
                                <p className='text-xs text-gray-600 font-semibold'>
                                  MANUFACTURER
                                </p>
                                <p className='text-sm text-gray-900'>
                                  {vaccination.manufacturer}
                                </p>
                              </div>
                            )}
                            {vaccination.batch_number && (
                              <div>
                                <p className='text-xs text-gray-600 font-semibold'>
                                  BATCH NUMBER
                                </p>
                                <p className='text-sm text-gray-900'>
                                  {vaccination.batch_number}
                                </p>
                              </div>
                            )}
                            {vaccination.site_of_injection && (
                              <div>
                                <p className='text-xs text-gray-600 font-semibold'>
                                  SITE OF INJECTION
                                </p>
                                <p className='text-sm text-gray-900'>
                                  {vaccination.site_of_injection}
                                </p>
                              </div>
                            )}
                            {vaccination.next_due_date && (
                              <div>
                                <p className='text-xs text-gray-600 font-semibold'>
                                  NEXT DUE DATE
                                </p>
                                <p className='text-sm text-gray-900'>
                                  {formatDate(vaccination.next_due_date)}
                                </p>
                              </div>
                            )}
                            {vaccination.cost != null && (
                              <div>
                                <p className='text-xs text-gray-600 font-semibold'>
                                  COST
                                </p>
                                <p className='text-sm text-gray-900 font-medium'>
                                  $
                                  {typeof vaccination.cost === 'number'
                                    ? vaccination.cost.toFixed(2)
                                    : Number(vaccination.cost).toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>

                          {vaccination.notes && (
                            <div className='mb-4'>
                              <p className='text-xs text-gray-600 font-semibold mb-1'>
                                NOTES
                              </p>
                              <p className='text-sm text-gray-700 bg-white p-2 rounded border border-teal-100'>
                                {vaccination.notes}
                              </p>
                            </div>
                          )}

                          {!readOnly &&
                            index ===
                              vaccinationDetail.vaccinations.length - 1 && (
                              <div className='flex gap-2 pt-4 border-t border-teal-200'>
                                <button
                                  onClick={() =>
                                    handleEditVaccination(vaccinationDetail.id)
                                  }
                                  className='flex-1 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition'
                                >
                                  <MdEdit className='w-4 h-4' />
                                  Edit
                                </button>
                              </div>
                            )}
                        </div>
                      ),
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Medical Record Modal */}
      {showMedicalRecordModal && !readOnly && (
        <>
          {console.log('===== MODAL OPENED =====')}
          {console.log('showMedicalRecordModal:', showMedicalRecordModal)}
          {console.log('editingRecordId:', editingRecordId)}
          {console.log('=======================')}
          <div className='fixed inset-0 z-50 flex items-center justify-center pointer-events-none'>
            <div className='pointer-events-auto w-full max-w-3xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden'>
              {/* Modal Header */}
              <div className='sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900'>
                  {editingRecordId
                    ? 'Edit Medical Record'
                    : 'Create Medical Record'}
                </h2>
                <button
                  onClick={handleCancelMedicalRecord}
                  className='text-gray-500 hover:text-gray-700 transition'
                >
                  <MdClose className='w-6 h-6' />
                </button>
              </div>

              {/* Modal Content */}
              <div className='overflow-y-auto max-h-[calc(90vh-120px)]'>
                <div className='px-6 py-6'>
                  <MedicalRecordForm
                    key={`medical-record-${editingRecordId || 'create'}`}
                    appointmentId={appointment.id}
                    petId={appointment.petId}
                    veterinarianId={appointment.id}
                    recordId={editingRecordId}
                    onSave={handleSaveMedicalRecord}
                    onCancel={handleCancelMedicalRecord}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && !readOnly && (
        <>
          {console.log('===== PRESCRIPTION MODAL OPENED =====')}
          {console.log('showPrescriptionModal:', showPrescriptionModal)}
          {console.log('editingPrescriptionId:', editingPrescriptionId)}
          {console.log('====================================')}
          <div className='fixed inset-0 z-50 flex items-center justify-center pointer-events-none'>
            <div className='pointer-events-auto w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden'>
              {/* Modal Header */}
              <div className='sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900'>
                  {editingPrescriptionId
                    ? 'Edit Prescription'
                    : 'Create Prescription'}
                </h2>
                <button
                  onClick={handleCancelPrescription}
                  className='text-gray-500 hover:text-gray-700 transition'
                >
                  <MdClose className='w-6 h-6' />
                </button>
              </div>

              {/* Modal Content */}
              <div className='overflow-y-auto max-h-[calc(90vh-120px)]'>
                <div className='px-6 py-6'>
                  <PrescriptionForm
                    key={`prescription-${editingPrescriptionId || 'create'}`}
                    appointmentId={appointment.id}
                    petId={appointment.petId}
                    veterinarianId={appointment.id}
                    medicalRecordId={medicalRecords[0]?.id}
                    prescriptionId={editingPrescriptionId}
                    onSave={handleSavePrescription}
                    onCancel={handleCancelPrescription}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Lab Test Modal */}
      {showLabTestModal && !readOnly && (
        <>
          {console.log('===== LAB TEST MODAL OPENED =====')}
          {console.log('showLabTestModal:', showLabTestModal)}
          {console.log('editingLabTestId:', editingLabTestId)}
          {console.log('====================================')}{' '}
          <div className='fixed inset-0 z-50 flex items-center justify-center pointer-events-none'>
            <div className='pointer-events-auto w-full max-w-3xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden'>
              {/* Modal Header */}
              <div className='sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900'>
                  {editingLabTestId ? 'Edit Lab Test' : 'Order Lab Test'}
                </h2>
                <button
                  onClick={handleCancelLabTest}
                  className='text-gray-500 hover:text-gray-700 transition'
                >
                  <MdClose className='w-6 h-6' />
                </button>
              </div>

              {/* Modal Content */}
              <div className='overflow-y-auto max-h-[calc(90vh-120px)]'>
                <div className='px-6 py-6'>
                  <LabTestForm
                    key={`lab-test-${editingLabTestId || 'create'}`}
                    appointmentId={appointment.id}
                    petId={appointment.petId}
                    medicalRecordId={medicalRecords[0]?.id}
                    labTestId={editingLabTestId}
                    onSave={handleSaveLabTest}
                    onCancel={handleCancelLabTest}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Vaccination Modal */}
      {showVaccinationModal && !readOnly && (
        <>
          {console.log('===== VACCINATION MODAL OPENED =====')}
          {console.log('showVaccinationModal:', showVaccinationModal)}
          {console.log('editingVaccinationId:', editingVaccinationId)}
          {console.log('====================================')}{' '}
          <div className='fixed inset-0 z-50 flex items-center justify-center pointer-events-none'>
            <div className='pointer-events-auto w-full max-w-3xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden'>
              {/* Modal Header */}
              <div className='sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900'>
                  {editingVaccinationId
                    ? 'Edit Vaccination'
                    : 'Add Vaccination'}
                </h2>
                <button
                  onClick={handleCancelVaccination}
                  className='text-gray-500 hover:text-gray-700 transition'
                >
                  <MdClose className='w-6 h-6' />
                </button>
              </div>

              {/* Modal Content */}
              <div className='overflow-y-auto max-h-[calc(90vh-120px)]'>
                <div className='px-6 py-6'>
                  <VaccinationForm
                    key={`vaccination-${editingVaccinationId || 'create'}`}
                    appointmentId={appointment.id}
                    petId={appointment.petId}
                    veterinarianId={appointment.id}
                    medicalRecordId={medicalRecords[0]?.id}
                    vaccinationId={editingVaccinationId}
                    onSave={handleSaveVaccination}
                    onCancel={handleCancelVaccination}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
