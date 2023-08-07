import React from 'react';
import { FormattedMessage } from 'react-intl';

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
  console.log({ type });

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
              <FormattedMessage id="ModalReachMaxAllowedChanges.content2" />
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
        Quay lại
      </Button>
    </Modal>
  );
};

export default ModalReachMaxAllowedChanges;
