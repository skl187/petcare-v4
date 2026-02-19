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
    <div className="p-4 mx-auto max-w-4xl md:p-6">
      <FormCard
        title={service ? "Edit Service" : "Create Service"}
        onClose={onCancel}
      >
        <form 
          id="service-form" 
          onSubmit={handleSubmit(onFormSubmit)} 
          className="space-y-8"
        >
          {/* Service Image Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Service Image
            </h3>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Service preview"
                    className="w-full h-full rounded-lg object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No image</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <div>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor="image"
                    className="block px-4 py-2 bg-indigo-600 text-white text-center rounded-md hover:bg-indigo-700 cursor-pointer transition duration-200"
                  >
                    {imagePreview ? "Change Image" : "Upload Image"}
                  </label>
                </div>
                
                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Service Information Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Service Details
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="name">
                  Service Name *
                </label>
                <input
                  id="name"
                  type="text"
                  className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
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
                  <span className="text-sm text-red-600">{errors.name.message}</span>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="description">
                  Description *
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
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
                  <span className="text-sm text-red-600">{errors.description.message}</span>
                )}
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
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="flex items-center gap-3">
                  <Badge 
                    size="sm" 
                    color={getStatusColor(status)}
                  >
                    {status}
                  </Badge>
                  <select
                    className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
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