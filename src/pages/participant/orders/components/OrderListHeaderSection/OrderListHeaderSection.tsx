import IconBell from '@components/Icons/IconBell/IconBell';

import css from './OrderListHeaderSection.module.scss';

const OrderListHeaderSection = () => {
  return (
    <div className={css.sectionWrapper}>
      <div className={css.sectionTitle}>Lịch của tôi</div>
      <div className={css.iconWrapper}>
        <IconBell />
        <div className={css.notiNumber}>12</div>
      </div>
    </div>
  );
};

export default OrderListHeaderSection;
