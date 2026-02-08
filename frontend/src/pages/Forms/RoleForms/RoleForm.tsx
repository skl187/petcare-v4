import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import FormCard from "../../../components/form/FormCard";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Checkbox from "../../../components/form/input/Checkbox";
import { API_ENDPOINTS } from "../../../constants/api";
import { Role } from "../../../components/tables/roleTables/RolesTable";

interface Permission {
  id: string;
  name: string;
  action: string | null;
  description: string | null;
}

interface PermissionResource {
  name: string;
  permission_count: number;
  permissions: Permission[];
}

interface RoleFormData {
  name: string;
  slug: string;
  description: string;
}

interface RoleFormProps {
  role: Role | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RoleForm({ role, onSuccess, onCancel }: RoleFormProps) {
  const [loading, setLoading] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [resources, setResources] = useState<PermissionResource[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [searchFeatures, setSearchFeatures] = useState("");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RoleFormData>({
    defaultValues: {
      name: role?.name || "",
      slug: role?.slug || "",
      description: role?.description || "",
    },
  });

  const nameValue = watch("name");

  // Auto-generate slug from name
  useEffect(() => {
    if (!role && nameValue) {
      const slug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      setValue("slug", slug);
    }
  }, [nameValue, role, setValue]);

  // Fetch grouped permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      setPermissionsLoading(true);
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(API_ENDPOINTS.PERMISSIONS.GROUPED, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (data.status === "success") {
          setResources(data.data.resources);
          if (data.data.resources.length > 0) {
            setActiveTab(data.data.resources[0].name);
          }
        }
      } catch (err) {
        console.error("Error fetching permissions:", err);
      } finally {
        setPermissionsLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  // Fetch role's assigned permissions if editing
  useEffect(() => {
    if (role) {
      const fetchRolePermissions = async () => {
        try {
          const token = sessionStorage.getItem("token");
          const response = await fetch(API_ENDPOINTS.ROLES.DETAIL(role.id), {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          const data = await response.json();
          if (data.status === "success" && data.data.role.assigned_permission_ids) {
            setSelectedPermissions(new Set(data.data.role.assigned_permission_ids));
          }
        } catch (err) {
          console.error("Error fetching role permissions:", err);
        }
      };

      fetchRolePermissions();
    }
  }, [role]);

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const _toggleResourcePermissions = (resource: PermissionResource, checked: boolean) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      resource.permissions.forEach((perm) => {
        if (checked) {
          newSet.add(perm.id);
        } else {
          newSet.delete(perm.id);
        }
      });
      return newSet;
    });
  };

  const isResourceFullySelected = (resource: PermissionResource) => {
    return resource.permissions.every((perm) => selectedPermissions.has(perm.id));
  };

  const isResourcePartiallySelected = (resource: PermissionResource) => {
    const selected = resource.permissions.filter((perm) => selectedPermissions.has(perm.id));
    return selected.length > 0 && selected.length < resource.permissions.length;
  };

  const onSubmit = async (data: RoleFormData) => {
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem("token");

      // Create or update role
      const roleResponse = await fetch(
        role ? API_ENDPOINTS.ROLES.DETAIL(role.id) : API_ENDPOINTS.ROLES.BASE,
        {
          method: role ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const roleData = await roleResponse.json();

      if (!roleResponse.ok) {
        setError(roleData.message || "Failed to save role");
        setLoading(false);
        return;
      }

      const roleId = role ? role.id : roleData.data.role.id;

      // Update permissions
      const permResponse = await fetch(API_ENDPOINTS.ROLES.PERMISSIONS(roleId), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          permission_ids: Array.from(selectedPermissions),
        }),
      });

      if (!permResponse.ok) {
        const permData = await permResponse.json();
        setError(permData.message || "Failed to update permissions");
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err) {
      console.error("Error saving role:", err);
      setError("Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  // Filter resources based on search
  const filteredResources = searchFeatures
    ? resources.filter(
        (r) =>
          r.name.toLowerCase().includes(searchFeatures.toLowerCase()) ||
          r.permissions.some((p) =>
            p.name.toLowerCase().includes(searchFeatures.toLowerCase())
          )
      )
    : resources;

  const activeResource = filteredResources.find((r) => r.name === activeTab);

  return (
    <FormCard
      title={role ? `Edit Role: ${role.name}` : "Add New Role"}
      onClose={onCancel}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="e.g., Staff"
              {...(register("name", { required: "Name is required" }) as any)}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label>
              Label <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="e.g., staff"
              {...(register("slug", { required: "Label is required" }) as any)}
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
            )}
          </div>
        </div>

        {/* Search Features */}
        <div>
          <Input
            type="text"
            placeholder="Search features..."
            value={searchFeatures}
            onChange={(e) => setSearchFeatures(e.target.value)}
          />
        </div>

        {/* Permissions Tabs */}
        <div className="border border-gray-200 rounded-lg">
          {/* Tab Headers */}
          <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-50">
            {filteredResources.map((resource) => (
              <button
                key={resource.name}
                type="button"
                onClick={() => setActiveTab(resource.name)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === resource.name
                    ? "text-brand-600 border-b-2 border-brand-600 bg-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {resource.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {permissionsLoading ? (
              <div className="py-8 text-center text-gray-500">
                Loading permissions...
              </div>
            ) : activeResource ? (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">Permissions</p>

                {/* Group permissions by resource name prefix */}
                {(() => {
                  // Group permissions by their prefix (e.g., "Dashboard", "Manage Dashboard" -> "Dashboard")
                  const groups: Record<string, Permission[]> = {};

                  activeResource.permissions.forEach((perm) => {
                    // Try to find a group name from the permission name
                    const parts = perm.name.split(" ");
                    const groupName = parts.length > 1 && ["Manage", "Create", "Edit", "Delete", "View", "Change", "Login"].includes(parts[0])
                      ? parts.slice(1).join(" ")
                      : perm.name;

                    if (!groups[groupName]) {
                      groups[groupName] = [];
                    }
                    groups[groupName].push(perm);
                  });

                  return Object.entries(groups).map(([groupName, perms]) => (
                    <div
                      key={groupName}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      {/* Group Header with Checkbox */}
                      <div className="flex items-center gap-3 mb-3">
                        <Checkbox
                          checked={perms.every((p) => selectedPermissions.has(p.id))}
                          onChange={(checked) => {
                            setSelectedPermissions((prev) => {
                              const newSet = new Set(prev);
                              perms.forEach((perm) => {
                                if (checked) {
                                  newSet.add(perm.id);
                                } else {
                                  newSet.delete(perm.id);
                                }
                              });
                              return newSet;
                            });
                          }}
                        />
                        <span className="font-medium text-gray-800">
                          {groupName}
                        </span>
                      </div>

                      {/* Individual Permissions */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 ml-6">
                        {perms.map((perm) => (
                          <div
                            key={perm.id}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              checked={selectedPermissions.has(perm.id)}
                              onChange={() => togglePermission(perm.id)}
                            />
                            <span className="text-sm text-gray-600">
                              {perm.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                No permissions found
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">{selectedPermissions.size}</span>{" "}
            permissions selected
          </p>
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
            {loading ? "Saving..." : role ? "Update Role" : "Create Role"}
          </button>
        </div>
      </form>
    </FormCard>
  );
}

export type { RoleFormData };
