// import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
// import { useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHeader,
//   TableRow,
// } from "../../ui/table";
// import Badge from "../../ui/badge/Badge";
// import Checkbox from "../../form/input/Checkbox";
// import VetBookingForm from "../../../pages/Forms/VetForms/VetBookingForm";
// import { BookingFormData } from "../../../pages/Forms/VetForms/VetBookingForm";
// import Pagination from "../tableComponents/Pagination";
// import { Link } from "react-router";
// import useSort from "../../../hooks/useSort";
// import SortableTableHeader from "../tableComponents/SortableTableHeader";

// export interface Booking {
//   id: number;
//   customer: {
//     name: string;
//     email: string;
//     image: string;
//   };
//   pet: {
//     name: string;
//     image: string;
//   };
//   petDetail: string;
//   vetType: string;
//   dateTime: string;
//   price: string;
//   veterinarian: {
//     name: string;
//     image: string;
//   };
//   updatedAt: string;
//   bookingStatus: string;
//   paymentStatus: string;
// }

// // Mock data for bookings
// const mockBookings: Booking[] = Array.from({ length: 100 }, (_, i) => ({
//   id: i + 1,
//   customer: {
//     image: `/images/user/user-${i + 1}.jpg`,
//     name: `Customer ${i + 1}`,
//     email: `customer${i + 1}@example.com`,
//   },
//   dateTime: new Date(Date.now() + i * 86400000).toISOString().slice(0, 16),
//   vetType: "General Checkup",
//   price: "50",
//   pet: {
//     image: `/images/pet/pet-${(i % 5) + 1}.jpg`,
//     name: `Pet ${i + 1}`,
//   },
//   petDetail: "Golden Retriever, 2 years old",
//   veterinarian: {
//     image: `/images/vet/vet-${(i % 5) + 1}.jpg`,
//     name: `Vet ${i + 1}`,
//   },
//   updatedAt: "2025-03-14 08:30 AM",
//   bookingStatus: i % 3 === 0 ? "Completed" : "Pending",
//   paymentStatus: i % 2 === 0 ? "Paid" : "Pending",
// }));

// export default function VetBookingsTable() {
//   const [selectedRows, setSelectedRows] = useState<number[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [actionDropdown, setActionDropdown] = useState<string>("No actions");
//   const [statusUpdate, setStatusUpdate] = useState<string>("");
//   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
//   const [editBooking, setEditBooking] = useState<Booking | null>(null);
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
//   const [bookings, setBookings] = useState<Booking[]>(mockBookings);
//   const [bookingToDelete, setBookingToDelete] = useState<number | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(5);

//   const columns = [
//     {
//       key: "id",
//       label: "ID",
//       className: "min-w-[80px] text-gray-700 font-semibold max-w-[105px]",
//     },
//     {
//       key: "customer.name",
//       label: "Customer",
//       className: "min-w-[150px] text-gray-700 font-semibold max-w-[200px]",
//     },
//     {
//       key: "dateTime",
//       label: "Date & Time",
//       className: "min-w-[150px] text-gray-700 font-semibold max-w-[200px]",
//     },
//     {
//       key: "vetType",
//       label: "Vet Type",
//       className: "min-w-[150px] text-gray-700 max-w-[200px]",
//     },
//     {
//       key: "price",
//       label: "Price",
//       className: "min-w-[100px] max-w-[200px] text-gray-700 font-semibold",
//     },
//     {
//       key: "pet.name",
//       label: "Pet",
//       className: "min-w-[150px] max-w-[200px] text-gray-700 font-semibold",
//     },
//     {
//       key: "petDetail",
//       label: "Details",
//       className: "min-w-[150px] font-semibold text-gray-700 max-w-[200px]",
//     },
//     {
//       key: "veterinarian.name",
//       label: "Vet Name",
//       className: "min-w-[150px] font-semibold text-gray-700 max-w-[200px]",
//     },
//     {
//       key: "updatedAt",
//       label: "Updated At",
//       className: "min-w-[150px] font-semibold text-gray-700 max-w-[200px]",
//     },
//     {
//       key: "bookingStatus",
//       label: "Booking Status",
//       className: "min-w-[150px] font-semibold text-gray-700 max-w-[200px]",
//     },
//     {
//       key: "paymentStatus",
//       label: "Payment Status",
//       className: "min-w-[150px] font-semibold text-gray-700 max-w-[200px]",
//     },
//   ] as const;

