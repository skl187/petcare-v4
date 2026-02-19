import React from 'react';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import NotificationTemplateTable from '../../components/tables/notifications/NotificationTemplateTable';

const TemplateNotification: React.FC = () => {
  return (
    <>
      <PageMeta title='Notification Templates' description='Manage notification templates (CRUD + preview/send)' />
      <div className='space-y-6 p-4'>
        <ComponentCard title='Notification Templates'>
          <NotificationTemplateTable />
        </ComponentCard>
      </div>
    </>
  );
};

export default TemplateNotification;
