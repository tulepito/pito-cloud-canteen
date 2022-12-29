import RestaurantRow from './RestaurantRow';
import RestaurantTableHead from './RestaurantTableHead';
import SelectRestaurantForm from './SelectRestaurantForm';

type TRestaurantTableProps = {
  restaurants: any;
};

const RestaurantTable: React.FC<TRestaurantTableProps> = ({ restaurants }) => {
  const items =
    restaurants?.length > 0
      ? restaurants.map((restaurant: any, index: any) => (
          <RestaurantRow key={index} restaurant={restaurant} />
        ))
      : null;

  return (
    <div>
      <RestaurantTableHead />
      <SelectRestaurantForm onSubmit={() => {}} items={items} />;
    </div>
  );
};

export default RestaurantTable;
