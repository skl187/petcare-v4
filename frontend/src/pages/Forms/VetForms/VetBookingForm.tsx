import React from "react";
import { useForm } from "react-hook-form";
import FormCard from "../../../components/form/FormCard";
import ImageUpload from "../../FormComponents/ImageUpload";

export interface BookingFormData {
  customerName: string;
  customerLastName: string;
  customerEmail: string;
  customerImage?: File | string;
  petName: string;
  petImage?: File | string;
  petDetail: string;
  vetType: string;
  dateTime: string;
  price: string;
  vetName: string;
  vetImage?: File | string;
  bookingStatus: string;
  paymentStatus: string;
}

export interface Booking {
  id: number;
  customer: {
    name: string;
    customerLastName: string;
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
  bookingStatus: string;
  paymentStatus: string;
}

interface VetBookingFormProps {
  booking?: Booking | null;
  onSubmit: (data: BookingFormData) => void;
  onCancel: () => void;
}

const VetBookingForm: React.FC<VetBookingFormProps> = ({
  booking,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<BookingFormData>({
    defaultValues: booking
      ? {
          customerName: booking.customer.name,
          customerLastName: booking.customer.customerLastName,
          customerEmail: booking.customer.email,
          customerImage: booking.customer.image,
          petName: booking.pet.name,
          petImage: booking.pet.image,
          petDetail: booking.petDetail,
          vetType: booking.vetType,
          dateTime: booking.dateTime,
          price: booking.price,
          vetName: booking.veterinarian.name,
          vetImage: booking.veterinarian.image,
          bookingStatus: booking.bookingStatus,
          paymentStatus: booking.paymentStatus,
        }
      : {
          customerName: "",
          customerLastName: "",
          customerEmail: "",
          customerImage: undefined,
          petName: "",
          petImage: undefined,
          petDetail: "",
          vetType: "",
          dateTime: "",
          price: "",
          vetName: "",
          vetImage: undefined,
          bookingStatus: "Pending",
          paymentStatus: "Pending",
        },
  });

  const onFormSubmit = (data: BookingFormData) => {
    onSubmit(data);
  };

  return (
    <div className="p-4 mx-auto max-w-4xl md:p-6">
        <FormCard
          title={booking ? "Edit Booking" : "Create Booking"}
          onClose={onCancel}
        >
          <form 
            id="booking-form" 
            onSubmit={handleSubmit(onFormSubmit)} 
            className="space-y-8"
          >
            {/* Customer Section */}
            <section className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Customer Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Customer Image (using reusable component) */}
              <div className="flex flex-col items-center space-y-4">
                <ImageUpload
                  label="Upload Customer Image"
                  shape="circle"
                  size="md"
                  value={watch("customerImage")}
                  onChange={(file) =>
                    setValue("customerImage", file || undefined, {
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                  }
                />
              </div>

                {/* Customer Details */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="customerName">
                      Customer Name *
                    </label>
                    <input
                      id="customerName"
                      type="text"
                      className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.customerName ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("customerName", { required: "Customer name is required" })}
                    />
                    {errors.customerName && (
                      <span className="text-sm text-red-600">{errors.customerName.message}</span>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="customerLastName">
                      Customer Last Name *
                    </label>
                    <input
                      id="customerLastName"
                      type="text"
                      className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.customerLastName ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("customerLastName", { required: "Customer name is required" })}
                    />
                    {errors.customerLastName && (
                      <span className="text-sm text-red-600">{errors.customerLastName.message}</span>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="customerEmail">
                      Customer Email *
                    </label>
                    <input
                      id="customerEmail"
                      type="email"
                      className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.customerEmail ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("customerEmail", { 
                        required: "Customer email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address"
                        }
                      })}
                    />
                    {errors.customerEmail && (
                      <span className="text-sm text-red-600">{errors.customerEmail.message}</span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Pet Section */}
            <section className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Pet Information
              </h3>
              
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pet Image */}
              <div className="flex flex-col items-center space-y-4">
                <ImageUpload
                  label="Upload Pet Image"
                  shape="circle"
                  size="md"
                  value={watch("petImage")}
                  onChange={(file) =>
                    setValue("petImage", file || undefined, {
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                  }
                />
              </div>

                {/* Pet Details */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="petName">
                      Pet Name *
                    </label>
                    <input
                      id="petName"
                      type="text"
                      className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.petName ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("petName", { required: "Pet name is required" })}
                    />
                    {errors.petName && (
                      <span className="text-sm text-red-600">{errors.petName.message}</span>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="petDetail">
                      Pet Details *
                    </label>
                    <input
                      id="petDetail"
                      type="text"
                      className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.petDetail ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("petDetail", { required: "Pet details are required" })}
                    />
                    {errors.petDetail && (
                      <span className="text-sm text-red-600">{errors.petDetail.message}</span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Booking Details Section */}
            <section className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Booking Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="vetType">
                    Vet Type *
                  </label>
                  <select
                    id="vetType"
                    className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.vetType ? "border-red-500" : "border-gray-300"
                    }`}
                    {...register("vetType", { required: "Vet type is required" })}
                  >
                    <option value="">Select Vet Type</option>
                    <option value="General Checkup">General Checkup</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Dental">Dental</option>
                  </select>
                  {errors.vetType && (
                    <span className="text-sm text-red-600">{errors.vetType.message}</span>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="dateTime">
                    Date & Time *
                  </label>
                  <input
                    id="dateTime"
                    type="datetime-local"
                    className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.dateTime ? "border-red-500" : "border-gray-300"
                    }`}
                    {...register("dateTime", { required: "Date and time are required" })}
                  />
                  {errors.dateTime && (
                    <span className="text-sm text-red-600">{errors.dateTime.message}</span>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="price">
                    Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      className={`pl-8 px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.price ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("price", { 
                        required: "Price is required",
                        min: {
                          value: 0,
                          message: "Price must be positive"
                        }
                      })}
                    />
                  </div>
                  {errors.price && (
                    <span className="text-sm text-red-600">{errors.price.message}</span>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="vetName">
                    Veterinarian Name *
                  </label>
                  <input
                    id="vetName"
                    type="text"
                    className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.vetName ? "border-red-500" : "border-gray-300"
                    }`}
                    {...register("vetName", { required: "Vet name is required" })}
                  />
                  {errors.vetName && (
                    <span className="text-sm text-red-600">{errors.vetName.message}</span>
                  )}
                </div>
              </div>
            </section>

            {/* Veterinarian Image */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Veterinarian Image
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center space-y-4">
                <ImageUpload
                  label="Upload Vet Image"
                  shape="circle"
                  size="md"
                  value={watch("vetImage")}
                  onChange={(file) =>
                    setValue("vetImage", file || undefined, {
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                  }
                />
              </div>
            </div>
          </section>

            {/* Status Section */}
            <section className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Status
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="bookingStatus">
                    Booking Status *
                  </label>
                  <select
                    id="bookingStatus"
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    {...register("bookingStatus", { required: "Booking status is required" })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="paymentStatus">
                    Payment Status *
                  </label>
                  <select
                    id="paymentStatus"
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    {...register("paymentStatus", { required: "Payment status is required" })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200 disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {booking ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  booking ? "Update Booking" : "Create Booking"
                )}
              </button>
            </div>
          </form>
        </FormCard>
    </div>
  );
};

export default VetBookingForm;