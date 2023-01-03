import { useAppSelector } from '@hooks/reduxHooks';
import type { FormState } from 'final-form';
import { FormattedMessage } from 'react-intl';

import FieldRestaurant from './FieldRestaurant';
import css from './RestaurantTable.module.scss';
import RestaurantTableHead from './RestaurantTableHead';
import type { TSelectRestaurantFormValues } from './SelectRestaurantForm';
import SelectRestaurantForm from './SelectRestaurantForm';

type TRestaurantTableProps = {
  restaurants: any;
  currentRestaurant: any;
  isSelectedRestaurant: boolean;
  onItemClick: (id: string) => () => void;
  onFormChange: (
    form: FormState<
      TSelectRestaurantFormValues,
      Partial<TSelectRestaurantFormValues>
    >,
  ) => void;
};

const RestaurantTable: React.FC<TRestaurantTableProps> = ({
  restaurants,
  onItemClick,
  isSelectedRestaurant,
  currentRestaurant,
  onFormChange,
}) => {
  const { fetchRestaurantsPending } = useAppSelector(
    (state) => state.SelectRestaurantPage,
  );

  return (
    <>
      <RestaurantTableHead />
      <SelectRestaurantForm
        onSubmit={() => {}}
        currentRestaurant={currentRestaurant}
        isSelectedRestaurant={isSelectedRestaurant}
        onFormChange={onFormChange}>
        <>
          {fetchRestaurantsPending ? (
            <div className={css.center}>
              <FormattedMessage id="RestaurantTable.loadingText" />
            </div>
          ) : (
            <>
              {restaurants?.length > 0 ? (
                restaurants.map((restaurant: any, index: any) => (
                  <FieldRestaurant
                    key={index}
                    restaurant={restaurant}
                    onItemClick={onItemClick(restaurant)}
                  />
                ))
              ) : (
                <div className={css.center}>
                  <FormattedMessage id="RestaurantTable.noResults" />
                </div>
              )}
            </>
          )}
        </>
      </SelectRestaurantForm>
    </>
  );
};

export default RestaurantTable;
