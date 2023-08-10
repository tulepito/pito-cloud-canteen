import IconSpinner from '@components/Icons/IconSpinner/IconSpinner';
import Modal from '@components/Modal/Modal';
import { useViewport } from '@hooks/useViewport';

import css from './LoadingModal.module.scss';

const LoadingModal = ({ isOpen }: { isOpen: boolean }) => {
  const { isMobileLayout } = useViewport();

  if (!isMobileLayout) return null;

  return (
    <Modal
      id="LoadingModal"
      isOpen={isOpen}
      handleClose={() => {}}
      openClassName={css.modalOpen}
      scrollLayerClassName={css.scrollLayer}
      containerClassName={css.container}
      shouldHideIconClose>
      <div className={css.content}>
        <IconSpinner />
      </div>
    </Modal>
  );
};

export default LoadingModal;