//   // Filtered data based on search and status
//   const filteredData = bookings
//     .filter(
//       (booking) =>
//         booking.customer.name
//           .toLowerCase()
//           .includes(searchQuery.toLowerCase()) ||
//         booking.pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         booking.veterinarian.name
//           .toLowerCase()
//           .includes(searchQuery.toLowerCase()) ||
//         booking.vetType.toLowerCase().includes(searchQuery.toLowerCase())
//     )
//     .filter((booking) =>
//       statusFilter ? booking.bookingStatus === statusFilter : true
//     );
//   const { sortedData, requestSort, sortConfig } = useSort(filteredData, {
//     key: "id",
//     direction: "asc",
//   });

//   // Pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
//   // Handle page change
//   const handlePageChange = (page: number) => {
//     setCurrentPage(page);
//   };

//   // Handle items per page change
//   const handleItemsPerPageChange = (newItemsPerPage: number) => {
//     setItemsPerPage(newItemsPerPage);
//     setCurrentPage(1); // Reset to the first page
//   };

//   const toggleSelectRow = (id: number) => {
//     setSelectedRows((prev) =>
//       prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
//     );
//   };

//   const toggleSelectAll = () => {
//     setSelectedRows(
//       selectedRows.length === bookings.length
//         ? []
//         : bookings.map((row) => row.id)
//     );
//   };

//   const handleApplyAction = () => {
//     if (actionDropdown === "Delete") {
//       handleDelete(); // Trigger bulk deletion
//     } else if (actionDropdown === "Status" && statusUpdate) {
//       const updatedBookings = bookings.map((booking) =>
//         selectedRows.includes(booking.id)
//           ? { ...booking, bookingStatus: statusUpdate }
//           : booking
//       );
//       setBookings(updatedBookings);
//       setSelectedRows([]);
//     }
//   };

//   const handleDelete = (id?: number) => {
//     if (id) {
//       // Set the ID of the booking to delete
//       setBookingToDelete(id);
//     } else {
//       // For bulk deletion, no specific ID is needed
//       setBookingToDelete(null);
//     }
//     // Show the delete dialog box
//     setIsDeleteDialogOpen(true);
//   };

//   const confirmDelete = () => {
//     let updatedBookings: Booking[];

//     if (bookingToDelete) {
//       // Delete a single booking by ID
//       updatedBookings = bookings.filter(
//         (booking) => booking.id !== bookingToDelete
//       );
//     } else {
//       // Delete selected rows (bulk deletion)
//       updatedBookings = bookings.filter(
//         (booking) => !selectedRows.includes(booking.id)
//       );
//     }

//     // Update the state with the new array
//     setBookings(updatedBookings);
//     setIsDeleteDialogOpen(false);
//     setSelectedRows([]); // Clear selected rows
//     setBookingToDelete(null); // Reset the booking to delete
//   };

//   const handleEdit = (booking: Booking) => {
//     setEditBooking(booking);
//   };

//   const handleAddNew = () => {
//     setIsAddDialogOpen(true);
//   };

//   const confirmAddNew = (data: BookingFormData) => {
//     const newBooking: Booking = {
//       id: bookings.length + 1,
//       customer: {
//         name: data.customerName,
//         email: data.customerEmail,
//         image:
//           data.customerImage instanceof File
//             ? URL.createObjectURL(data.customerImage)
//             : `/images/user/user-${bookings.length + 1}.jpg`,
//       },
//       pet: {
//         name: data.petName,
//         image:
//           data.petImage instanceof File
//             ? URL.createObjectURL(data.petImage)
//             : `/images/pet/pet-${(bookings.length % 5) + 1}.jpg`,
//       },
//       petDetail: data.petDetail,
//       vetType: data.vetType,
//       dateTime: data.dateTime,
//       price: data.price,
//       veterinarian: {
//         name: data.customerName,
//         image:
//           data.vetImage instanceof File
//             ? URL.createObjectURL(data.vetImage)
//             : `/images/vet/vet-${bookings.length + 1}.jpg`,
//       },
//       updatedAt: new Date().toLocaleString(),
//       bookingStatus: data.bookingStatus,
//       paymentStatus: data.paymentStatus,
//     };
//     setBookings([...bookings, newBooking]);
//     setIsAddDialogOpen(false);
//   };

