import type { ReactNode } from 'react';

import IconMoreCircle from '@components/Icons/IconMoreCircle/IconMoreCircle';
import SlideModal from '@components/SlideModal/SlideModal';
import type { TUseBooleanReturns } from '@hooks/useBoolean';

import css from './MoreOptionsIcon.module.scss';

type TMoreOptionsIconProps = {
  control: TUseBooleanReturns;
  options: {
    content: ReactNode;
    onClick?: () => void;
    shouldCloseModalAfterClick?: boolean;
  }[];
  modalTitle?: string;
};

const MoreOptionsIcon: React.FC<TMoreOptionsIconProps> = ({
  control,
  options,
  modalTitle = 'Khác',
}) => {
  return (
    <div className={css.root}>
      <IconMoreCircle onClick={control.setTrue} className={css.icon} />

      <SlideModal
        id="MoreOptionIcon.modal"
        isOpen={control.value}
        onClose={control.setFalse}
        modalTitle={modalTitle}
        contentClassName={css.moreOptionsModalContent}
        containerClassName={css.moreOptionsModalContainer}>
        <div className={css.optionList}>
          {options.map(
            ({ content, onClick, shouldCloseModalAfterClick = true }, key) => {
              const handleClick = () => {
                if (onClick) {
                  onClick();
                }

                if (shouldCloseModalAfterClick) {
                  control.setFalse();
                }
              };

              return (
                <div key={key} onClick={handleClick} className={css.optionItem}>
                  {content}
                </div>
              );
            },
          )}
        </div>
      </SlideModal>
    </div>
  );
};

export default MoreOptionsIcon;
