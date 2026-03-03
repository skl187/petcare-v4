import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import FormCard from '../../../../components/form/FormCard';
import DatePickerInput from '../../../../components/form/DatePickerInput/DatePickerInput';
import { MdClose } from 'react-icons/md';
import { CheckCircle, Clock, MapPin, User, PawPrint, Stethoscope, CreditCard, ChevronRight } from 'lucide-react';
import { API_ENDPOINTS } from '../../../../constants/api';
export interface Pet {
  id: string;
  name: string;
  slug?: string;
  image?: string;
}

export interface Veterinarian {
  id: string;
  first_name: string;
  last_name: string;
  specialization?: string;
  consultation_fee?: number;
}

export interface Clinic {
  id: string;
  name: string;
  address?: string;
}

export interface VetService {
  id: string;
  name: string;
  fee?: number;
  default_fee?: number;
  description?: string;
  service_type?: string;
  default_duration_minutes?: number;
}

export interface ServiceSelection {
  service_id: string;
  service_name?: string;
  quantity: number;
  fee: number;
}

export interface UpcomingBookingFormData {
  user_id: string;
  pet_id: string;
  veterinarian_id: string;
  clinic_id: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type:
    | 'consultation'
    | 'checkup'
    | 'vaccination'
    | 'surgery'
    | 'emergency'
    | 'followup'
    | 'telemedicine';
  chief_complaint: string;
  symptoms?: string[];
  notes?: string;
  service_ids: string[];
  service_selections?: ServiceSelection[];
  payment_type: 'online' | 'cash' | 'insurance';
  payment_method?: 'card' | 'upi' | 'bank_transfer';
  insurance_id?: string;
  total_amount?: number;
}

export interface BookingForEdit extends UpcomingBookingFormData {
  id: string;
  vet_service_ids?: any[];
  services?: any[];
  appointment_number?: string;
  priority?: string;
  status?: string;
  [key: string]: any;
}