//   const confirmEdit = (data: BookingFormData) => {
//     const updatedBookings = bookings.map((booking) =>
//       booking.id === editBooking?.id
//         ? {
//             ...booking,
//             customer: {
//               name: data.customerName,
//               email: data.customerEmail,
//               image:
//                 data.customerImage instanceof File
//                   ? URL.createObjectURL(data.customerImage)
//                   : booking.customer.image,
//             },
//             pet: {
//               name: data.petName,
//               image:
//                 data.petImage instanceof File
//                   ? URL.createObjectURL(data.petImage)
//                   : booking.pet.image,
//             },
//             petDetail: data.petDetail,
//             vetType: data.vetType,
//             dateTime: data.dateTime,
//             price: data.price,
//             veterinarian: {
//               name: data.vetName,
//               image:
//                 data.vetImage instanceof File
//                   ? URL.createObjectURL(data.vetImage)
//                   : booking.veterinarian.image,
//             },
//             bookingStatus: data.bookingStatus,
//             paymentStatus: data.paymentStatus,
//             updatedAt: new Date().toLocaleString(),
//           }
//         : booking
//     );
//     setBookings(updatedBookings);
//     setEditBooking(null);
//   };
//   return (
//     <div className="p-4 bg-white rounded-xl shadow-md">
//       {/* Header Section - Improved for mobile */}
//       <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <button
//           className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
//           onClick={handleAddNew}
//         >
//           <MdAdd className="w-5 h-5" />
//           <span className="whitespace-nowrap">Add Booking</span>
//         </button>

//         {/* Filters & Bulk Actions - Improved for mobile */}
//         <div className="w-full flex flex-col gap-4">
//           {selectedRows.length > 0 && (
//             <div className="flex flex-wrap items-center gap-2">
//               <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
//                 {selectedRows.length} Selected
//               </span>
//               <select
//                 className="text-sm px-3 py-1.5 border rounded-md flex-grow sm:flex-grow-0"
//                 value={actionDropdown}
//                 onChange={(e) => setActionDropdown(e.target.value)}
//               >
//                 <option value="No actions">No actions</option>
//                 <option value="Delete">Delete</option>
//                 <option value="Status">Booking Status</option>
//               </select>

//               {actionDropdown === "Status" && (
//                 <select
//                   className="text-sm px-3 py-1.5 border rounded-md flex-grow sm:flex-grow-0"
//                   value={statusUpdate}
//                   onChange={(e) => setStatusUpdate(e.target.value)}
//                 >
//                   <option value="">Select Status</option>
//                   <option value="Pending">Pending</option>
//                   <option value="Accepted">Accepted</option>
//                   <option value="Completed">Completed</option>
//                 </select>
//               )}

//               <button
//                 className="text-sm px-3 py-1.5 text-white bg-blue-500 rounded-md hover:bg-blue-600 whitespace-nowrap"
//                 onClick={handleApplyAction}
//               >
//                 Apply
//               </button>
//             </div>
//           )}

