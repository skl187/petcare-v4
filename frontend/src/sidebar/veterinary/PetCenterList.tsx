import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import PetCareCenterTable from '../../components/tables/veterinaryTables/PetCareCenterTable';

const PetCenterList = () => {
  return (
    <>
      <PageMeta
        title='BracePet Pet Care Center List'
        description='This is BracePet Pet Care Center List'
      />
      <div className='space-y-6 p-4'>
        <ComponentCard title='Pet Care Center List'>
          <PetCareCenterTable />
        </ComponentCard>
      </div>
    </>
  );
};

export default PetCenterList;
