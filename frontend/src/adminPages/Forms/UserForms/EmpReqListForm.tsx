import React from "react";
import { useForm } from "react-hook-form";
import FormCard from "../../../components/form/FormCard";
import Badge from "../../../components/ui/badge/Badge";
import Switch from "../../../components/form/switch/Switch";
import ImageUpload from "../../FormComponents/ImageUpload";

export interface EmpReqListFormData {
  name: string;
  email: string;
  image?: File | string;
  contactNumber: string;
  verificationStatus: "Verified" | "Pending" | "Rejected";
  blocked: boolean;
  status: "Active" | "Inactive";
}

export interface EmpReq {
  id: number;
  name: string;
  email: string;
  image: string;
  contactNumber: string;
  verificationStatus: "Verified" | "Pending" | "Rejected";
  blocked: boolean;
  status: "Active" | "Inactive";
  requestDate: string;
}

interface EmpReqListFormProps {
  empReq?: EmpReq | null;
  onSubmit: (data: EmpReqListFormData) => void;
  onCancel: () => void;
}

const EmpReqListForm: React.FC<EmpReqListFormProps> = ({
  empReq,
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
  } = useForm<EmpReqListFormData>({
    defaultValues: empReq
      ? {
          name: empReq.name,
          email: empReq.email,
          image: empReq.image,
          contactNumber: empReq.contactNumber,
          verificationStatus: empReq.verificationStatus,
          blocked: empReq.blocked,
          status: empReq.status,
        }
      : {
          name: "",
          email: "",
          image: undefined,
          contactNumber: "",
          verificationStatus: "Pending",
          blocked: false,
          status: "Active",
        },
  });

  // Watch form values
  const status = watch("status");
  const verificationStatus = watch("verificationStatus");
  const blocked = watch("blocked");

  // Status badge colors
  const getStatusColor = (status: string) => 
    status === "Active" ? "success" : "error";
  
  const getVerificationColor = (status: string) => 
    status === "Verified" ? "success" : 
    status === "Pending" ? "warning" : "error";

  const onFormSubmit = (data: EmpReqListFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <div className="p-4 mx-auto max-w-4xl md:p-6">
      <FormCard
        title={empReq ? "Edit Employee Request" : "Create Employee Request"}
        onClose={onCancel}
      >
        <form 
          id="emp-req-form" 
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
            </div>
          </section>

          {/* Status Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Status
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Verification Status
                </label>
                <div className="flex items-center gap-3">
                  <Badge 
                    size="sm" 
                    color={getVerificationColor(verificationStatus)}
                  >
                    {verificationStatus}
                  </Badge>
                  <select
                    className={`px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                    value={verificationStatus}
                    onChange={(e) => 
                      setValue("verificationStatus", e.target.value as "Verified" | "Pending" | "Rejected")
                    }
                  >
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Blocked
                </label>
                <div className="flex items-center gap-3">
                  <Badge 
                    size="sm" 
                    color={blocked ? "error" : "success"}
                  >
                    {blocked ? "Blocked" : "Unblocked"}
                  </Badge>
                  <Switch
                    label=""
                    checked={blocked}
                    onChange={(checked) => setValue("blocked", checked)}
                  />
                </div>
              </div>

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
                  {empReq ? "Updating..." : "Creating..."}
                </span>
              ) : (
                empReq ? "Update Request" : "Create Request"
              )}
            </button>
          </div>
        </form>
      </FormCard>
    </div>
  );
};

export default EmpReqListForm;