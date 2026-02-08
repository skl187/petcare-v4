import React from "react";
import { useForm } from "react-hook-form";
import FormCard from "../../../components/form/FormCard";
import Badge from "../../../components/ui/badge/Badge";

export interface CityLocationFormData {
  name: string;
  state: string;
  status: "Active" | "Inactive";
}

export interface CityLocation {
  id: number;
  name: string;
  state: string;
  country: string;
  status: "Active" | "Inactive";
}

interface CityLocationFormProps {
  city?: CityLocation | null;
  onSubmit: (data: CityLocationFormData) => void;
  onCancel: () => void;
}

const CityLocationForm: React.FC<CityLocationFormProps> = ({
  city,
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
  } = useForm<CityLocationFormData>({
    defaultValues: city
      ? {
          name: city.name,
          state: city.state,
          status: city.status,
        }
      : {
          name: "",
          state: "",
          status: "Active",
        },
  });

  // Watch form values
  const status = watch("status");

  // Status badge color
  const getStatusColor = (status: string) => 
    status === "Active" ? "success" : "error";

  const onFormSubmit = (data: CityLocationFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <div className="p-4 mx-auto max-w-4xl md:p-6">
      <FormCard
        title={city ? "Edit City" : "Create City"}
        onClose={onCancel}
      >
        <form 
          id="city-form" 
          onSubmit={handleSubmit(onFormSubmit)} 
          className="space-y-8"
        >
          {/* Basic Information Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              City Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="name">
                  City Name *
                </label>
                <input
                  id="name"
                  type="text"
                  className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("name", { 
                    required: "City name is required",
                    minLength: {
                      value: 2,
                      message: "City name must be at least 2 characters"
                    }
                  })}
                />
                {errors.name && (
                  <span className="text-sm text-red-600">{errors.name.message}</span>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="state">
                  State Name *
                </label>
                <input
                  id="state"
                  type="text"
                  className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.state ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("state", { 
                    required: "State name is required",
                    minLength: {
                      value: 2,
                      message: "State name must be at least 2 characters"
                    }
                  })}
                />
                {errors.state && (
                  <span className="text-sm text-red-600">{errors.state.message}</span>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="country">
                  Country
                </label>
                <input
                  id="country"
                  type="text"
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value="United States"
                  readOnly
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
                  {city ? "Updating..." : "Creating..."}
                </span>
              ) : (
                city ? "Update City" : "Create City"
              )}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default CityLocationForm;