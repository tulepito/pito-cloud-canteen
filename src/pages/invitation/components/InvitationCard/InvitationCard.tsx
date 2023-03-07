import type { ReactNode } from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';

import Button from '@components/Button/Button';

import css from './InvitationCard.module.scss';

type InvitationCardProps = {
  companyName: string;
  onAccept: () => void;
  onDecline: () => void;
  responseToInvitationInProgress: boolean;
};
const InvitationCard: React.FC<InvitationCardProps> = (props) => {
  const {
    companyName,
    onAccept,
    onDecline,
    responseToInvitationInProgress = false,
  } = props;
  const intl = useIntl();
  const modalClasses = classNames(css.modal, css.open);
  return (
    <div className={modalClasses}>
      <div className={css.overlay}>
        <div className={css.modalContainer}>
          <div className={css.modalHeader}>
            <span className={css.modalTitle}>
              {intl.formatMessage({ id: 'InvitationCard.title' })}
            </span>
          </div>
          <div className={css.modalContent}>
            <p>
              {intl.formatMessage(
                { id: 'InvitationCard.invitation' },
                {
                  span: (msg: ReactNode) => (
                    <span className={css.boldText}>{msg}</span>
                  ),
                  companyName,
                },
              )}
            </p>
            <div className={css.infoRow}>
              <span className={css.title}>
                {intl.formatMessage({ id: 'InvitationCard.companyTitle' })}
              </span>
              <span className={css.content}>{companyName}</span>
            </div>
          </div>
          <div className={css.modalFooter}>
            <Button
              className={css.declineBtn}
              onClick={onDecline}
              inProgress={responseToInvitationInProgress}
              disabled={responseToInvitationInProgress}>
              {intl.formatMessage({ id: 'InvitationCard.decline' })}
            </Button>
            <Button
              className={css.acceptBtn}
              onClick={onAccept}
              inProgress={responseToInvitationInProgress}
              disabled={responseToInvitationInProgress}>
              {intl.formatMessage({ id: 'InvitationCard.accept' })}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default InvitationCard;
