import classNames from 'classnames';
import type { PropsWithChildren } from 'react';

import type { TModalProps } from '../Modal';
import Modal from '../Modal';
import css from './BackdropModal.module.scss';

type TBackdropModal = {} & TModalProps;

const BackdropModal: React.FC<PropsWithChildren<TBackdropModal>> = ({
  isOpen,
  title,
  children,
  handleClose,
  scrollLayerClassName,
  containerClassName,
}) => {
  return (
    <Modal
      className={css.modalRoot}
      title={title}
      isOpen={isOpen}
      handleClose={handleClose}
      containerClassName={classNames(css.container, containerClassName)}
      scrollLayerClassName={classNames(css.scrollLayer, scrollLayerClassName)}>
      {children}
    </Modal>
  );
};

export default BackdropModal;
