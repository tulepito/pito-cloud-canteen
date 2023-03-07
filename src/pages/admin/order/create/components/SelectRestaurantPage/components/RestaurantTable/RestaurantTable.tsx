import { FormattedMessage } from 'react-intl';

import Tooltip from '@components/Tooltip/Tooltip';
import { useAppSelector } from '@hooks/reduxHooks';

import RestaurantRow from './RestaurantRow';
import RestaurantTableHead from './RestaurantTableHead';

import css from './RestaurantTable.module.scss';

type TRestaurantTableProps = {
  restaurants: any;
  onItemClick: (id: string) => () => void;
};

const RestaurantTable: React.FC<TRestaurantTableProps> = ({
  restaurants,
  onItemClick,
}) => {
  const { fetchRestaurantsPending } = useAppSelector(
    (state) => state.SelectRestaurantPage,
  );

  return (
    <>
      <RestaurantTableHead />

      <div>
        {fetchRestaurantsPending ? (
          <div className={css.center}>
            <FormattedMessage id="RestaurantTable.loadingText" />
          </div>
        ) : (
          <>
            {restaurants?.length > 0 ? (
              restaurants.map((restaurant: any) => (
                <Tooltip
                  key={restaurant.menu?.id?.uuid}
                  placement="bottom"
                  tooltipContent={<>{'Xem menu'}</>}>
                  <RestaurantRow
                    restaurant={restaurant}
                    onItemClick={onItemClick(restaurant)}
                  />
                </Tooltip>
              ))
            ) : (
              <div className={css.center}>
                <FormattedMessage id="RestaurantTable.noResults" />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default RestaurantTable;
