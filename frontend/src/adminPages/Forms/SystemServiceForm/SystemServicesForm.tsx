import React, { useState } from "react";
import { useForm } from "react-hook-form";
import FormCard from "../../../components/form/FormCard";
import Badge from "../../../components/ui/badge/Badge";

export interface SystemServiceFormData {
  name: string;
  description: string;
  status: "Active" | "Inactive";
  image?: File | string;
}

export interface SystemService {
  id: number;
  name: string;
  description: string;
  status: "Active" | "Inactive";
  image?: string;
}

interface SystemServiceFormProps {
  service?: SystemService | null;
  onSubmit: (data: SystemServiceFormData) => void;
  onCancel: () => void;
}

const SystemServiceForm: React.FC<SystemServiceFormProps> = ({
  service,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<SystemServiceFormData>({
    defaultValues: service
      ? {
          name: service.name,
          description: service.description,
          status: service.status,
          image: service.image || undefined,
        }
      : {
          name: "",
          description: "",
          status: "Active",
          image: undefined,
        },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    service?.image || null
  );

  // Watch form values
  const status = watch("status");
  const name = watch("name");

  // Status badge color
  const getStatusColor = (status: string) => 
    status === "Active" ? "success" : "error";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setValue("image", file);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setValue("image", undefined);
  };

  const onFormSubmit = (data: SystemServiceFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <div className="p-2 mx-auto max-w-3xl md:p-3">
      <FormCard
        title={service ? "Edit Service" : "Add New Service"}
        onClose={onCancel}
      >
        <form 
          id="service-form" 
          onSubmit={handleSubmit(onFormSubmit)} 
          className="space-y-4"
        >
          {/* Profile Layout: Left Sidebar + Right Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Sidebar - Service Image Card */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-2">
                {/* Service Image */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative w-28 h-28">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Service preview"
                        className="w-full h-full rounded-lg object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-xs text-center">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Service Name Display */}
                  <div className="text-center border-t pt-3 w-full">
                    <h3 className="text-sm font-bold text-gray-800 truncate">
                      {name || "Service Name"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Service</p>
                  </div>

                  {/* Status Badge */}
                  <div className="w-full">
                    <p className="text-xs text-gray-500 uppercase tracking-wide text-center mb-2">Status</p>
                    <Badge 
                      size="sm" 
                      color={getStatusColor(status)}
                      className="w-full text-center justify-center"
                    >
                      {status}
                    </Badge>
                  </div>

                  {/* Image Upload Buttons */}
                  <div className="w-full flex flex-col gap-2 pt-2 border-t">
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <label
                      htmlFor="image"
                      className="block px-3 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 cursor-pointer transition duration-200 text-xs font-medium"
                    >
                      {imagePreview ? "Change" : "Upload"}
                    </label>
                    
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200 text-xs font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Information Grid */}
            <div className="lg:col-span-2 space-y-4">
              {/* Service Details Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <svg className="w-4 h-4 text-gray-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-base font-semibold text-gray-800">Service Details</h3>
                </div>

                <div className="space-y-3">
                  {/* Service Name */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1" htmlFor="name">
                      Service Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Enter service name"
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("name", { 
                        required: "Service name is required",
                        minLength: {
                          value: 2,
                          message: "Service name must be at least 2 characters"
                        }
                      })}
                    />
                    {errors.name && (
                      <span className="text-xs text-red-600 mt-0.5 block">{errors.name.message}</span>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1" htmlFor="description">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      placeholder="Enter service description"
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none ${
                        errors.description ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("description", { 
                        required: "Description is required",
                        minLength: {
                          value: 10,
                          message: "Description must be at least 10 characters"
                        }
                      })}
                    />
                    {errors.description && (
                      <span className="text-xs text-red-600 mt-0.5 block">{errors.description.message}</span>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                      Status
                    </label>
                    <select
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      value={status}
                      onChange={(e) => 
                        setValue("status", e.target.value as "Active" | "Inactive")
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition duration-200 text-sm font-medium disabled:opacity-70"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 text-sm font-medium disabled:opacity-70 flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {service ? "Updating..." : "Creating..."}
                </span>
              ) : (
                service ? "Update Service" : "Create Service"
              )}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default SystemServiceForm;