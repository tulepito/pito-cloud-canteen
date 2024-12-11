import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Button from '@components/Button/Button';

import css from './InvitationNotiModal.module.scss';

type InvitationNotiModalProps = {
  companyName?: string;
  status: string;
  goToHomePage?: () => void;
};
const InvitationNotiModal: React.FC<InvitationNotiModalProps> = (props) => {
  const { status, goToHomePage } = props;
  const intl = useIntl();
  const modalClasses = classNames(css.modal, css.open);

  return (
    <div className={modalClasses}>
      <div className={css.overlay}>
        <div className={css.modalContainer}>
          <div className={css.modalHeader}>
            <span className={css.modalTitle}>
              {intl.formatMessage({
                id: `InvitationNotiModal.title.${status}`,
              })}
            </span>
          </div>
          <div className={css.modalFooter}>
            <Button className={css.btn} onClick={goToHomePage}>
              {intl.formatMessage({
                id: `InvitationNotiModal.button`,
              })}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default InvitationNotiModal;
