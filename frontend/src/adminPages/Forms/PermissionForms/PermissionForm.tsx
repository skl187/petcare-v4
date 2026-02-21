import { useState } from "react";
import { useForm } from "react-hook-form";
import FormCard from "../../../components/form/FormCard";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import { API_ENDPOINTS } from "../../../constants/api";
import { Permission } from "../../../components/tables/AdminTables/PermissionsTable";

interface PermissionFormData {
  name: string;
  action: string;
  resource: string;
  description: string;
}

interface PermissionFormProps {
  permission: Permission | null;
  resources: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PermissionForm({
  permission,
  resources,
  onSuccess,
  onCancel,
}: PermissionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewResource, setIsNewResource] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PermissionFormData>({
    defaultValues: {
      name: permission?.name || "",
      action: permission?.action || "",
      resource: permission?.resource || "",
      description: permission?.description || "",
    },
  });

  const selectedResource = watch("resource");

  const onSubmit = async (data: PermissionFormData) => {
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem("token");

      const response = await fetch(
        permission
          ? API_ENDPOINTS.PERMISSIONS.DETAIL(permission.id)
          : API_ENDPOINTS.PERMISSIONS.BASE,
        {
          method: permission ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name.trim(),
            action: data.action.trim() || null,
            resource: data.resource.trim() || null,
            description: data.description.trim() || null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to save permission");
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err) {
      console.error("Error saving permission:", err);
      setError("Failed to save permission");
    } finally {
      setLoading(false);
    }
  };

  const actionSuggestions = [
    "create",
    "read",
    "update",
    "delete",
    "manage",
    "view",
    "list",
    "export",
    "import",
  ];

  return (
    <FormCard
      title={permission ? `Edit Permission: ${permission.name}` : "Add New Permission"}
      onClose={onCancel}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <Label>
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            placeholder="e.g., Create Users, View Dashboard"
            {...(register("name", { required: "Name is required" }) as any)}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            A descriptive name for the permission
          </p>
        </div>

        {/* Action */}
        <div>
          <Label>Action</Label>
          <Input
            type="text"
            placeholder="e.g., create, read, update, delete"
            {...(register("action") as any)}
          />
          <datalist id="action-suggestions">
            {actionSuggestions.map((action) => (
              <option key={action} value={action} />
            ))}
          </datalist>
          <p className="mt-1 text-xs text-gray-500">
            The type of action (create, read, update, delete, etc.)
          </p>
        </div>

        {/* Resource */}
        <div>
          <Label>Resource</Label>
          {!isNewResource ? (
            <div className="flex gap-2">
              <select
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                value={selectedResource}
                onChange={(e) => setValue("resource", e.target.value)}
              >
                <option value="">Select a resource...</option>
                {resources.map((resource) => (
                  <option key={resource} value={resource}>
                    {resource}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setIsNewResource(true);
                  setValue("resource", "");
                }}
                className="px-3 py-2 text-sm text-brand-600 border border-brand-300 rounded-lg hover:bg-brand-50 transition-colors"
              >
                + New
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="e.g., Users, Appointments, Reports"
                {...(register("resource") as any)}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => setIsNewResource(false)}
                className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Select
              </button>
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500">
            The resource this permission applies to (e.g., Users, Appointments)
          </p>
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          <TextArea
            placeholder="Describe what this permission allows..."
            rows={3}
            {...(register("description") as any)}
          />
          <p className="mt-1 text-xs text-gray-500">
            Optional description explaining what this permission grants
          </p>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
          <div className="flex flex-wrap gap-2">
            {watch("action") && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                Action: {watch("action")}
              </span>
            )}
            {watch("resource") && (
              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                Resource: {watch("resource")}
              </span>
            )}
            {!watch("action") && !watch("resource") && (
              <span className="text-xs text-gray-400">
                Add action and/or resource to see preview
              </span>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {loading
              ? "Saving..."
              : permission
              ? "Update Permission"
              : "Create Permission"}
          </button>
        </div>
      </form>
    </FormCard>
  );
}

export type { PermissionFormData };
