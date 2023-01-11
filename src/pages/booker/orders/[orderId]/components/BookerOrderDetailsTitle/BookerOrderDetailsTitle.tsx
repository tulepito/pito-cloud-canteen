import Badge from '@components/Badge/Badge';
import Button from '@components/Button/Button';
import classNames from 'classnames';
import { useIntl } from 'react-intl';

import css from './BookerOrderDetailsTitle.module.scss';

type TBookerOrderDetailsTitleProps = {
  rootClassName?: string;
  className?: string;
};

const BookerOrderDetailsTitle: React.FC<TBookerOrderDetailsTitleProps> = (
  props,
) => {
  const intl = useIntl();
  const { rootClassName, className } = props;
  const rootClasses = classNames(rootClassName || css.root, className);

  const deliveryInfo = intl.formatMessage(
    {
      id: 'BookerOrderDetailsTitle.deliveryInfo',
    },
    {
      time: <b>12:00</b>,
      place: <b>123 Nguyễn Công Trứ, phường 3, quận 3, HCM</b>,
    },
  ) as string;

  return (
    <div className={rootClasses}>
      <div>
        <div className={css.titleText}>
          {intl.formatMessage({ id: 'BookerOrderDetailsTitle.title' })}
        </div>
        <Badge label={deliveryInfo} />
      </div>
      <Button type="button" variant="cta" className={css.makeOrderBtn}>
        {intl.formatMessage({
          id: 'BookerOrderDetailsTitle.makeOrderButtonText',
        })}
      </Button>
    </div>
  );
};

export default BookerOrderDetailsTitle;
