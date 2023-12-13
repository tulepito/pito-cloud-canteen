import { useRouter } from 'next/router';

import IconHome from '@components/Icons/IconHome/IconHome';
import AlertModal from '@components/Modal/AlertModal';
import type { TUseBooleanReturns } from '@hooks/useBoolean';
import { companyPaths } from '@src/paths';

import css from './GoHomeIcon.module.scss';

type TGoHomeIconProps = { control: TUseBooleanReturns };

const GoHomeIcon: React.FC<TGoHomeIconProps> = ({ control }) => {
  const router = useRouter();

  const handleGoHomeConfirmed = () => {
    router.push(companyPaths.Home);
    control.setFalse();
  };

  return (
    <div className={css.root}>
      <IconHome onClick={control.setTrue} className={css.icon} />

      <AlertModal
        isOpen={control.value}
        handleClose={control.setFalse}
        title={'Về trang chủ'}
        confirmLabel={'Về trang chủ'}
        cancelLabel={'Đóng'}
        onConfirm={handleGoHomeConfirmed}
        onCancel={control.setFalse}
        shouldFullScreenInMobile={false}
        containerClassName={css.confirmGoHomeModalContainer}
        headerClassName={css.confirmGoHomeModalHeader}
        childrenClassName={css.confirmGoHomeModalChildren}>
        Đơn hàng sẽ được lưu lại, bạn vẫn có thể tiếp tục đặt đơn vào lúc khác.
      </AlertModal>
    </div>
  );
};

export default GoHomeIcon;