interface Props {
  booking?: BookingForEdit;
  pets: Pet[];
  onSubmit: (data: UpcomingBookingFormData) => void;
  onCancel: () => void;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

function generateSlots(startTime: string, endTime: string, slotDuration: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let cur = sh * 60 + sm;
  const end = eh * 60 + em;
  const dur = slotDuration || 30;
  while (cur + dur <= end) {
    const h = Math.floor(cur / 60);
    const m = cur % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    cur += dur;
  }
  return slots;
}

const formatSlotDisplay = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const appointmentTypes = [
  'consultation', 'checkup', 'vaccination', 'surgery', 'emergency', 'followup', 'telemedicine',
] as const;

// ─────────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────────
const stepDefs = [
  { label: 'Pet', icon: PawPrint },
  { label: 'Clinic', icon: MapPin },
  { label: 'Vet', icon: Stethoscope },
  { label: 'When', icon: Clock },
  { label: 'Services', icon: CheckCircle },
  { label: 'Payment', icon: CreditCard },
];

const StepIndicator = ({ current }: { current: number }) => (
  <div className='flex items-center justify-center gap-1 mb-6 flex-wrap px-2'>
    {stepDefs.map((s, i) => {
      const Icon = s.icon;
      const done = i < current;
      const active = i === current;
      return (
        <React.Fragment key={s.label}>
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
            done ? 'bg-green-100 text-green-700' :
            active ? 'bg-blue-600 text-white' :
            'bg-gray-100 text-gray-400'
          }`}>
            <Icon size={13} />
            <span>{s.label}</span>
          </div>
          {i < stepDefs.length - 1 && (
            <ChevronRight size={12} className={done ? 'text-green-400' : 'text-gray-300'} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const UpcomingBookingsForm: React.FC<Props> = ({ booking, pets, onSubmit, onCancel }) => {
  // ── external state ──────────────────────────────────────────────────
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [vetsForClinic, setVetsForClinic] = useState<Veterinarian[]>([]);
  const [servicesForBooking, setServicesForBooking] = useState<VetService[]>([]);
  const [scheduleRows, setScheduleRows] = useState<any[]>([]);
  const [exceptionRows, setExceptionRows] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const [loadingClinics, setLoadingClinics] = useState(false);
  const [loadingVets, setLoadingVets] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // ── form ─────────────────────────────────────────────────────────────
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
    control,
  } = useForm<UpcomingBookingFormData>({
    mode: 'onChange',
    defaultValues: {
      user_id: (() => { try { const u = sessionStorage.getItem('user'); return u ? JSON.parse(u).id : ''; } catch { return ''; } })(),
      pet_id: booking?.pet_id || '',
      veterinarian_id: booking?.veterinarian_id || '',
      clinic_id: booking?.clinic_id || '',
      appointment_date: booking?.appointment_date || '',
      appointment_time: booking?.appointment_time || '',
      appointment_type: (booking?.appointment_type as any) || 'checkup',
      chief_complaint: booking?.chief_complaint || '',
      symptoms: booking?.symptoms || [],
      notes: booking?.notes || '',
      service_ids: booking?.service_ids || [],
      service_selections: booking?.service_selections || [],
      payment_type: (booking?.payment_type as any) || 'cash',
      payment_method: (booking?.payment_method as any) || 'card',
      insurance_id: booking?.insurance_id || '',
      total_amount: booking?.total_amount || 0,
    },
  });

  const petId          = watch('pet_id');
  const clinicId       = watch('clinic_id');
  const vetId          = watch('veterinarian_id');
  const date           = watch('appointment_date');
  const time           = watch('appointment_time');
  const paymentType    = watch('payment_type');
  const serviceSelections = watch('service_selections') || [];
  const symptoms       = watch('symptoms') || [];

  const [symptomInput, setSymptomInput] = useState('');
  const [banner, setBanner] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const bannerTimerRef = useRef<number | null>(null);
  const closeTimerRef  = useRef<number | null>(null);

  // ── step indicator ──────────────────────────────────────────────────
  const currentStep = !petId ? 0 : !clinicId ? 1 : !vetId ? 2 : (!date || !time) ? 3 : serviceSelections.length === 0 ? 4 : 5;

  // ── cascade effects ─────────────────────────────────────────────────
  // 1. Fetch clinics on mount
  useEffect(() => {
    (async () => {
      setLoadingClinics(true);
      try {
        const res = await fetch(API_ENDPOINTS.CLINICS.BASE, { headers: getAuthHeaders() });
        const data = await res.json();
        const list = Array.isArray(data) ? data : Array.isArray(data?.data?.data) ? data.data.data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.clinics) ? data.clinics : [];
        setClinics(list);
      } catch { setClinics([]); }
      finally { setLoadingClinics(false); }
    })();
  }, []);

  // 2. Fetch vets when clinic changes
  useEffect(() => {
    if (!clinicId) { setVetsForClinic([]); return; }
    (async () => {
      setLoadingVets(true);
      setValue('veterinarian_id', '');
      setValue('appointment_date', '');
      setValue('appointment_time', '');
      setValue('service_selections', []);
      setScheduleRows([]);
      setExceptionRows([]);
      setAvailableSlots([]);
      try {
        const res = await fetch(API_ENDPOINTS.VETERINARIANS.BY_CLINIC(clinicId), { headers: getAuthHeaders() });
        const data = await res.json();
        const list = Array.isArray(data) ? data : Array.isArray(data?.data?.data) ? data.data.data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.veterinarians) ? data.veterinarians : [];
        setVetsForClinic(list);
      } catch { setVetsForClinic([]); }
      finally { setLoadingVets(false); }
    })();
  }, [clinicId]);

  // 3. Fetch services + schedule when vet+clinic both set
  useEffect(() => {
    if (!vetId || !clinicId) { setServicesForBooking([]); setScheduleRows([]); setExceptionRows([]); return; }
    (async () => {
      setLoadingServices(true);
      setLoadingSchedule(true);
      setValue('service_selections', []);
      setValue('appointment_date', '');
      setValue('appointment_time', '');
      setAvailableSlots([]);
      try {
        const [svcRes, schRes, excRes] = await Promise.all([
          fetch(API_ENDPOINTS.VET_SERVICES.ACTIVE_FOR_BOOKING(vetId, clinicId), { headers: getAuthHeaders() }),
          fetch(API_ENDPOINTS.VET_SCHEDULES.FOR_BOOKING(vetId, clinicId),       { headers: getAuthHeaders() }),
          fetch(API_ENDPOINTS.VET_SCHEDULES.EXCEPTIONS_FOR_BOOKING(vetId, clinicId), { headers: getAuthHeaders() }),
        ]);
        const svcData = await svcRes.json();
        const schData = await schRes.json();
        const excData = await excRes.json();
        const svcList = Array.isArray(svcData) ? svcData : Array.isArray(svcData?.data?.data) ? svcData.data.data : Array.isArray(svcData?.data) ? svcData.data : Array.isArray(svcData?.services) ? svcData.services : [];
        const schList = Array.isArray(schData) ? schData : Array.isArray(schData?.data?.data) ? schData.data.data : Array.isArray(schData?.data) ? schData.data : Array.isArray(schData?.schedules) ? schData.schedules : [];
        const excList = Array.isArray(excData) ? excData : Array.isArray(excData?.data?.data) ? excData.data.data : Array.isArray(excData?.data) ? excData.data : [];
        setServicesForBooking(svcList);
        setScheduleRows(schList);
        setExceptionRows(excList);
      } catch { setServicesForBooking([]); setScheduleRows([]); setExceptionRows([]); }
      finally { setLoadingServices(false); setLoadingSchedule(false); }
    })();
  }, [vetId, clinicId]);

  // 4. Compute slots when date or schedule changes, respecting exceptions
  useEffect(() => {
    setValue('appointment_time', '');
    if (!date || scheduleRows.length === 0) { setAvailableSlots([]); return; }

    // Check for an exception on this exact date — any exception type means unavailable
    const exception = exceptionRows.find((e: any) => e.exception_date?.slice(0, 10) === date);
    if (exception) {
      setAvailableSlots([]);
      return;
    }

    const dow = new Date(date + 'T00:00:00').getDay();
    const row = scheduleRows.find(
      (r: any) => Number(r.day_of_week) === dow && r.is_available !== false
    );
    if (!row) { setAvailableSlots([]); return; }
    const duration = Number(row.slot_duration) || 30;
    let slots = generateSlots(row.start_time, row.end_time, duration);

    // If today is selected, remove slots that are already in the past
    const todayStr = (() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`; })();
    if (date === todayStr) {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      slots = slots.filter(slot => {
        const [h, m] = slot.split(':').map(Number);
        return h * 60 + m > nowMinutes;
      });
    }

    setAvailableSlots(slots);
  }, [date, scheduleRows, exceptionRows]);

