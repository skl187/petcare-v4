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
    <div className="p-2 mx-auto max-w-4xl md:p-3">
      <FormCard
        title={owner ? "Edit Owner" : "Create Owner"}
        onClose={onCancel}
      >
        <form 
          id="owner-form" 
          onSubmit={handleSubmit(onFormSubmit)} 
          className="space-y-4"
        >
          {/* Profile Layout: Left Sidebar + Right Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Sidebar - Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-2">
                {/* Profile Image */}
                <div className="flex flex-col items-center space-y-2 mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-200 flex items-center justify-center bg-gray-100">
                    <ImageUpload
                      label=""
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
                </div>

                {/* Profile Name Section */}
                <div className="text-center border-b pb-2 mb-2">
                  <h2 className="text-lg font-bold text-gray-800">
                    {watch("name") || "Owner Name"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Pet Owner</p>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-center gap-2 py-2 border-b mb-2">
                  <Badge 
                    size="sm" 
                    color={getStatusColor(status)}
                  >
                    {status}
                  </Badge>
                </div>

                {/* Member Since */}
                <div className="text-center border-b pb-2 mb-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Member Since</p>
                  <p className="text-xs font-semibold text-gray-700 mt-1">
                    {owner?.updatedAt ? new Date(owner.updatedAt).toLocaleDateString() : "New"}
                  </p>
                </div>

                {/* Account Status */}
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Account Status</p>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Switch
                      label=""
                      checked={status === "Active"}
                      onChange={(checked) => setValue("status", checked ? "Active" : "Inactive")}
                    />
                  </div>
                  <Badge 
                    size="sm" 
                    color={getStatusColor(status)}
                  >
                    {status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Right Content - Information Grid */}
            <div className="lg:col-span-2 space-y-4">
              {/* About Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <svg className="w-4 h-4 text-gray-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-base font-semibold text-gray-800">About</h3>
                </div>

                {/* Basic Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {/* Name */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter full name"
                      {...register("name", { 
                        required: "Name is required",
                        minLength: {
                          value: 2,
                          message: "Name must be at least 2 characters"
                        }
                      })}
                    />
                    {errors.name && (
                      <span className="text-xs text-red-600 mt-0.5 block">{errors.name.message}</span>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                      Gender
                    </label>
                    <select
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                        errors.gender ? "border-red-500" : "border-gray-300"
                      }`}
                      {...register("gender", { required: "Gender is required" })}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && (
                      <span className="text-xs text-red-600 mt-0.5 block">{errors.gender.message}</span>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter email address"
                      {...register("email", { 
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address"
                        }
                      })}
                    />
                    {errors.email && (
                      <span className="text-xs text-red-600 mt-0.5 block">{errors.email.message}</span>
                    )}
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                      Contact No.
                    </label>
                    <input
                      type="tel"
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${
                        errors.contactNumber ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter contact number"
                      {...register("contactNumber", { 
                        required: "Contact number is required",
                        pattern: {
                          value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
                          message: "Invalid phone number format"
                        }
                      })}
                    />
                    {errors.contactNumber && (
                      <span className="text-xs text-red-600 mt-0.5 block">{errors.contactNumber.message}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Pet Information Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <MdPets className="w-4 h-4 text-gray-700 mr-2" />
                  <h3 className="text-base font-semibold text-gray-800">Pet Information</h3>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
                    Pet Count
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-1">
                      <button 
                        type="button"
                        onClick={() => updatePetCount(false)}
                        className="px-2 py-1 text-sm rounded hover:bg-gray-200 transition font-semibold text-gray-600 disabled:opacity-50"
                        disabled={petCount <= 0}
                      >
                        −
                      </button>
                      <span className="px-3 py-1 font-bold text-gray-800 min-w-[40px] text-center text-sm">
                        {petCount}
                      </span>
                      <button 
                        type="button"
                        onClick={() => updatePetCount(true)}
                        className="px-2 py-1 text-sm rounded hover:bg-gray-200 transition font-semibold text-gray-600"
                      >
                        +
                      </button>
                    </div>
                    <Badge size="sm" color="info">
                      {petCount} {petCount === 1 ? "Pet" : "Pets"}
                    </Badge>
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
                    <span className="text-xs text-red-600 mt-0.5 block">{errors.petCount.message}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-70"
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