//           <div className="flex flex-col sm:flex-row gap-2 w-full">
//             <input
//               type="text"
//               placeholder="Search bookings..."
//               className="text-sm px-3 py-1.5 border rounded-md w-full"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//             <select
//               className="text-sm px-3 py-1.5 border rounded-md w-full sm:w-auto"
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//             >
//               <option value="">All Status</option>
//               <option value="Pending">Pending</option>
//               <option value="Accepted">Accepted</option>
//               <option value="Completed">Completed</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Table - Made horizontally scrollable on small screens */}
//       <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
//         <div className="min-w-[1024px]">
//           {" "}
//           {/* Minimum width to ensure all columns are visible */}
//           <Table className="w-full">
//             <TableHeader className="bg-gray-50">
//               <TableRow>
//                 <TableCell className="w-10 p-2 py-3">
//                   <Checkbox
//                     checked={selectedRows.length === bookings.length}
//                     onChange={toggleSelectAll}
//                   />
//                 </TableCell>
//                 {columns.map((column) => (
//                   <SortableTableHeader<Booking>
//                     key={column.key}
//                     columnKey={column.key}
//                     label={column.label}
//                     sortConfig={sortConfig}
//                     requestSort={requestSort}
//                     className={`p-2 py-4 text-left text-sm text-gray-100 font-medium ${column.className}`}
//                   />
//                 ))}
//                 <TableCell className="w-24 p-2 py-4 text-sm text-gray-100 font-medium">
//                   Actions
//                 </TableCell>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {currentItems.map((booking) => (
//                 <TableRow key={booking.id} className="hover:bg-gray-50">
//                   <TableCell className="p-2 py-4">
//                     <Checkbox
//                       checked={selectedRows.includes(booking.id)}
//                       onChange={() => toggleSelectRow(booking.id)}
//                     />
//                   </TableCell>
//                   <TableCell className="p-2 py-4 text-sm text-gray-900 font-medium">
//                     <Link
//                       to={`/invoices/${booking.id}`}
//                       className="text-blue-600 hover:underline"
//                     >
//                       #{booking.id}
//                     </Link>
//                   </TableCell>
//                   <TableCell className="p-2 py-4">
//                     <div className="flex items-center gap-3">
//                       <img
//                         src={booking.customer.image}
//                         alt={booking.customer.name}
//                         className="w-8 h-8 rounded-full object-cover"
//                       />
//                       <div>
//                         <div className="text-sm font-medium text-gray-900">
//                           {booking.customer.name}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           {booking.customer.email}
//                         </div>
//                       </div>
//                     </div>
//                   </TableCell>
//                   <TableCell className="p-2 py-4 text-sm text-gray-500">
//                     {new Date(booking.dateTime).toLocaleString()}
//                   </TableCell>
//                   <TableCell className="p-2 text-sm text-gray-500">
//                     {booking.vetType}
//                   </TableCell>
//                   <TableCell className="p-2 text-sm font-medium text-gray-900">
//                     ${booking.price}
//                   </TableCell>
//                   <TableCell className="p-2 py-4">
//                     <div className="flex items-center gap-3">
//                       <img
//                         src={booking.pet.image}
//                         alt={booking.pet.name}
//                         className="w-8 h-8 rounded-full object-cover"
//                       />
//                       <span className="text-sm text-gray-900">
//                         {booking.pet.name}
//                       </span>
//                     </div>
//                   </TableCell>
//                   <TableCell className="p-2 text-sm py-4 text-gray-500">
//                     {booking.petDetail}
//                   </TableCell>
//                   <TableCell className="p-2 py-4">
//                     <div className="flex items-center gap-3">
//                       <img
//                         src={booking.veterinarian.image}
//                         alt={booking.veterinarian.name}
//                         className="w-8 h-8 rounded-full object-cover"
//                       />
//                       <span className="text-sm text-gray-900">
//                         {booking.veterinarian.name}
//                       </span>
//                     </div>
//                   </TableCell>
//                   <TableCell className="p-2 py-4 text-sm text-gray-500">
//                     {new Date(booking.updatedAt).toLocaleString()}
//                   </TableCell>
//                   <TableCell className="p-2 py-4">
//                     <Badge
//                       size="sm"
//                       color={
//                         booking.bookingStatus === "Completed"
//                           ? "success"
//                           : booking.bookingStatus === "Pending"
//                             ? "warning"
//                             : "error"
//                       }
//                     >
//                       {booking.bookingStatus}
//                     </Badge>
//                   </TableCell>
//                   <TableCell className="p-2 py-4">
//                     <Badge
//                       size="sm"
//                       color={
//                         booking.paymentStatus === "Paid" ? "success" : "warning"
//                       }
//                     >
//                       {booking.paymentStatus}
//                     </Badge>
//                   </TableCell>
//                   <TableCell className="p-2 py-4">
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => handleEdit(booking)}
//                         className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
//                       >
//                         <MdEdit className="w-5 h-5" />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(booking.id)}
//                         className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
//                       >
//                         <MdDelete className="w-5 h-5" />
//                       </button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       </div>

//       {/* Pagination - Keep as is */}
//       <Pagination
//         totalItems={filteredData.length}
//         itemsPerPage={itemsPerPage}
//         onPageChange={handlePageChange}
//         onItemsPerPageChange={handleItemsPerPageChange}
//       />

//       {/* Keep all your existing dialog components exactly as they are */}
//       {isAddDialogOpen || editBooking ? (
//         <VetBookingForm
//           booking={editBooking}
//           onSubmit={editBooking ? confirmEdit : confirmAddNew}
//           onCancel={() => {
//             setIsAddDialogOpen(false);
//             setEditBooking(null);
//           }}
//         />
//       ) : null}

//       {isDeleteDialogOpen && (
//         <div className="fixed inset-0  flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 max-w-md w-full border-b pb-8">
//             <h3 className="text-lg font-medium text-gray-900 mb-4">
//               Confirm Deletion
//             </h3>
//             <p className="text-sm text-gray-500 mb-6">
//               {bookingToDelete
//                 ? "Are you sure you want to delete this booking?"
//                 : `Are you sure you want to delete ${selectedRows.length} selected bookings?`}
//             </p>
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setIsDeleteDialogOpen(false)}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDelete}
//                 className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
