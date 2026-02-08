import React, { useState } from "react";
import { useForm } from "react-hook-form";
import FormCard from "../../../../components/form/FormCard";

export interface ChangePasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordFormProps {
  onSubmit: (data: ChangePasswordFormData) => Promise<void> | void;
  onCancel: () => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ 
  onSubmit, 
  onCancel 
}) => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    watch 
  } = useForm<ChangePasswordFormData>();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const newPassword = watch("newPassword");

  const handleFormSubmit = async (data: ChangePasswordFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormCard title="Change Password" onClose={onCancel}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-600 mb-2">
            New Password
          </label>
          <input
            type="password"
            className={`px-4 py-3 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.newPassword ? "border-red-500" : "border-gray-300"
            }`}
            {...register("newPassword", { 
              required: "New password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters"
              }
            })}
          />
          {errors.newPassword && (
            <span className="text-sm text-red-500">{errors.newPassword.message}</span>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-600 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            className={`px-4 py-3 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            }`}
            {...register("confirmPassword", {
              required: "Confirm password is required",
              validate: (value) => 
                value === newPassword || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <span className="text-sm text-red-500">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Changing..." : "Change Password"}
          </button>
        </div>
      </form>
    </FormCard>
  );
};

export default ChangePasswordForm;