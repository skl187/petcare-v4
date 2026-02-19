// // import { useState } from "react";
// import { useForm } from "react-hook-form";
// import FormCard from "../../../../components/form/FormCard";
// import Badge from "../../../../components/ui/badge/Badge";

// import type { PetLite, Vet, BookingStatus } from "../../../../components/ownerTables/Bookings/BookingsHistoryTable/BookingHistoryTable";

// export interface BookingHistoryFormData {
//   petId: number;
//   vetId: number;
//   service: string;
//   date: string;
//   time: string;
//   price?: number;
//   notes?: string;
//   status: BookingStatus;
// }

// interface Props {
//   booking?: BookingHistoryFormData & { id: number };
//   pets: PetLite[];
//   vets: Vet[];
//   onSubmit: (data: BookingHistoryFormData) => void;
//   onCancel: () => void;
// }

// const services = ["Annual Exam", "Vaccination", "Dental Cleaning", "Surgery", "Diagnostics", "Other"];

// const BookingHistoryForm: React.FC<Props> = ({ booking, pets, vets, onSubmit, onCancel }) => {
//   const {
//     register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue, reset
//   } = useForm<BookingHistoryFormData>({
//     defaultValues: booking
//       ? { ...booking }
//       : {
//           petId: pets[0]?.id ?? 0,
//           vetId: vets[0]?.id ?? 0,
//           service: "Annual Exam",
//           date: "",
//           time: "",
//           price: undefined,
//           notes: "",
//           status: "Completed",
//         },
//   });

//   const status = watch("status");
//   const getStatusColor = (s: BookingStatus) => (s === "Completed" ? "success" : "error");

//   const onFormSubmit = (data: BookingHistoryFormData) => {
//     onSubmit(data);
//     reset();
//   };

//   return (
//     <div className="p-4 mx-auto max-w-3xl md:p-6">
//       <FormCard title={booking ? "Edit History" : "Add History"} onClose={onCancel}>
//         <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">

//           {/* Pet & Vet */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="text-sm font-medium">Pet *</label>
//               <select className="mt-1 w-full px-3 py-2 border rounded-md" {...register("petId", { required: true, valueAsNumber: true })}>
//                 {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
//               </select>
//             </div>

//             <div>
//               <label className="text-sm font-medium">Veterinarian *</label>
//               <select className="mt-1 w-full px-3 py-2 border rounded-md" {...register("vetId", { required: true, valueAsNumber: true })}>
//                 {vets.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
//               </select>
//             </div>
//           </div>

//           {/* Service / Date / Time */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div>
//               <label className="text-sm font-medium">Service *</label>
//               <select className="mt-1 w-full px-3 py-2 border rounded-md" {...register("service", { required: true })}>
//                 {services.map(s => <option key={s}>{s}</option>)}
//               </select>
//             </div>

//             <div>
//               <label className="text-sm font-medium">Date *</label>
//               <input type="date" className="mt-1 w-full px-3 py-2 border rounded-md" {...register("date", { required: true })} />
//             </div>

//             <div>
//               <label className="text-sm font-medium">Time *</label>
//               <input type="time" className="mt-1 w-full px-3 py-2 border rounded-md" {...register("time", { required: true })} />
//             </div>
//           </div>

//           {/* Price & Notes */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="text-sm font-medium">Price ($)</label>
//               <input type="number" step="0.01" className="mt-1 w-full px-3 py-2 border rounded-md" {...register("price", { valueAsNumber: true })} />
//             </div>
//             <div>
//               <label className="text-sm font-medium">Notes</label>
//               <textarea rows={3} className="mt-1 w-full px-3 py-2 border rounded-md" {...register("notes")} />
//             </div>
//           </div>

//           {/* Status */}
//           <div className="flex items-center gap-3">
//             <Badge size="sm" color={getStatusColor(status)}>{status}</Badge>
//             <select className="px-3 py-2 border rounded-md" {...register("status")}>
//               <option value="Completed">Completed</option>
//               <option value="Cancelled">Cancelled</option>
//             </select>
//           </div>

//           {/* Actions */}
//           <div className="flex justify-end gap-3 pt-6">
//             <button type="button" onClick={onCancel} className="px-6 py-2 border rounded-md hover:bg-gray-50" disabled={isSubmitting}>Cancel</button>
//             <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-70">
//               {isSubmitting ? "Saving…" : booking ? "Update" : "Create"}
//             </button>
//           </div>

//         </form>
//       </FormCard>
//     </div>
//   );
// };

// export default BookingHistoryForm;
