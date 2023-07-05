import { useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import IconClose from '@components/Icons/IconClose/IconClose';

import css from './PartnerNotificationModal.module.scss';

type TPartnerNotificationModalProps = {
  handleCloseTooltip: () => void;
};

const PartnerNotificationModal: React.FC<TPartnerNotificationModalProps> = ({
  handleCloseTooltip,
}) => {
  const intl = useIntl();

  const isNotificationListEmpty = true;
  const disableMarkAllViewed = isNotificationListEmpty;
  const handleMarkAllViewed = () => {};

  return (
    <div className={css.root}>
      <div className={css.head}>
        <span>
          {intl.formatMessage({ id: 'PartnerNotificationModal.title' })}
        </span>
        <div className={css.closeIconWrapper} onClick={handleCloseTooltip}>
          <IconClose className={css.closeIcon} />
        </div>
      </div>
      <div className={css.container}></div>
      <div className={css.bottom}>
        <Button
          variant="inline"
          disabled={disableMarkAllViewed}
          className={css.markAllViewedBtn}
          onClick={handleMarkAllViewed}>
          {intl.formatMessage({ id: 'PartnerNotificationModal.markAllViewed' })}
        </Button>
      </div>
    </div>
  );
};

export default PartnerNotificationModal;
