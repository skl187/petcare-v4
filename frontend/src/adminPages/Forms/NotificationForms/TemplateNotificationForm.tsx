import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import FormCard from '../../../components/form/FormCard';
import Badge from '../../../components/ui/badge/Badge';
import {
  createTemplate,
  updateTemplate,
  previewTemplate,
  createNotification,
  getTemplate,
} from '../../../services/notificationService';
import { showToast } from '../../../components/ui/toast/showToast';

export type NotificationTemplateData = {
  template_key: string;
  name?: string;
  channel?: string;
  description?: string;
  default_subject?: string;
  default_body?: string;
  default_body_html?: string;
  locale?: string;
  is_active?: boolean;
};

interface Props {
  templateKey?: string | null;
  onCancel: () => void;
  onSaved: () => void;
}

const CHANNEL_LABELS: Record<string, string> = {
  email: 'Email',
  sms: 'SMS',
  push: 'Push',
  whatsapp: 'WhatsApp',
  in_app: 'In-App',
};

const CHANNEL_COLORS: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'light'> = {
  email: 'primary',
  sms: 'success',
  push: 'warning',
  whatsapp: 'success',
  in_app: 'info',
};

const NotificationTemplateForm: React.FC<Props> = ({ templateKey, onCancel, onSaved }) => {
  const { register, handleSubmit, setValue, watch } = useForm<NotificationTemplateData>({
    defaultValues: { locale: 'en', is_active: true, channel: 'email' },
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any | null>(null);

  const nameValue = watch('name');
  const channelValue = watch('channel') || 'email';
  const isActiveValue = watch('is_active');
  const localeValue = watch('locale');
  const templateKeyValue = watch('template_key');

  useEffect(() => {
    if (!templateKey) return;
    (async () => {
      try {
        setLoading(true);
        const tpl = await getTemplate(templateKey);
        setValue('template_key', tpl.template_key);
        setValue('name', tpl.name || '');
        setValue('channel', tpl.channel || 'email');
        setValue('description', tpl.description || '');
        setValue('default_subject', tpl.subject || '');
        setValue('default_body', tpl.body || '');
        setValue('default_body_html', tpl.body_html || '');
        setValue('locale', tpl.locale || 'en');
        setValue('is_active', tpl.is_active === undefined ? true : !!tpl.is_active);
      } catch (err: any) {
        showToast(err?.message || 'Failed to load template', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [templateKey, setValue]);

  const onPreview = async (data: NotificationTemplateData) => {
    try {
      setLoading(true);
      const res = await previewTemplate(data.template_key, {}, data.locale || 'en');
      setPreview(res.rendered);
      showToast('Preview rendered', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Preview failed', 'error');
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const onSendTest = async (data: NotificationTemplateData) => {
    const testEmail = window.prompt('Enter test email address');
    if (!testEmail) return;
    try {
      setLoading(true);
      await createNotification({
        template_key: data.template_key,
        channel: 'email',
        target: { email: testEmail },
        payload: {},
        locale: data.locale || 'en',
      });
      showToast('Test email scheduled/sent', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to send test', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: NotificationTemplateData) => {
    if (!data.template_key || !data.channel)
      return showToast('template_key and channel are required', 'error');
    setLoading(true);
    try {
      if (templateKey) {
        await updateTemplate(templateKey, {
          name: data.name,
          description: data.description,
          default_subject: data.default_subject,
          default_body: data.default_body,
          default_body_html: data.default_body_html,
          locale: data.locale,
          is_active: data.is_active,
        });
        showToast('Template updated', 'success');
      } else {
        await createTemplate({
          template_key: data.template_key,
          name: data.name,
          channel: data.channel,
          description: data.description,
          default_subject: data.default_subject,
          default_body: data.default_body,
          default_body_html: data.default_body_html,
          locale: data.locale,
          is_active: data.is_active,
        });
        showToast('Template created', 'success');
      }
      onSaved();
    } catch (err: any) {
      showToast(err?.message || 'Save failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard
      title={templateKey ? 'Edit Notification Template' : 'Create Notification Template'}
      onClose={onCancel}
    >
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        {/* Profile Layout: Left Sidebar + Right Content */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>

          {/* ── Left Sidebar ── */}
          <div className='lg:col-span-1'>
            <div className='bg-white border border-gray-200 rounded-lg p-4 sticky top-2 space-y-4'>

              {/* Template Name */}
              <div className='text-center border-b pb-3'>
                <h2 className='text-lg font-bold text-gray-800 truncate'>
                  {nameValue || 'New Template'}
                </h2>
                <p className='text-xs text-gray-400 mt-0.5 truncate font-mono'>
                  {templateKeyValue || 'template_key'}
                </p>
                <p className='text-xs text-gray-500 mt-1'>Notification Template</p>
              </div>

              {/* Channel */}
              <div className='text-center border-b pb-3'>
                <p className='text-xs text-gray-500 uppercase tracking-wide mb-2'>Channel</p>
                <select
                  className='w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  value={channelValue}
                  disabled={!!templateKey || loading}
                  onChange={(e) => setValue('channel', e.target.value)}
                >
                  <option value='email'>Email</option>
                  <option value='sms'>SMS</option>
                  <option value='push'>Push</option>
                  <option value='whatsapp'>WhatsApp</option>
                  <option value='in_app'>In-App</option>
                </select>
                <div className='mt-2'>
                  <Badge color={CHANNEL_COLORS[channelValue] || 'light'} size='sm'>
                    {CHANNEL_LABELS[channelValue] || channelValue}
                  </Badge>
                </div>
              </div>

              {/* Status */}
              <div className='text-center border-b pb-3'>
                <p className='text-xs text-gray-500 uppercase tracking-wide mb-2'>Status</p>
                <select
                  className='w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  value={isActiveValue ? '1' : '0'}
                  disabled={loading}
                  onChange={(e) => setValue('is_active', e.target.value === '1')}
                >
                  <option value='1'>Active</option>
                  <option value='0'>Inactive</option>
                </select>
                <div className='mt-2'>
                  <Badge color={isActiveValue ? 'success' : 'error'} size='sm'>
                    {isActiveValue ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {/* Locale */}
              <div className='text-center'>
                <p className='text-xs text-gray-500 uppercase tracking-wide mb-2'>Locale</p>
                <select
                  {...register('locale')}
                  className='w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  disabled={loading}
                >
                  <option value='en'>English (en)</option>
                  <option value='es'>Spanish (es)</option>
                  <option value='fr'>French (fr)</option>
                  <option value='de'>German (de)</option>
                  <option value='ar'>Arabic (ar)</option>
                </select>
                <p className='text-xs text-gray-400 mt-1'>{localeValue || 'en'}</p>
              </div>
            </div>
          </div>

          {/* ── Right Content ── */}
          <div className='lg:col-span-2 space-y-4'>

            {/* Identity Card */}
            <div className='bg-white border border-gray-200 rounded-lg p-4'>
              <div className='flex items-center mb-3'>
                <svg className='w-4 h-4 text-gray-700 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                    d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
                </svg>
                <h3 className='text-base font-semibold text-gray-800'>Template Identity</h3>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {/* Template Key */}
                <div>
                  <label className='text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1'>
                    Template Key
                  </label>
                  <input
                    {...register('template_key')}
                    disabled={!!templateKey || loading}
                    placeholder='e.g., vaccination_due_email'
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60'
                  />
                </div>

                {/* Name */}
                <div>
                  <label className='text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1'>
                    Name / Title
                  </label>
                  <input
                    {...register('name')}
                    disabled={loading}
                    placeholder='Human-readable name'
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  />
                </div>
              </div>

              {/* Description */}
              <div className='mt-3'>
                <label className='text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1'>
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={2}
                  disabled={loading}
                  placeholder='Template description or usage notes'
                  className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition'
                />
              </div>
            </div>

            {/* Content Card */}
            <div className='bg-white border border-gray-200 rounded-lg p-4'>
              <div className='flex items-center mb-3'>
                <svg className='w-4 h-4 text-gray-700 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                </svg>
                <h3 className='text-base font-semibold text-gray-800'>Template Content</h3>
              </div>

              <div className='space-y-3'>
                {/* Subject */}
                <div>
                  <label className='text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1'>
                    Subject
                  </label>
                  <input
                    {...register('default_subject')}
                    disabled={loading}
                    placeholder='e.g., Your pet {{pet_name}} has a vaccination due'
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  />
                </div>

                {/* Plain Text Body */}
                <div>
                  <label className='text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1'>
                    Plain Text Body
                  </label>
                  <textarea
                    {...register('default_body')}
                    rows={4}
                    disabled={loading}
                    placeholder='Use {{variable}} for template placeholders'
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition'
                  />
                </div>

                {/* HTML Body */}
                <div>
                  <label className='text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1'>
                    HTML Body
                  </label>
                  <textarea
                    {...register('default_body_html')}
                    rows={6}
                    disabled={loading}
                    placeholder='HTML version with {{variable}} placeholders'
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition'
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    Supports HTML with Handlebars-style <code className='bg-gray-100 px-1 rounded'>{'{{variable}}'}</code> placeholders
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Panel (inline, shown after preview action) */}
            {preview && (
              <div className='bg-white border border-indigo-200 rounded-lg p-4'>
                <div className='flex items-center mb-3'>
                  <svg className='w-4 h-4 text-indigo-600 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                      d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                      d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                  </svg>
                  <h3 className='text-base font-semibold text-indigo-700'>Preview</h3>
                  <button
                    type='button'
                    onClick={() => setPreview(null)}
                    className='ml-auto text-gray-400 hover:text-gray-600'
                  >
                    <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd'
                        d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                        clipRule='evenodd' />
                    </svg>
                  </button>
                </div>
                <div className='space-y-3'>
                  <div>
                    <p className='text-xs text-gray-500 uppercase tracking-wide mb-1'>Subject</p>
                    <p className='text-sm font-semibold text-gray-800'>{preview.subject}</p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500 uppercase tracking-wide mb-1'>Plain Text</p>
                    <pre className='whitespace-pre-wrap text-sm bg-gray-50 rounded p-3 border border-gray-100'>{preview.body}</pre>
                  </div>
                  <div>
                    <p className='text-xs text-gray-500 uppercase tracking-wide mb-1'>HTML Render</p>
                    <div
                      className='prose max-w-none overflow-auto p-3 bg-white rounded border border-gray-100 text-sm'
                      dangerouslySetInnerHTML={{ __html: preview.body_html || '<em>(empty)</em>' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className='flex items-center justify-between pt-3 border-t'>
          {/* Left: Preview + Test */}
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={handleSubmit(onPreview)}
              disabled={loading}
              className='px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 flex items-center gap-1.5'
            >
              <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                  d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                  d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
              </svg>
              Preview
            </button>
            <button
              type='button'
              onClick={handleSubmit(onSendTest)}
              disabled={loading}
              className='px-4 py-2 text-sm border border-green-300 rounded-lg text-green-700 hover:bg-green-50 font-medium disabled:opacity-50 flex items-center gap-1.5'
            >
              <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2}
                  d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
              </svg>
              Send Test
            </button>
          </div>

          {/* Right: Cancel + Save */}
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={onCancel}
              disabled={loading}
              className='px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 font-medium'
            >
              {loading ? 'Saving...' : templateKey ? 'Update' : 'Create'} Template
            </button>
          </div>
        </div>
      </form>
    </FormCard>
  );
};

export default NotificationTemplateForm;