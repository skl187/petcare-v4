import React from "react";
import { useForm } from "react-hook-form";
import FormCard from "../../../components/form/FormCard";
import Badge from "../../../components/ui/badge/Badge";
import Switch from "../../../components/form/switch/Switch";
import { MdPets } from "react-icons/md";
import ImageUpload from "../../FormComponents/ImageUpload";

export interface OwnerAndPetsFormData {
  name: string;
  email: string;
  image?: File | string;
  contactNumber: string;
  petCount: number;
  gender: "Male" | "Female" | "Other";
  status: "Active" | "Inactive";
}

export interface OwnerAndPet {
  id: number;
  name: string;
  email: string;
  image: string;
  contactNumber: string;
  petCount: number;
  updatedAt: string;
  gender: "Male" | "Female" | "Other";
  status: "Active" | "Inactive";
}

interface OwnerAndPetsFormProps {
  owner?: OwnerAndPet | null;
  onSubmit: (data: OwnerAndPetsFormData) => void;
  onCancel: () => void;
}

const OwnerAndPetsForm: React.FC<OwnerAndPetsFormProps> = ({
  owner,
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
  } = useForm<OwnerAndPetsFormData>({
    defaultValues: owner
      ? {
          name: owner.name,
          email: owner.email,
          image: owner.image,
          contactNumber: owner.contactNumber,
          petCount: owner.petCount,
          gender: owner.gender,
          status: owner.status,
        }
      : {
          name: "",
          email: "",
          image: undefined,
          contactNumber: "",
          petCount: 1,
          gender: "Male",
          status: "Active",
        },
  });

  // Watch form values
  const status = watch("status");
  const gender = watch("gender");
  const petCount = watch("petCount");

  // Status badge colors
  const getStatusColor = (status: string) => 
    status === "Active" ? "success" : "error";

  const onFormSubmit = (data: OwnerAndPetsFormData) => {
    onSubmit(data);
    reset();
  };

  const updatePetCount = (increment: boolean) => {
    const newCount = increment ? petCount + 1 : Math.max(0, petCount - 1);
    setValue("petCount", newCount);
  };

  return (
    <div className="p-4 mx-auto max-w-4xl md:p-6">
      <FormCard
        title={owner ? "Edit Owner" : "Create Owner"}
        onClose={onCancel}
      >
        <form 
          id="owner-form" 
          onSubmit={handleSubmit(onFormSubmit)} 
          className="space-y-8"
        >
          {/* Profile Image Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Profile Image
            </h3>
            
             <div className="flex flex-col items-center space-y-4">
              <ImageUpload
                label="Upload Employee Image"
                shape="circle"
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

          {/* Basic Information Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Basic Information
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

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="email">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                />
                {errors.email && (
                  <span className="text-sm text-red-600">{errors.email.message}</span>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="contactNumber">
                  Contact Number *
                </label>
                <input
                  id="contactNumber"
                  type="tel"
                  className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.contactNumber ? "border-red-500" : "border-gray-300"
                  }`}
                  {...register("contactNumber", { 
                    required: "Contact number is required",
                    pattern: {
                      value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
                      message: "Invalid phone number format"
                    }
                  })}
                />
                {errors.contactNumber && (
                  <span className="text-sm text-red-600">{errors.contactNumber.message}</span>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="gender">
                  Gender *
                </label>
                <div className="flex items-center gap-3">
                  <Badge 
                    size="sm" 
                    color='success'
                  >
                    {gender}
                  </Badge>
                  <select
                    className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.gender ? "border-red-500" : "border-gray-300"
                    }`}
                    {...register("gender", { required: "Gender is required" })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {errors.gender && (
                  <span className="text-sm text-red-600">{errors.gender.message}</span>
                )}
              </div>
            </div>
          </section>

          {/* Pet Count Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Pet Information
            </h3>
            
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Pet Count
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => updatePetCount(false)}
                    className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
                    disabled={petCount <= 0}
                  >
                    -
                  </button>
                  <span className="px-4 py-1 bg-gray-100 rounded text-center min-w-[50px]">
                    {petCount}
                  </span>
                  <button 
                    type="button"
                    onClick={() => updatePetCount(true)}
                    className="px-3 py-1 border rounded-md hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <MdPets className="text-gray-400 text-xl" />
                <input
                  type="hidden"
                  {...register("petCount", { 
                    required: "Pet count is required",
                    min: {
                      value: 0,
                      message: "Pet count cannot be negative"
                    }
                  })}
                />
              </div>
              {errors.petCount && (
                <span className="text-sm text-red-600">{errors.petCount.message}</span>
              )}
            </div>
          </section>

          {/* Status Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Status
            </h3>
            
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Account Status
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
                  checked={status === "Active"}
                  onChange={(checked) => setValue("status", checked ? "Active" : "Inactive")}
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
                  {owner ? "Updating..." : "Creating..."}
                </span>
              ) : (
                owner ? "Update Owner" : "Create Owner"
              )}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default OwnerAndPetsForm;