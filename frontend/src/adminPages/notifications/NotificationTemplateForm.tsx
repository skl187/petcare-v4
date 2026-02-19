import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import FormCard from '../../components/form/FormCard';
import { createTemplate, updateTemplate, previewTemplate, createNotification, getTemplate } from '../../services/notificationService';
import { showToast } from '../../components/ui/toast/showToast';

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

const NotificationTemplateForm: React.FC<Props> = ({ templateKey, onCancel, onSaved }) => {
  const { register, handleSubmit, setValue } = useForm<NotificationTemplateData>({
    defaultValues: { locale: 'en', is_active: true },
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any | null>(null);

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
    let payload = {};
    try {
      payload = {}; // default empty
      // if body contains handlebars-style placeholders, user can provide JSON via prompt in future
    } catch (err) {
      showToast('Invalid payload', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await previewTemplate(data.template_key, payload, data.locale || 'en');
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
    let payload = {};
    try {
      setLoading(true);
      await createNotification({ template_key: data.template_key, channel: 'email', target: { email: testEmail }, payload, locale: data.locale || 'en' });
      showToast('Test email scheduled/sent', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to send test', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: NotificationTemplateData) => {
    if (!data.template_key || !data.channel) return showToast('template_key and channel are required', 'error');
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
    <FormCard title={templateKey ? 'Edit Template' : 'Create Template'} onClose={onCancel}>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='text-xs font-semibold text-gray-600'>Template Key</label>
            <input {...register('template_key')} className='mt-2 w-full px-3 py-2 border rounded-md text-sm' disabled={!!templateKey} placeholder='e.g., vaccination_due_email' />
          </div>
          <div>
            <label className='text-xs font-semibold text-gray-600'>Name / Title</label>
            <input {...register('name')} className='mt-2 w-full px-3 py-2 border rounded-md text-sm' />
          </div>
          <div>
            <label className='text-xs font-semibold text-gray-600'>Channel</label>
            <select {...register('channel')} className='mt-2 w-full px-3 py-2 border rounded-md text-sm' disabled={!!templateKey}>
              <option value='email'>Email</option>
              <option value='sms'>SMS</option>
              <option value='push'>Push</option>
              <option value='whatsapp'>WhatsApp</option>
              <option value='in_app'>In-App</option>
            </select>
          </div>
          <div className='flex items-center gap-3'>
            <label className='text-xs font-semibold text-gray-600'>Active</label>
            <input type='checkbox' {...register('is_active')} className='mt-2 h-4 w-4' />
          </div>
        </div>

        <div>
          <label className='text-xs font-semibold text-gray-600'>Description</label>
          <textarea {...register('description')} rows={2} className='mt-2 w-full px-3 py-2 border rounded-md text-sm' placeholder='Template description or usage notes' />
        </div>

        <div>
          <label className='text-xs font-semibold text-gray-600'>Subject</label>
          <input {...register('default_subject')} className='mt-2 w-full px-3 py-2 border rounded-md text-sm' placeholder='e.g., Your pet {{pet_name}} has a vaccination due' />
        </div>

        <div>
          <label className='text-xs font-semibold text-gray-600'>Plain Text Body</label>
          <textarea {...register('default_body')} rows={4} className='mt-2 w-full px-3 py-2 border rounded-md text-sm font-mono' placeholder='Use {{variable}} for template placeholders' />
        </div>

        <div>
          <label className='text-xs font-semibold text-gray-600'>HTML Body</label>
          <textarea {...register('default_body_html')} rows={6} className='mt-2 w-full px-3 py-2 border rounded-md text-sm font-mono' placeholder='HTML version with {{variable}} placeholders' />
        </div>

        <div className='flex justify-between items-center'>
          <div className='flex gap-2'>
            <button type='button' onClick={handleSubmit(onPreview)} className='px-4 py-2 text-sm bg-gray-100 rounded border'>Preview</button>
            <button type='button' onClick={handleSubmit(onSendTest)} className='px-4 py-2 text-sm bg-green-600 text-white rounded'>Send Test</button>
          </div>
          <div className='flex gap-2'>
            <button type='button' onClick={onCancel} className='px-4 py-2 text-sm bg-white border rounded'>Cancel</button>
            <button type='submit' disabled={loading} className='px-4 py-2 text-sm bg-indigo-600 text-white rounded'>Save</button>
          </div>
        </div>

        {preview && (
          <div className='mt-4 p-3 border rounded bg-gray-50'>
            <div className='text-xs text-gray-500'>Rendered subject</div>
            <div className='font-semibold text-sm'>{preview.subject}</div>
            <div className='text-xs text-gray-500 mt-2'>Rendered body</div>
            <pre className='whitespace-pre-wrap text-sm'>{preview.body}</pre>
            <div className='text-xs text-gray-500 mt-2'>Rendered HTML</div>
            <div className='mt-2 prose max-w-none overflow-auto p-2 bg-white rounded' dangerouslySetInnerHTML={{ __html: preview.body_html || '<em>(empty)</em>' }} />
          </div>
        )}
      </form>
    </FormCard>
  );
};

export default NotificationTemplateForm;
