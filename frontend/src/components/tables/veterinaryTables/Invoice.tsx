import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdDownload, MdArrowBack } from "react-icons/md";
// import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export interface Booking {
  id: number;
  customer: {
    name: string;
    email: string;
    image: string;
  };
  pet: {
    name: string;
    image: string;
  };
  petDetail: string;
  vetType: string;
  dateTime: string;
  price: string;
  veterinarian: {
    name: string;
    image: string;
  };
  updatedAt: string;
  bookingStatus: string;
  paymentStatus: string;
}

// Mock function to fetch booking details - replace with your actual API call
const getBookingById = (id: number): Booking | undefined => {
    const defaultImage = 'https://media.istockphoto.com/id/814423752/photo/eye-of-model-with-colorful-art-make-up-close-up.jpg?s=612x612&w=0&k=20&c=l15OdMWjgCKycMMShP8UK94ELVlEGvt7GmB_esHWPYE=';
  
    const mockBookings: Booking[] = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      customer: {
        image: defaultImage,
        name: `Customer ${i + 1}`,
        email: `customer${i + 1}@example.com`,
      },
      dateTime: new Date(Date.now() + i * 86400000).toISOString().slice(0, 16),
      vetType: "General Checkup",
      price: "50",
      pet: {
        image: defaultImage,
        name: `Pet ${i + 1}`,
      },
      petDetail: "Golden Retriever, 2 years old",
      veterinarian: {
        image: defaultImage,
        name: `Vet ${i + 1}`,
      },
      updatedAt: "2025-03-14 08:30 AM",
      bookingStatus: i % 3 === 0 ? "Completed" : "Pending",
      paymentStatus: i % 2 === 0 ? "Paid" : "Pending",
    }));
    return mockBookings.find(booking => booking.id === id);
  };

const Invoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const bookingId = id ? parseInt(id) : 0;
  const booking = getBookingById(bookingId);

  if (!booking) {
    return <div className="p-4">Booking not found</div>;
  }
  
  const handleDownloadPDF = () => {
    try {
      const pdf = new jsPDF('p', 'pt', 'a4');
      const margin = 40;
      const pageWidth = pdf.internal.pageSize.width;
      
      // Header
      pdf.setFontSize(20);
      pdf.setTextColor(40);
      pdf.text('INVOICE', margin, margin + 20);
      pdf.setFontSize(12);
      pdf.text(`#${booking.id}`, margin, margin + 40);
      
      // Clinic Info (right-aligned)
      pdf.setFontSize(14);
      pdf.text('Vet Clinic', pageWidth - margin, margin + 20, { align: 'right' });
      pdf.setFontSize(10);
      pdf.text('123 Veterinary Street', pageWidth - margin, margin + 40, { align: 'right' });
      pdf.text('City, State 10001', pageWidth - margin, margin + 55, { align: 'right' });

      // Customer Details
      pdf.setFontSize(14);
      pdf.text('Customer Details:', margin, margin + 100);
      pdf.setFontSize(12);
      pdf.text(`Name: ${booking.customer.name}`, margin, margin + 120);
      pdf.text(`Email: ${booking.customer.email}`, margin, margin + 140);

      // Booking Info
      pdf.text(`Date: ${new Date(booking.dateTime).toLocaleDateString()}`, margin, margin + 170);
      pdf.text(`Status: ${booking.paymentStatus}`, margin, margin + 190);

      // Pet Details
      pdf.setFontSize(14);
      pdf.text('Pet Details:', margin, margin + 230);
      pdf.setFontSize(12);
      pdf.text(`Name: ${booking.pet.name}`, margin, margin + 250);
      pdf.text(`Details: ${booking.petDetail}`, margin, margin + 270);

      // Veterinarian
      pdf.text('Veterinarian:', margin, margin + 310);
      pdf.text(`Name: ${booking.veterinarian.name}`, margin, margin + 330);
      pdf.text(`Service: ${booking.vetType}`, margin, margin + 350);

      // Services Table
      pdf.setFontSize(14);
      pdf.text('Services:', margin, margin + 390);
      pdf.line(margin, margin + 400, pageWidth - margin, margin + 400);
      
      // Table Header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, margin + 410, pageWidth - 2 * margin, 20, 'F');
      pdf.setTextColor(40);
      pdf.text('Description', margin + 10, margin + 425);
      pdf.text('Price', pageWidth - margin - 10, margin + 425, { align: 'right' });
      
      // Table Row
      pdf.text(booking.vetType, margin + 10, margin + 445);
      pdf.text(`$${booking.price}`, pageWidth - margin - 10, margin + 445, { align: 'right' });

      // Total Row
      pdf.setFont('helvetica', 'bold');
      pdf.text('Total', margin + 10, margin + 475);
      pdf.text(`$${booking.price}`, pageWidth - margin - 10, margin + 475, { align: 'right' });

      // Footer
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('Thank you for choosing our veterinary services.', 
        margin, pdf.internal.pageSize.height - 40);
      pdf.text('Please contact us if you have any questions.', 
        margin, pdf.internal.pageSize.height - 25);

      pdf.save(`invoice_${booking.id}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800"
      >
        <MdArrowBack className="w-5 h-5" />
        <span>Back to Bookings</span>
      </button>

      <div id="invoice-content" className="bg-white rounded-lg p-8">
        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-8 border-b pb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">INVOICE</h1>
            <p className="text-gray-600">#{booking.id}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold">Vet Clinic</h2>
            <p className="text-gray-600">123 Veterinary Street</p>
            <p className="text-gray-600">City, State 10001</p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">Customer Details</h3>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={booking.customer.image}
                alt={booking.customer.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">{booking.customer.name}</p>
                <p className="text-gray-600">{booking.customer.email}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Invoice Information</h3>
            <div className="space-y-1">
              <p><span className="font-medium">Date:</span> {new Date(booking.dateTime).toLocaleDateString()}</p>
              <p><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded text-xs ${
                booking.paymentStatus === "Paid" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {booking.paymentStatus}
              </span></p>
              <p><span className="font-medium">Due Date:</span> {new Date(booking.dateTime).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Pet and Vet Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">Pet Details</h3>
            <div className="flex items-center gap-4">
              <img
                src={booking.pet.image}
                alt={booking.pet.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">{booking.pet.name}</p>
                <p className="text-gray-600">{booking.petDetail}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Veterinarian</h3>
            <div className="flex items-center gap-4">
              <img
                src={booking.veterinarian.image}
                alt={booking.veterinarian.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">{booking.veterinarian.name}</p>
                <p className="text-gray-600">{booking.vetType}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Services</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-2 px-4 border">Description</th>
                <th className="text-right py-2 px-4 border">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4 border">{booking.vetType}</td>
                <td className="py-2 px-4 border text-right">${booking.price}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-2 px-4 border font-semibold">Total</td>
                <td className="py-2 px-4 border text-right font-semibold">${booking.price}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t pt-6">
          <p className="text-gray-600 text-sm">
            Thank you for choosing our veterinary services. Please contact us if you have any questions.
          </p>
        </div>
      </div>

      {/* Download Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <MdDownload className="w-5 h-5" />
          <span>Download Invoice</span>
        </button>
      </div>
    </div>
  );
};

export default Invoice;