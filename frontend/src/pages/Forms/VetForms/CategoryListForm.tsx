import React from "react";
import { useForm } from "react-hook-form";
import FormCard from "../../../components/form/FormCard";
import Badge from "../../../components/ui/badge/Badge";
import ImageUpload from "../../FormComponents/ImageUpload";

export interface CategoryFormData {
  name: string;
  status: "Active" | "Inactive";
  image?: File | string;
}

export interface Category {
  id: number;
  name: string;
  status: "Active" | "Inactive";
  image?: string;
}

interface CategoryFormProps {
  category?: Category | null;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
}

const CategoryListForm: React.FC<CategoryFormProps> = ({
  category,
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
  } = useForm<CategoryFormData>({
    defaultValues: category
      ? {
          name: category.name,
          status: category.status,
          image: category.image || undefined,
        }
      : {
          name: "",
          status: "Active",
          image: undefined,
        },
  });

  // Watch form values
  const status = watch("status");

  // Status badge color
  const getStatusColor = (status: string) => 
    status === "Active" ? "success" : "error";

  const onFormSubmit = (data: CategoryFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <div className="p-4 mx-auto max-w-4xl md:p-6">
      <FormCard
        title={category ? "Edit Category" : "Create Category"}
        onClose={onCancel}
      >
        <form 
          id="category-form" 
          onSubmit={handleSubmit(onFormSubmit)} 
          className="space-y-8"
        >
          {/* Profile Image Section */}
          <section className="space-y-6">
            <section className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Category Image
            </h3>

            <div className="flex flex-col items-center space-y-4">
              <ImageUpload
                label="Upload Category Image"
                shape="circle"           // or "rounded" if you prefer
                size="md"
                maxSizeMB={3}
                value={watch("image")}
                onChange={(file) =>
                  setValue("image", file || undefined, {
                    shouldDirty: true,
                    shouldTouch: true,
                  })
                }
                showRemove
              />
            </div>
          </section>
          </section>

          {/* Basic Information Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Category Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="name">
                  Name *
                </label>
                <input
                  id="name"
                  type="text"
                  className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("name", { 
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters"
                    }
                  })}
                />
                {errors.name && (
                  <span className="text-sm text-red-600">{errors.name.message}</span>
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
                  {category ? "Updating..." : "Creating..."}
                </span>
              ) : (
                category ? "Update Category" : "Create Category"
              )}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default CategoryListForm;