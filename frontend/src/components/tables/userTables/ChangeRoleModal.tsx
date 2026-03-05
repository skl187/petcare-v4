import { useEffect, useState } from 'react';
import { MdClose, MdShield, MdCheckCircle } from 'react-icons/md';
import { API_ENDPOINTS } from '../../../constants/api';

interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface UserRole extends Role {
  is_primary: boolean;
}

interface ChangeRoleModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export default function ChangeRoleModal({
  userId,
  userName,
  onClose,
  onSuccess,
}: ChangeRoleModalProps) {
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [currentRoles, setCurrentRoles] = useState<UserRole[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [primaryRoleId, setPrimaryRoleId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [rolesRes, userRolesRes] = await Promise.all([
          fetch(`${API_ENDPOINTS.ROLES.BASE}?limit=100`, { headers: getAuthHeaders() }),
          fetch(API_ENDPOINTS.USERS.ROLES(userId), { headers: getAuthHeaders() }),
        ]);

        if (!rolesRes.ok) throw new Error('Failed to fetch roles');
        if (!userRolesRes.ok) throw new Error('Failed to fetch user roles');

        const rolesData = await rolesRes.json();
        const userRolesData = await userRolesRes.json();

        const roles: Role[] = rolesData.data?.roles || rolesData.data?.data || [];
        const userRoles: UserRole[] = userRolesData.data?.roles || [];

        setAllRoles(roles);
        setCurrentRoles(userRoles);

        const ids = userRoles.map((r) => r.id);
        setSelectedRoleIds(ids);
        const primary = userRoles.find((r) => r.is_primary);
        setPrimaryRoleId(primary?.id || ids[0] || '');
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) => {
      const next = prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId];

      // If primary was deselected, reset to first remaining
      if (!next.includes(primaryRoleId)) {
        setPrimaryRoleId(next[0] || '');
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (selectedRoleIds.length === 0) {
      setError('Please select at least one role.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await fetch(API_ENDPOINTS.USERS.ROLES(userId), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          role_ids: selectedRoleIds,
          primary_role_id: primaryRoleId || selectedRoleIds[0],
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Failed to update roles (${response.status})`);
      }

      setSuccess('Roles updated successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to update roles');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-md'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-blue-50 rounded-lg'>
              <MdShield className='w-5 h-5 text-blue-600' />
            </div>
            <div>
              <h2 className='text-base font-semibold text-gray-800'>Change Role</h2>
              <p className='text-xs text-gray-500 mt-0.5 truncate max-w-[220px]'>{userName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <MdClose className='w-5 h-5' />
          </button>
        </div>

        {/* Body */}
        <div className='px-6 py-4'>
          {loading ? (
            <div className='flex justify-center py-10'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
            </div>
          ) : (
            <>
              {/* Current roles */}
              {currentRoles.length > 0 && (
                <div className='mb-4'>
                  <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-2'>
                    Current Roles
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {currentRoles.map((r) => (
                      <span
                        key={r.id}
                        className='flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium'
                      >
                        {r.is_primary && <MdCheckCircle className='w-3.5 h-3.5' />}
                        {r.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Role selector */}
              <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-2'>
                Assign Roles
              </p>
              <div className='space-y-2 max-h-56 overflow-y-auto pr-1'>
                {allRoles.map((role) => {
                  const selected = selectedRoleIds.includes(role.id);
                  const isPrimary = primaryRoleId === role.id;
                  return (
                    <div
                      key={role.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selected
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => toggleRole(role.id)}
                    >
                      <div className='flex items-center gap-3'>
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            selected
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selected && (
                            <svg className='w-2.5 h-2.5 text-white' fill='currentColor' viewBox='0 0 12 12'>
                              <path d='M10 3L5 8.5 2 5.5' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' fill='none' />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className='text-sm font-medium text-gray-800'>{role.name}</p>
                          {role.description && (
                            <p className='text-xs text-gray-400 leading-tight'>{role.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Primary radio — only if selected */}
                      {selected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrimaryRoleId(role.id);
                          }}
                          className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                            isPrimary
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-500 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                          }`}
                          title='Set as primary role'
                        >
                          {isPrimary ? 'Primary' : 'Set Primary'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedRoleIds.length > 0 && (
                <p className='mt-3 text-xs text-gray-400'>
                  {selectedRoleIds.length} role{selectedRoleIds.length > 1 ? 's' : ''} selected
                  {primaryRoleId && ` · Primary: ${allRoles.find(r => r.id === primaryRoleId)?.name}`}
                </p>
              )}
            </>
          )}

          {/* Feedback */}
          {error && (
            <div className='mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700'>
              {error}
            </div>
          )}
          {success && (
            <div className='mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700'>
              {success}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex justify-end gap-2 px-6 py-4 border-t border-gray-200'>
          <button
            onClick={onClose}
            disabled={saving}
            className='px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading || selectedRoleIds.length === 0}
            className='px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2'
          >
            {saving && <div className='animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white' />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
