import classNames from 'classnames';

import css from './RestaurantTable.module.scss';

type TRestaurantTableHeadProps = {
  rootClassName?: string;
  className?: string;
};

const RestaurantTableHead: React.FC<TRestaurantTableHeadProps> = (props) => {
  const { rootClassName, className } = props;
  const headClasses = classNames(rootClassName || css.headRoot, className);
  const headItemClasses = classNames(css.item, css.headItem);

  const heads = [
    'Tên đối tác',
    'Danh mục thực đơn',
    'Phong cách ẩm thực',
    'Tiêu chí',
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
