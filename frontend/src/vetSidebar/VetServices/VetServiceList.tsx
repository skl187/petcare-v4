import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import ServiceListTable from '../../components/tables/veterinaryTables/ServiceListTable';

const VetServiceList = () => {
  return (
    <>
      <PageMeta
        title='BracePet - Vet Services'
        description='Manage veterinary services'
      />
      <div className='space-y-6 p-4'>
        <ComponentCard title='Service Management'>
          <ServiceListTable />
        </ComponentCard>
      </div>
    </>
  );
};

export default VetServiceList;
