import { FormattedMessage } from 'react-intl';

import Tooltip from '@components/Tooltip/Tooltip';
import { useAppSelector } from '@hooks/reduxHooks';
import { Listing } from '@src/utils/data';

import RestaurantRow from './RestaurantRow';
import RestaurantTableHead from './RestaurantTableHead';

import css from './RestaurantTable.module.scss';

type TRestaurantTableProps = {
  selectedTime: number;
  restaurants: any;
  onItemClick: (id: string) => () => void;
};

const RestaurantTable: React.FC<TRestaurantTableProps> = ({
  selectedTime,
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
              restaurants.map((restaurant: any) => {
                const { restaurantInfo } = restaurant || {};
                const {
                  stopReceiveOrder = false,
                  startStopReceiveOrderDate = 0,
                  endStopReceiveOrderDate = 0,
                } = Listing(restaurantInfo).getPublicData();
                const disabledSelectRestaurant =
                  stopReceiveOrder &&
                  selectedTime >= startStopReceiveOrderDate &&
                  selectedTime <= endStopReceiveOrderDate;

                return !stopReceiveOrder ? (
                  <Tooltip
                    key={restaurant.menu?.id?.uuid}
                    placement="bottom"
                    tooltipContent={<>{'Xem menu'}</>}>
                    <RestaurantRow
                      restaurant={restaurant}
                      onItemClick={onItemClick(restaurant)}
                    />
                  </Tooltip>
                ) : (
                  <RestaurantRow
                    disabledSelectRestaurant={disabledSelectRestaurant}
                    restaurant={restaurant}
                    onItemClick={onItemClick(restaurant)}
                  />
                );
              })
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
