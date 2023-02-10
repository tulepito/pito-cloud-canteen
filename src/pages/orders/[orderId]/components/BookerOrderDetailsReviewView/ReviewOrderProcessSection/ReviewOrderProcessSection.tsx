import ActivityItem from '@components/TimeLine/ActivityItem';
import VerticalTimeLine from '@components/TimeLine/VerticalTimeLine';
import { useIntl } from 'react-intl';

import css from './ReviewOrderProcessSection.module.scss';

type TReviewOrderProcessSectionProps = {};

const ReviewOrderProcessSection: React.FC<
  TReviewOrderProcessSectionProps
> = () => {
  const intl = useIntl();
  const sectionTitle = intl.formatMessage({
    id: 'ReviewOrderProcessSection.title',
  });

  const items = [
    { label: 'Mới tạo', description: '11:00 - 12/09/2022' },
    { label: 'Chọn món', description: '11:00 - 12/09/2022' },
    { label: 'Xác nhận đơn', description: '11:00 - 12/09/2022' },
    { label: 'Đang triển khai', description: '(5/10 ngày hoàn thành)' },
    { label: 'Đã hoàn thành' },
  ];

  return (
    <div className={css.root}>
      <div className={css.sectionTitle}>{sectionTitle}</div>
      <div className={css.activityContainer}>
        <VerticalTimeLine
          itemComponent={ActivityItem}
          items={items}
          lastActiveItem={4}
        />
      </div>
    </div>
  );
};

export default ReviewOrderProcessSection;
