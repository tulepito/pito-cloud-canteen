import { useIntl } from 'react-intl';

import css from './SectionOrderPanel.module.scss';

type TOrderPanelHeader = {
  className?: string;
  selectedDays?: number;
  sumDays?: number;
};

const OrderPanelHeader: React.FC<TOrderPanelHeader> = ({
  selectedDays = 0,
  sumDays = 0,
}) => {
  const intl = useIntl();

  const sectionTitle = intl.formatMessage({
    id: 'SectionOrderPanel.sectionTitle',
  });

  return (
    <div className={css.sectionHeader}>
      <p className={css.title}>{sectionTitle}</p>
      <p className={css.selectedDay}>
        {intl.formatMessage(
          {
            id: 'SectionOrderPanel.numberSelectedDays',
          },
          {
            selectedDays,
            sumDays,
          },
        )}
      </p>
    </div>
  );
};

export default OrderPanelHeader;
