import React, { useState } from "react";
import { useForm } from "react-hook-form";
import FormCard from "../../../../components/form/FormCard";

export interface PushNotificationFormData {
  message: string;
}

interface PushNotificationFormProps {
  onSubmit: (data: PushNotificationFormData) => Promise<void> | void;
  onCancel: () => void;
}

const PushNotificationForm: React.FC<PushNotificationFormProps> = ({ 
  onSubmit, 
  onCancel 
}) => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<PushNotificationFormData>();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (data: PushNotificationFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormCard title="Send Push Notification" onClose={onCancel}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-600 mb-2">
            Message
          </label>
          <textarea
            className={`px-4 py-3 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.message ? "border-red-500" : "border-gray-300"
            }`}
            {...register("message", { 
              required: "Message is required",
              minLength: {
                value: 10,
                message: "Message must be at least 10 characters"
              },
              maxLength: {
                value: 500,
                message: "Message cannot exceed 500 characters"
              }
            })}
            rows={4}
          />
          {errors.message && (
            <span className="text-sm text-red-500">{errors.message.message}</span>
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
            {isSubmitting ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </form>
    </FormCard>
  );
};

export default PushNotificationForm;