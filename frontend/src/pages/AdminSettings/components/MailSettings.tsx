import { useState, useEffect } from 'react';
import { MdEmail } from 'react-icons/md';
import Button from '../../../components/ui/button/Button';
import InputField from '../../../components/form/input/InputField';
import Label from '../../../components/form/Label';
import { API_ENDPOINTS } from '../../../constants/api';

interface MailSettingsData {
  host: string;
  port: string | number;
  secure: boolean;
  username: string;
  password: string;
  from_name: string;
  from_email: string;
}

interface MailSettingsProps {
  onSave?: (data: MailSettingsData) => void;
}

const MailSettings: React.FC<MailSettingsProps> = ({ onSave }) => {
  const [formData, setFormData] = useState<MailSettingsData>({
    host: '',
    port: '587',
    secure: false,
    username: '',
    password: '',
    from_name: '',
    from_email: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Fetch mail settings on component mount
  useEffect(() => {
    const fetchMailSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          API_ENDPOINTS.SETTINGS.DETAIL('smtp_config'),
        );

        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }

        const result = await response.json();

        if (result.data && result.data.data && result.data.data.length > 0) {
          const settings = result.data.data[0];
          setSettingsId(settings.id);
          setFormData({
            host: settings.value.host || '',
            port: settings.value.port || '587',
            secure: settings.value.secure || false,
            username: settings.value.username || '',
            password: settings.value.password || '',
            from_name: settings.value.from_name || '',
            from_email: settings.value.from_email || '',
          });
        }
      } catch (error) {
        console.error('Error fetching mail settings:', error);
        setMessage({
          type: 'error',
          text: 'Failed to load mail settings',
        });
        setTimeout(() => setMessage(null), 4000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMailSettings();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checkboxElement = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: checkboxElement.checked,
      }));
    } else if (name === 'port') {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? parseInt(value, 10) : '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        namespace: 'tenant_acme',
        key: 'smtp_config',
        value: {
          host: formData.host,
          port:
            typeof formData.port === 'string'
              ? parseInt(formData.port, 10)
              : formData.port,
          secure: formData.secure,
          username: formData.username,
          password: formData.password,
          from_name: formData.from_name,
          from_email: formData.from_email,
        },
        description: 'SMTP configuration for email service',
        is_secret: true,
        is_active: true,
      };

      // Use PUT if settings already exist (update), POST if creating new
      const method = settingsId ? 'PUT' : 'POST';
      const endpoint = settingsId
        ? `${API_ENDPOINTS.SETTINGS.BASE}/smtp_config`
        : API_ENDPOINTS.SETTINGS.BASE;

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.status}`);
      }

      const result = await response.json();

      // Store the ID for future updates
      if (!settingsId && result.data?.id) {
        setSettingsId(result.data.id);
      }

      setMessage({
        type: 'success',
        text: 'Mail settings saved successfully!',
      });
      onSave?.(formData);
      setTimeout(() => setMessage(null), 4000);
    } catch (error) {
      console.error('Error saving mail settings:', error);
      setMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Failed to save mail settings',
      });
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='w-full'>
      {/* Header */}
      <div className='mb-6 flex items-center gap-3'>
        <div className='p-3 rounded-lg bg-brand-50'>
          <MdEmail className='w-6 h-6 text-brand-600' />
        </div>
        <div>
          <h1 className='text-heading-lg font-bold text-gray-900 dark:text-white'>
            Mail Settings
          </h1>
          <p className='text-body-sm text-gray-600 dark:text-gray-400'>
            Configure your SMTP email service settings
          </p>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-success-50 border-success-200 text-success-700'
              : 'bg-error-50 border-error-200 text-error-700'
          }`}
        >
          <p className='text-body-sm font-medium'>{message.text}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className='text-center py-12'>
          <p className='text-body-base text-gray-500 dark:text-gray-400'>
            Loading mail settings...
          </p>
        </div>
      ) : (
        /* Form */
        <div className='space-y-6'>
          {/* Mail Host & Port */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <Label htmlFor='host'>Mail Host *</Label>
              <InputField
                id='host'
                name='host'
                type='text'
                value={formData.host}
                onChange={handleInputChange}
                placeholder='smtp.gmail.com'
                required
              />
            </div>
            <div>
              <Label htmlFor='port'>Mail Port *</Label>
              <InputField
                id='port'
                name='port'
                type='number'
                value={formData.port}
                onChange={handleInputChange}
                placeholder='587'
                required
              />
            </div>
          </div>

          {/* Username & Password */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <Label htmlFor='username'>Mail Username *</Label>
              <InputField
                id='username'
                name='username'
                type='email'
                value={formData.username}
                onChange={handleInputChange}
                placeholder='youremail@gmail.com'
                required
              />
            </div>
            <div>
              <Label htmlFor='password'>Password *</Label>
              <InputField
                id='password'
                name='password'
                type='password'
                value={formData.password}
                onChange={handleInputChange}
                placeholder='••••••••'
                required
              />
            </div>
          </div>

          {/* From Email & From Name */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <Label htmlFor='from_email'>From Email *</Label>
              <InputField
                id='from_email'
                name='from_email'
                type='email'
                value={formData.from_email}
                onChange={handleInputChange}
                placeholder='noreply@example.com'
                required
              />
            </div>
            <div>
              <Label htmlFor='from_name'>From Name *</Label>
              <InputField
                id='from_name'
                name='from_name'
                type='text'
                value={formData.from_name}
                onChange={handleInputChange}
                placeholder='Pawilly'
                required
              />
            </div>
          </div>

          {/* Secure Checkbox */}
          <div className='flex items-center gap-3'>
            <input
              id='secure'
              name='secure'
              type='checkbox'
              checked={formData.secure}
              onChange={handleInputChange}
              className='w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer'
            />
            <label htmlFor='secure' className='text-label cursor-pointer'>
              Use Secure Connection (SSL/TLS)
            </label>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3 pt-4 justify-end'>
            <Button onClick={handleSave} disabled={isSaving || isLoading}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MailSettings;
