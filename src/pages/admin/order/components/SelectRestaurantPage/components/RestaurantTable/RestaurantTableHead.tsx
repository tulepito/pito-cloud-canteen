import { useIntl } from 'react-intl';
import classNames from 'classnames';

import type { TDefaultProps } from '@utils/types';

import css from './RestaurantTable.module.scss';

type TRestaurantTableHeadProps = TDefaultProps & {};

const RestaurantTableHead: React.FC<TRestaurantTableHeadProps> = (props) => {
  const intl = useIntl();
  const { rootClassName, className } = props;
  const headClasses = classNames(rootClassName || css.headRoot, className);
  const headItemClasses = classNames(css.item, css.headItem);

  const heads = [
    intl.formatMessage({ id: 'RestaurantTableHead.head.partnerName' }),
    intl.formatMessage({ id: 'RestaurantTableHead.head.categories' }),
    intl.formatMessage({ id: 'RestaurantTableHead.head.foodStyles' }),
    intl.formatMessage({ id: 'RestaurantTableHead.head.criteria' }),
  ];

  return (
    <div className={headClasses}>
      <div className={headItemClasses}>
        {heads.map((head, index) => (
          <div key={index}>{head}</div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantTableHead;
