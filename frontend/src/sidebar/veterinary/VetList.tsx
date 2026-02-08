import VeterinarianListTable from '../../components/tables/veterinaryTables/VeterinarianListTable';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';

const VetList = () => {
  return (
    <>
      <PageMeta
        title='BracePet VeterinarianListTable'
        description='This is BracePet VeterinarianListTable'
      />
      <div className='space-y-6 p-4'>
        <ComponentCard title='VeterinarianListTable'>
          <VeterinarianListTable />
        </ComponentCard>
      </div>
    </>
  );
};

export default VetList;