  // ── helpers ──────────────────────────────────────────────────────────
  const toggleService = useCallback((svc: VetService) => {
    const exists = serviceSelections.find(s => s.service_id === svc.id);
    if (exists) {
      setValue('service_selections', serviceSelections.filter(s => s.service_id !== svc.id));
    } else {
      setValue('service_selections', [...serviceSelections, { service_id: svc.id, service_name: svc.name, quantity: 1, fee: Number(svc.fee ?? svc.default_fee ?? 0) }]);
    }
  }, [serviceSelections, setValue]);

  const calculateTotal = useCallback(() =>
    serviceSelections.reduce((sum, s) => sum + s.fee * s.quantity, 0),
  [serviceSelections]);

  const handleAddSymptom = () => {
    if (symptomInput.trim()) { setValue('symptoms', [...symptoms, symptomInput.trim()]); setSymptomInput(''); }
  };

  const parseResponse = async (res: Response) => {
    const txt = await res.text();
    try { return txt ? JSON.parse(txt) : {}; } catch { return { message: txt || res.statusText }; }
  };

  // Auto-dismiss banner
  useEffect(() => {
    if (!banner || banner.type === 'error') return;
    bannerTimerRef.current = window.setTimeout(() => setBanner(null), 5000);
    return () => { if (bannerTimerRef.current) window.clearTimeout(bannerTimerRef.current); };
  }, [banner]);

