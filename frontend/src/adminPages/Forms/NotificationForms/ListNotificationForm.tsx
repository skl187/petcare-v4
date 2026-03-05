import React, { useEffect, useState } from 'react';
import { createNotification, listTemplates } from '../../../services/notificationService';
import { API_ENDPOINTS } from '../../../constants/api';
import { showToast } from '../../../components/ui/toast/showToast';

interface Template {
  template_key: string;
  name?: string;
  channel?: string;
}

interface User {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
}

interface Props {
  onCancel: () => void;
  onSaved: () => void;
}

const CHANNELS = ['email', 'sms', 'push'];

const SendNotificationForm: React.FC<Props> = ({ onCancel, onSaved }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingInit, setLoadingInit] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [templateKey, setTemplateKey] = useState('');
  const [channel, setChannel] = useState('email');
  const [recipientMode, setRecipientMode] = useState<'user' | 'manual'>('user');
  const [userId, setUserId] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [payloadRaw, setPayloadRaw] = useState('{\n  "owner_name": "",\n  "pet_name": "",\n  "appointment_date": ""\n}');
  const [payloadError, setPayloadError] = useState('');

  useEffect(() => {
    const loadInit = async () => {
      try {
        const [tplData, usersData] = await Promise.all([
          listTemplates(1, 200),
          fetch(`${API_ENDPOINTS.USERS.BASE}?limit=200`, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
          }).then((r) => r.json()),
        ]);
        const tpls = Array.isArray((tplData as any)?.data) ? (tplData as any).data : [];
        setTemplates(tpls);
        if (tpls.length > 0) {
          setTemplateKey(tpls[0].template_key);
          setChannel(tpls[0].channel || 'email');
        }
        const userList = Array.isArray(usersData?.data?.data) ? usersData.data.data : Array.isArray(usersData?.data) ? usersData.data : [];
        setUsers(userList);
      } catch {
        // silently ignore
      } finally {
        setLoadingInit(false);
      }
    };
    loadInit();
  }, []);

  const handleTemplateChange = (key: string) => {
    setTemplateKey(key);
    const tpl = templates.find((t) => t.template_key === key);
    if (tpl?.channel) setChannel(tpl.channel);
  };

  const validatePayload = (raw: string): Record<string, any> | null => {
    try {
      const parsed = JSON.parse(raw);
      setPayloadError('');
      return parsed;
    } catch {
      setPayloadError('Invalid JSON. Please check the payload format.');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateKey) {
      showToast('Please select a template', 'error');
      return;
    }

    const payload = validatePayload(payloadRaw);
    if (payload === null) return;

    // Build target
    const target: Record<string, string> = {};
    if (recipientMode === 'manual') {
      if (channel === 'email' && manualEmail) target.email = manualEmail;
      if (channel === 'sms' && manualPhone) target.phone = manualPhone;
    }

    setSubmitting(true);
    try {
      await createNotification({
        template_key: templateKey,
        channel: channel as any,
        user_id: recipientMode === 'user' && userId ? userId : null,
        target: Object.keys(target).length > 0 ? target : null,
        payload,
        scheduled_at: scheduledAt || null,
        locale: 'en',
      });
      showToast('Notification queued successfully', 'success');
      onSaved();
    } catch (err: any) {
      showToast(err.message || 'Failed to send notification', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
      <div className='bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between px-6 py-4 border-b dark:border-gray-700'>
          <h2 className='text-lg font-semibold text-gray-800 dark:text-white'>Send Notification</h2>
          <button onClick={onCancel} className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none'>&times;</button>
        </div>

        {loadingInit ? (
          <div className='p-8 text-center text-gray-500'>Loading templates...</div>
        ) : (
          <form onSubmit={handleSubmit} className='px-6 py-5 space-y-5'>

            {/* Template */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Template *</label>
              <select
                value={templateKey}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className='w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white'
                required
              >
                <option value=''>— Select template —</option>
                {templates.map((t) => (
                  <option key={t.template_key} value={t.template_key}>
                    {t.name || t.template_key} ({t.channel})
                  </option>
                ))}
              </select>
            </div>

            {/* Channel */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Channel *</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className='w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white'
              >
                {CHANNELS.map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
            </div>

            {/* Recipient */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Recipient</label>
              <div className='flex gap-4 mb-3'>
                <label className='flex items-center gap-2 text-sm cursor-pointer'>
                  <input type='radio' value='user' checked={recipientMode === 'user'} onChange={() => setRecipientMode('user')} /> Select user
                </label>
                <label className='flex items-center gap-2 text-sm cursor-pointer'>
                  <input type='radio' value='manual' checked={recipientMode === 'manual'} onChange={() => setRecipientMode('manual')} /> Enter manually
                </label>
              </div>

              {recipientMode === 'user' ? (
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className='w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white'
                >
                  <option value=''>— Select user (uses their email/phone) —</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email} — {u.email}
                    </option>
                  ))}
                </select>
              ) : (
                <div className='space-y-2'>
                  {channel === 'email' && (
                    <input
                      type='email'
                      placeholder='Email address'
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      className='w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white'
                    />
                  )}
                  {channel === 'sms' && (
                    <input
                      type='tel'
                      placeholder='Phone number (e.g. +1234567890)'
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      className='w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white'
                    />
                  )}
                </div>
              )}
            </div>

            {/* Payload */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Template Variables (JSON payload)
              </label>
              <p className='text-xs text-gray-400 mb-2'>Fill in the values for template placeholders like <code className='bg-gray-100 px-1 rounded'>{'{{owner_name}}'}</code>, <code className='bg-gray-100 px-1 rounded'>{'{{pet_name}}'}</code>, etc.</p>
              <textarea
                rows={5}
                value={payloadRaw}
                onChange={(e) => { setPayloadRaw(e.target.value); if (payloadError) validatePayload(e.target.value); }}
                className='w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white'
              />
              {payloadError && <p className='text-xs text-red-500 mt-1'>{payloadError}</p>}
            </div>

            {/* Schedule */}
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Send At (leave empty to send now)</label>
              <input
                type='datetime-local'
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className='w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white'
              />
            </div>

            {/* Actions */}
            <div className='flex justify-end gap-3 pt-2'>
              <button
                type='button'
                onClick={onCancel}
                className='px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={submitting}
                className='px-5 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
              >
                {submitting ? 'Sending...' : scheduledAt ? 'Schedule' : 'Send Now'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SendNotificationForm;
