import { useRouter } from 'next/router';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import Modal from '@components/Modal/Modal';
import { partnerPaths } from '@src/paths';

import css from './NavigationModal.module.scss';

type TNavigationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const NavigationModal: React.FC<TNavigationModalProps> = (props) => {
  const { isOpen, onClose } = props;

  const router = useRouter();

  const handleNavigateToAccountInfoPage = () => {
    router.push(partnerPaths.AccountSettingsDetail);
  };
  const handleNavigateToMenuSettingsPage = () => {
    router.push(partnerPaths.MenuSettings);
  };
  const handleNavigateToBankSettingsPage = () => {
    router.push(partnerPaths.BankSettings);
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
        <div className={css.heading} onClick={onClose}>
          <IconArrow direction="left" />
          <div>Cài đặt tài khoản</div>
        </div>

        <div>
          <div
            className={css.itemRow}
            onClick={handleNavigateToAccountInfoPage}>
            <div>Thông tin tài khoản</div> <IconArrow direction="right" />
          </div>
          <div
            className={css.itemRow}
            onClick={handleNavigateToMenuSettingsPage}>
            <div>Thông tin thực đơn</div> <IconArrow direction="right" />
          </div>
          <div
            className={css.itemRow}
            onClick={handleNavigateToBankSettingsPage}>
            <div>Thông tin ngân hàng</div>
            <IconArrow direction="right" />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NavigationModal;
