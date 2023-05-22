import type { ReactNode } from 'react';
import type { StaticImageData } from 'next/image';
import Image from 'next/image';

import Modal from '@components/Modal/Modal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import type { TObject } from '@src/utils/types';

import css from './CoverModal.module.scss';

type TCoverModalProps = {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  coverSrc: StaticImageData;
  modalTitle: string;
  modalDescription: ReactNode | string;
  rowInformation?: TObject[];
  buttonWrapper?: ReactNode;
};

const CoverModal: React.FC<TCoverModalProps> = (props) => {
  const {
    id,
    isOpen,
    onClose,
    coverSrc,
    modalTitle,
    modalDescription,
    rowInformation,
    buttonWrapper,
  } = props;

  return (
    <Modal
      id={id}
      isOpen={isOpen}
      shouldHideIconClose
      shouldHideGreyBackground
      containerClassName={css.modalContainer}
      handleClose={onClose}>
      <div className={css.coverWrapper}>
        <Image className={css.cover} src={coverSrc} alt="cover" />
      </div>
      <div className={css.title}>{modalTitle}</div>
      <div className={css.description}>{modalDescription}</div>
      <div className={css.infor}>
        {rowInformation?.map((item, index) => (
          <div className={css.row} key={index}>
            <span>{item.label}</span>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
      <RenderWhen condition={!!buttonWrapper}>
        <div className={css.buttonWrapper}>{buttonWrapper}</div>
      </RenderWhen>
    </Modal>
  );
};

export default CoverModal;