  useEffect(() => () => {
    if (bannerTimerRef.current) window.clearTimeout(bannerTimerRef.current);
    if (closeTimerRef.current)  window.clearTimeout(closeTimerRef.current);
  }, []);

  // ── submit ───────────────────────────────────────────────────────────
  const handleFormSubmit = async (data: UpcomingBookingFormData) => {
    setBanner(null);
    const userId = data.user_id || (() => { try { const u = sessionStorage.getItem('user'); return u ? JSON.parse(u).id : ''; } catch { return ''; } })();
    const payload = {
      user_id: userId,
      pet_id: data.pet_id,
      veterinarian_id: data.veterinarian_id,
      clinic_id: data.clinic_id,
      appointment_date: data.appointment_date,
      appointment_time: data.appointment_time,
      appointment_type: data.appointment_type,
      chief_complaint: data.chief_complaint,
      symptoms: data.symptoms || [],
      notes: data.notes || '',
      service_ids: serviceSelections.map(s => s.service_id),
      payment_info: {
        payment_type: data.payment_type,
        ...(data.payment_type === 'online'     && { method: data.payment_method }),
        ...(data.payment_type === 'insurance'  && { insurance_id: data.insurance_id }),
        amount_to_pay: calculateTotal(),
      },
    };
    try {
      const res = await fetch(
        booking ? API_ENDPOINTS.APPOINTMENTS.DETAIL(booking.id) : API_ENDPOINTS.APPOINTMENTS.BASE,
        { method: booking ? 'PUT' : 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) }
      );
      const responseData = await parseResponse(res);
      if (!res.ok) throw new Error(responseData?.message || responseData?.error || res.statusText);
      setBanner({ message: booking ? 'Appointment updated successfully!' : 'Appointment created successfully!', type: 'success' });
      onSubmit(data);
      reset();
      closeTimerRef.current = window.setTimeout(() => onCancel(), 2000);
    } catch (err) {
      setBanner({ message: `${booking ? 'Update' : 'Create'} failed: ${err instanceof Error ? err.message : 'Unknown error'}`, type: 'error' });
    }
  };

  // ── helpers: selected references ────────────────────────────────────
  const selectedPet    = pets.find(p => p.id === petId);
  const selectedClinic = clinics.find(c => c.id === clinicId);
  const selectedVet    = vetsForClinic.find(v => v.id === vetId);

  // ── render ───────────────────────────────────────────────────────────
  return (
    <div className='p-4 mx-auto max-w-5xl md:p-6'>
      {/* Banner */}
      {banner && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-medium max-w-sm flex items-start gap-3 ${banner.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          <p className='text-sm flex-1 break-words'>{banner.message}</p>
          <button onClick={() => setBanner(null)} className='text-white hover:opacity-75'><MdClose size={18} /></button>
        </div>
      )}

      <FormCard title={booking ? 'Edit Appointment' : 'New Appointment'} onClose={onCancel}>
        <StepIndicator current={currentStep} />
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className='grid lg:grid-cols-5 gap-6'>

            {/* ── LEFT (col-span-3) ─────────────────────────────────── */}
            <div className='lg:col-span-3 space-y-5'>

              {/* STEP 1 — Pet */}
              <div className='bg-white border border-gray-200 rounded-xl p-4'>
                <h4 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2'>
                  <PawPrint size={14} className='text-blue-500' /> Select Pet
                </h4>
                {pets.length === 0 ? (
                  <p className='text-sm text-gray-400'>No pets found.</p>
                ) : (
                  <div className='flex flex-wrap gap-2'>
                    {pets.map(p => (
                      <button key={p.id} type='button'
                        onClick={() => setValue('pet_id', p.id, { shouldValidate: true })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                          petId === p.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                        }`}>
                        {p.image
                          ? <img src={p.image} alt={p.name} className='w-6 h-6 rounded-full object-cover' />
                          : <div className='w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center'><PawPrint size={12} className='text-blue-500' /></div>
                        }
                        {p.name}
                        {petId === p.id && <CheckCircle size={14} className='text-blue-500' />}
                      </button>
                    ))}
                  </div>
                )}
                {errors.pet_id && <p className='text-xs text-red-500 mt-2'>{errors.pet_id.message as string}</p>}
                <input type='hidden' {...register('pet_id', { required: 'Please select a pet' })} />
              </div>

              {/* STEP 2 — Clinic */}
              <div className={`bg-white border rounded-xl p-4 transition-opacity ${!petId ? 'opacity-50 pointer-events-none' : 'border-gray-200'}`}>
                <h4 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2'>
                  <MapPin size={14} className='text-blue-500' /> Select Clinic
                  {loadingClinics && <span className='text-xs text-gray-400 normal-case font-normal'>Loading...</span>}
                </h4>
                <div className='flex flex-wrap gap-2'>
                  {clinics.map(c => (
                    <button key={c.id} type='button'
                      onClick={() => setValue('clinic_id', c.id, { shouldValidate: true })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        clinicId === c.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                      }`}>
                      <MapPin size={13} className={clinicId === c.id ? 'text-blue-500' : 'text-gray-400'} />
                      <div className='text-left'>
                        <div>{c.name}</div>
                        {c.address && <div className='text-xs font-normal text-gray-400'>{c.address}</div>}
                      </div>
                      {clinicId === c.id && <CheckCircle size={14} className='text-blue-500' />}
                    </button>
                  ))}
                </div>
              </div>

              <input type='hidden' {...register('clinic_id', { required: 'Please select a clinic' })} />

              {/* STEP 3 — Vet */}
              <div className={`bg-white border rounded-xl p-4 transition-opacity ${!clinicId ? 'opacity-50 pointer-events-none' : 'border-gray-200'}`}>
                <h4 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2'>
                  <Stethoscope size={14} className='text-blue-500' /> Select Veterinarian
                  {loadingVets && <span className='text-xs text-gray-400 normal-case font-normal'>Loading...</span>}
                </h4>
                {!loadingVets && vetsForClinic.length === 0 && clinicId && (
                  <p className='text-sm text-gray-400'>No veterinarians available at this clinic.</p>
                )}
                <div className='flex flex-wrap gap-2'>
                  {vetsForClinic.map(v => (
                    <button key={v.id} type='button'
                      onClick={() => setValue('veterinarian_id', v.id, { shouldValidate: true })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        vetId === v.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                      }`}>
                      <div className='w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0'>
                        <User size={13} className='text-indigo-500' />
                      </div>
                      <div className='text-left'>
                        <div>Dr. {v.first_name} {v.last_name}</div>
                        {v.specialization && <div className='text-xs font-normal text-gray-400'>{v.specialization}</div>}
                      </div>
                      {vetId === v.id && <CheckCircle size={14} className='text-blue-500' />}
                    </button>
                  ))}
                </div>
                <input type='hidden' {...register('veterinarian_id', { required: 'Please select a veterinarian' })} />
              </div>

              {/* STEP 4 — Date + Slots */}
              <div className={`bg-white border rounded-xl p-4 transition-opacity ${!vetId ? 'opacity-50 pointer-events-none' : 'border-gray-200'}`}>
                <h4 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2'>
                  <Clock size={14} className='text-blue-500' /> Pick Date &amp; Time
                  {loadingSchedule && <span className='text-xs text-gray-400 normal-case font-normal'>Loading schedule...</span>}
                </h4>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1.5'>Date <span className='text-red-500'>*</span></label>
                    <Controller name='appointment_date' control={control} rules={{ required: 'Date is required' }}
                      render={({ field }) => (
                        <DatePickerInput
                          value={field.value ? new Date(field.value + 'T00:00:00') : null}
                          minDate={new Date()}
                          onChange={date => {
                            if (date) {
                              const y = date.getFullYear(), mo = String(date.getMonth()+1).padStart(2,'0'), d = String(date.getDate()).padStart(2,'0');
                              field.onChange(`${y}-${mo}-${d}`);
                            }
                          }}
                          onBlur={field.onBlur}
                          error={errors.appointment_date?.message}
                          required
                        />
                      )}
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1.5'>Available Slots <span className='text-red-500'>*</span></label>
                    {date && availableSlots.length === 0 && !loadingSchedule && (
                      <p className='text-xs text-amber-600 mb-2'>
                        No slots available on {date ? DAY_NAMES[new Date(date+'T00:00:00').getDay()] : 'this day'}.
                      </p>
                    )}
                    <div className='flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1'>
                      {availableSlots.map(slot => (
                        <button key={slot} type='button'
                          onClick={() => setValue('appointment_time', slot, { shouldValidate: true })}
                          className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-all ${
                            time === slot
                              ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                          }`}>
                          {formatSlotDisplay(slot)}
                        </button>
                      ))}
                    </div>
                    {errors.appointment_time && <p className='text-xs text-red-500 mt-1'>{errors.appointment_time.message as string}</p>}
                  </div>
                </div>
              </div>

              {/* Clinical Details */}
              <div className='bg-white border border-gray-200 rounded-xl p-4'>
                <h4 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'>Clinical Details</h4>
                <div className='space-y-3'>
                  {/* Appointment Type */}
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1.5'>Appointment Type <span className='text-red-500'>*</span></label>
                    <Controller name='appointment_type' control={control} rules={{ required: true }}
                      render={({ field }) => (
                        <select {...field} className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'>
                          {appointmentTypes.map(t => (
                            <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                  {/* Chief Complaint */}
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1.5'>Chief Complaint <span className='text-red-500'>*</span></label>
                    <Controller name='chief_complaint' control={control} rules={{ required: 'Required' }}
                      render={({ field }) => (
                        <input type='text' placeholder='e.g., Routine checkup, Limping…' {...field}
                          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.chief_complaint ? 'border-red-400' : 'border-gray-200'}`} />
                      )}
                    />
                    {errors.chief_complaint && <p className='text-xs text-red-500 mt-1'>{errors.chief_complaint.message as string}</p>}
                  </div>
                  {/* Symptoms */}
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1.5'>Symptoms <span className='text-gray-400 font-normal'>(optional)</span></label>
                    <div className='flex gap-2 mb-2'>
                      <input type='text' placeholder='e.g., lethargy, vomiting' value={symptomInput}
                        onChange={e => setSymptomInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSymptom(); } }}
                        className='flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500' />
                      <button type='button' onClick={handleAddSymptom} className='px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700'>Add</button>
                    </div>
                    <div className='flex flex-wrap gap-1.5'>
                      {symptoms.map((sym, idx) => (
                        <span key={idx} className='inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs'>
                          {sym}
                          <button type='button' onClick={() => setValue('symptoms', symptoms.filter((_,i) => i!==idx))} className='text-blue-600 hover:text-blue-800'><MdClose size={11} /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Notes */}
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1.5'>Notes <span className='text-gray-400 font-normal'>(optional)</span></label>
                    <Controller name='notes' control={control}
                      render={({ field }) => (
                        <textarea placeholder='Additional notes…' {...field} rows={3}
                          className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500' />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT (col-span-2) ─────────────────────────────────── */}
            <div className='lg:col-span-2 space-y-5'>

              {/* STEP 5 — Services */}
              <div className={`bg-white border rounded-xl p-4 transition-opacity ${!vetId || !clinicId ? 'opacity-50 pointer-events-none' : 'border-gray-200'}`}>
                <h4 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2'>
                  <CheckCircle size={14} className='text-blue-500' /> Services
                  {loadingServices && <span className='text-xs text-gray-400 normal-case font-normal'>Loading...</span>}
                </h4>
                {!loadingServices && servicesForBooking.length === 0 && vetId && clinicId && (
                  <p className='text-sm text-gray-400'>No services available.</p>
                )}
                <div className='space-y-2 max-h-64 overflow-y-auto pr-1'>
                  {servicesForBooking.map(svc => {
                    const selected = serviceSelections.some(s => s.service_id === svc.id);
                    return (
                      <button key={svc.id} type='button' onClick={() => toggleService(svc)}
                        className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                          selected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                        }`}>
                        <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                          {selected && <CheckCircle size={10} className='text-white' />}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='text-sm font-medium text-gray-800'>{svc.name}</div>
                          {svc.description && <div className='text-xs text-gray-400 truncate'>{svc.description}</div>}
                          {svc.default_duration_minutes && <div className='text-xs text-gray-400'>{svc.default_duration_minutes} min</div>}
                        </div>
                        <div className='text-sm font-semibold text-blue-600 flex-shrink-0'>${Number(svc.fee ?? svc.default_fee ?? 0).toFixed(2)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 6 — Payment */}
              <div className='bg-white border border-gray-200 rounded-xl p-4'>
                <h4 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2'>
                  <CreditCard size={14} className='text-blue-500' /> Payment
                </h4>
                <div className='space-y-3'>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1.5'>Payment Type <span className='text-red-500'>*</span></label>
                    <Controller name='payment_type' control={control} rules={{ required: true }}
                      render={({ field }) => (
                        <select {...field} className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'>
                          <option value='cash'>Cash at Clinic</option>
                          <option value='online'>Online Payment</option>
                          <option value='insurance'>Insurance</option>
                        </select>
                      )}
                    />
                  </div>
                  {paymentType === 'online' && (
                    <div>
                      <label className='block text-xs font-medium text-gray-600 mb-1.5'>Payment Method <span className='text-red-500'>*</span></label>
                      <Controller name='payment_method' control={control} rules={{ required: paymentType === 'online' }}
                        render={({ field }) => (
                          <select {...field} className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'>
                            <option value='card'>Card</option>
                            <option value='upi'>UPI</option>
                            <option value='bank_transfer'>Bank Transfer</option>
                          </select>
                        )}
                      />
                    </div>
                  )}
                  {paymentType === 'insurance' && (
                    <div>
                      <label className='block text-xs font-medium text-gray-600 mb-1.5'>Insurance ID <span className='text-red-500'>*</span></label>
                      <Controller name='insurance_id' control={control} rules={{ required: paymentType === 'insurance' ? 'Required' : false }}
                        render={({ field }) => (
                          <input type='text' placeholder='e.g., INS-12345-6789' {...field}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.insurance_id ? 'border-red-400' : 'border-gray-200'}`} />
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Summary card */}
              <div className='rounded-xl border border-gray-200 bg-white p-4'>
                <h4 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'>Booking Summary</h4>
                <div className='space-y-1.5 text-sm text-gray-700'>
                  {selectedPet    && <div className='flex items-center gap-2'><PawPrint size={13} className='text-gray-400' /><span>{selectedPet.name}</span></div>}
                  {selectedClinic && <div className='flex items-center gap-2'><MapPin size={13} className='text-gray-400' /><span>{selectedClinic.name}</span></div>}
                  {selectedVet    && <div className='flex items-center gap-2'><Stethoscope size={13} className='text-gray-400' /><span>Dr. {selectedVet.first_name} {selectedVet.last_name}</span></div>}
                  {date && time   && <div className='flex items-center gap-2'><Clock size={13} className='text-gray-400' /><span>{date} · {formatSlotDisplay(time)}</span></div>}
                  {serviceSelections.length > 0 && (
                    <div className='mt-2 pt-2 border-t border-gray-100 space-y-1'>
                      {serviceSelections.map(s => (
                        <div key={s.service_id} className='flex justify-between text-xs text-gray-600'>
                          <span>{s.service_name}</span><span>${(s.fee * s.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className='mt-3 pt-3 border-t border-gray-100'>
                  <div className='rounded-lg bg-emerald-50 px-3 py-2.5'>
                    <p className='text-xs text-gray-500 mb-0.5'>Total</p>
                    <p className='text-lg font-bold text-emerald-600'>${calculateTotal().toFixed(2)}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* ACTIONS */}
            <div className='lg:col-span-5 flex justify-end gap-3 pt-4 border-t'>
              <button type='button' onClick={onCancel} disabled={isSubmitting}
                className='px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50'>
                Cancel
              </button>
              <button type='submit' disabled={isSubmitting}
                className='px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium'>
                {isSubmitting ? (booking ? 'Updating…' : 'Creating…') : (booking ? 'Update Appointment' : 'Book Appointment')}
              </button>
            </div>

          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default UpcomingBookingsForm;

