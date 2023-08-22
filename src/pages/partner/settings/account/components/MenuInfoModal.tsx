import IconArrow from '@components/Icons/IconArrow/IconArrow';
import IconEdit from '@components/Icons/IconEdit/IconEdit';
import Modal from '@components/Modal/Modal';
import RenderWhen from '@components/RenderWhen/RenderWhen';
import useBoolean from '@hooks/useBoolean';

import MenuInfo from './MenuInfo';
import MenuSettingsForm from './MenuSettingsForm';

import css from './MenuInfoModal.module.scss';

type TNavigationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const MenuInfoModal: React.FC<TNavigationModalProps> = (props) => {
  const { isOpen, onClose } = props;
  const viewModeController = useBoolean(true);

  const isViewMode = viewModeController.value;

  const handleChangeViewMode = () => {
    viewModeController.toggle();
  };

  return (
    <Modal
      isOpen={isOpen}
      className={css.root}
      handleClose={() => {}}
      containerClassName={css.modalContainer}
      headerClassName={css.modalHeader}
      shouldHideIconClose>
      <div>
        <div className={css.heading}>
          <IconArrow direction="left" onClick={onClose} />
          <RenderWhen condition={isViewMode}>
            <div>Thực đơn</div>
            <div
              className={css.editIconContainer}
              onClick={handleChangeViewMode}>
              <IconEdit />
            </div>

            <RenderWhen.False>
              <div>Chỉnh sửa thực đơn</div>
            </RenderWhen.False>
          </RenderWhen>
        </div>

        <RenderWhen condition={isViewMode}>
          <MenuInfo meals={[]} categories={[]} />

          <RenderWhen.False>
            <MenuSettingsForm onSubmit={() => {}} />
          </RenderWhen.False>
        </RenderWhen>
      </div>
    </Modal>
  );
};

export default MenuInfoModal;
