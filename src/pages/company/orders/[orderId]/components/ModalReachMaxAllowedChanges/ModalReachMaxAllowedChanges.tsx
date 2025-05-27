import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import Button from '@components/Button/Button';
import IconDanger from '@components/Icons/IconDanger/IconDanger';
import Modal from '@components/Modal/Modal';

import css from './ModalReachMaxAllowedChanges.module.scss';

type TModalReachMaxAllowedChanges = {
  id?: string;
  isOpen: boolean;
  handleClose: () => void;
  type: 'reach_max' | 'reach_min' | null;
  minQuantity: number;
};

const ModalReachMaxAllowedChanges: React.FC<TModalReachMaxAllowedChanges> = (
  props,
) => {
  const { id, isOpen, handleClose, type = 'reach_max', minQuantity } = props;
  const intl = useIntl();

  return (
    <Modal
      id={id}
      openClassName={css.isOpen}
      className={css.modalRoot}
      shouldHideIconClose
      isOpen={isOpen}
      handleClose={handleClose}
      contentClassName={css.modalContent}
      containerClassName={css.container}
      shouldFullScreenInMobile={false}>
      <IconDanger className={css.iconDanger} />
      <div className={css.contentText}>
        {type === 'reach_max' ? (
          <>
            <div>
              <FormattedMessage id="ModalReachMaxAllowedChanges.content" />
            </div>
            <div>
              <FormattedMessage
                id="ModalReachMaxAllowedChanges.content2"
                values={{
                  percent:
                    process.env.NEXT_PUBLIC_MAX_ORDER_DETAIL_MODIFIED_PERCENT,
                }}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <FormattedMessage
                id="ModalReachMaxAllowedChanges.contentReachMin"
                values={{ minQuantity }}
              />
            </div>
          </>
        )}
      </div>

      <Button
        type="button"
        onClick={handleClose}
        className={css.button}
        variant="secondary">
        {intl.formatMessage({ id: 'booker.orders.draft.foodDetailModal.back' })}
      </Button>
    </Modal>
  );
};

export default ModalReachMaxAllowedChanges;
