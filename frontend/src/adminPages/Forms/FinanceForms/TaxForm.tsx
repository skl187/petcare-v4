import React from "react";
import { useForm } from "react-hook-form";
import FormCard from "../../../components/form/FormCard";
import Badge from "../../../components/ui/badge/Badge";
import Switch from "../../../components/form/switch/Switch";

export interface TaxFormData {
  title: string;
  value: number;
  type: "fixed" | "percentage";
  moduleType: "services" | "products";
  status: "active" | "inactive";
}

export interface Tax {
  id: number;
  title: string;
  value: number;
  type: "fixed" | "percentage";
  moduleType: "services" | "products";
  status: "active" | "inactive";
}

interface TaxFormProps {
  tax?: Tax | null;
  onSubmit: (data: TaxFormData) => void;
  onCancel: () => void;
}

const TaxForm: React.FC<TaxFormProps> = ({
  tax,
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
  } = useForm<TaxFormData>({
    defaultValues: tax
      ? {
          title: tax.title,
          value: tax.value,
          type: tax.type,
          moduleType: tax.moduleType,
          status: tax.status,
        }
      : {
          title: "",
          value: 0,
          type: "fixed",
          moduleType: "services",
          status: "active",
        },
  });

  // Watch form values
  const status = watch("status");
  const type = watch("type");
  const moduleType = watch("moduleType");

  // Status badge colors
  const getStatusColor = (status: string) => 
    status === "active" ? "success" : "error";
  
  const getTypeColor = (type: string) => 
    type === "percentage" ? "info" : "success";
const onFormSubmit = (data: TaxFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <div className="p-4 mx-auto max-w-4xl md:p-6">
      <FormCard
        title={tax ? "Edit Tax" : "Create Tax"}
        onClose={onCancel}
      >
        <form 
          id="tax-form" 
          onSubmit={handleSubmit(onFormSubmit)} 
          className="space-y-8"
        >
          {/* Basic Information Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Tax Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="title">
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("title", { 
                    required: "Title is required",
                    minLength: {
                      value: 2,
                      message: "Title must be at least 2 characters"
                    }
                  })}
                />
                {errors.title && (
                  <span className="text-sm text-red-600">{errors.title.message}</span>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="value">
                  Value *
                </label>
                <input
                  id="value"
                  type="number"
                  step={type === "percentage" ? "0.1" : "1"}
                  className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.value ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("value", { 
                    required: "Value is required",
                    min: {
                      value: 0,
                      message: "Value must be positive"
                    },
                    max: type === "percentage" ? {
                      value: 100,
                      message: "Percentage must be ≤ 100"
                    } : undefined
                  })}
                />
                {errors.value && (
                  <span className="text-sm text-red-600">{errors.value.message}</span>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="type">
                  Type *
                </label>
                <div className="flex items-center gap-3">
                  <Badge 
                    size="sm" 
                    color={getTypeColor(type)}
                  >
                    {type}
                  </Badge>
                  <select
                    className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.type ? "border-red-500" : "border-gray-300"
                    }`}
                    {...register("type", { required: "Type is required" })}
                  >
                    <option value="fixed">Fixed</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>
                {errors.type && (
                  <span className="text-sm text-red-600">{errors.type.message}</span>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="moduleType">
                  Module Type *
                </label>
                <div className="flex items-center gap-3">
                  
                    {moduleType}
                  
                  <select
                    className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.moduleType ? "border-red-500" : "border-gray-300"
                    }`}
                    {...register("moduleType", { required: "Module type is required" })}
                  >
                    <option value="services">Services</option>
                    <option value="products">Products</option>
                  </select>
                </div>
                {errors.moduleType && (
                  <span className="text-sm text-red-600">{errors.moduleType.message}</span>
                )}
              </div>
            </div>
          </section>

          {/* Status Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Status
            </h3>
            
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Tax Status
              </label>
              <div className="flex items-center gap-3">
                <Badge 
                  size="sm" 
                  color={getStatusColor(status)}
                >
                  {status}
                </Badge>
                <Switch
                  label=""
                  checked={status === "active"}
                  onChange={(checked) => setValue("status", checked ? "active" : "inactive")}
                />
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
                  {tax ? "Updating..." : "Creating..."}
                </span>
              ) : (
                tax ? "Update Tax" : "Create Tax"
              )}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default TaxForm;