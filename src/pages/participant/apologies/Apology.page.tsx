import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import IconArrow from '@components/Icons/IconArrow/IconArrow';
import { useAppSelector } from '@hooks/reduxHooks';
import { useViewport } from '@hooks/useViewport';
import { currentUserSelector } from '@redux/slices/user.slice';
import { participantPaths } from '@src/paths';
import { User } from '@src/utils/data';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';

import css from './Apology.module.scss';

const ApologiesPage = () => {
  const router = useRouter();
  const { isMobileLayout } = useViewport();
  const currentUser = useAppSelector(currentUserSelector);
  const userGetter = User(currentUser!);
  const { firstName, lastName, displayName } = userGetter.getProfile();

  const employeeName =
    buildFullName(firstName, lastName, {
      compareToGetLongerWith: displayName,
    }) || 'bạn';

  const handleGoBack = () => {
    router.push(participantPaths.OrderList);
  };

  return (
    <div className={css.container}>
      <div className={css.decorators}>
        <Image
          src="/static/decorator-green.png"
          alt="decorator"
          width={200}
          height={200}
          className={css.decoratorGreen}
        />
        <Image
          src="/static/decorator-pink.png"
          alt="decorator"
          width={150}
          height={150}
          className={css.decoratorPink}
        />
        <Image
          src="/static/decorator-blue.png"
          alt="decorator"
          width={250}
          height={250}
          className={css.decoratorBlue}
        />
        <Image
          src="/static/decorator-yellow.png"
          alt="decorator"
          width={180}
          height={180}
          className={css.decoratorYellow}
        />
      </div>
      {isMobileLayout && (
        <div className={css.header}>
          <div className={css.backButton} onClick={handleGoBack}>
            <IconArrow direction="left" />
          </div>
          <div className={css.headerLogo}>
            <Image
              src="/static/icons/logo.png"
              alt="logo"
              width={100}
              height={100}
              className={css.logoIcon}
            />
          </div>
        </div>
      )}
      <div className={css.content}>
        <div className={css.greeting}>Thân gửi bạn {employeeName},</div>

        <div className={css.paragraph}>
          Vào bữa trưa ngày 05/01/2026, do có sự nhầm lẫn trong việc cập nhật
          tên món ăn trên menu, dẫn đến việc bạn chưa nhận được đúng món như kỳ
          vọng.
        </div>

        <div className={css.paragraph}>
          PITO Cloud Canteen chân thành xin lỗi bạn vì sự bất tiện và trải
          nghiệm chưa trọn vẹn trong bữa ăn vừa qua. Đây là sai sót trong quá
          trình nhà hàng chuẩn bị và cập nhật thông tin menu trên hệ thống.
        </div>

        <div className={css.paragraph}>
          Qua email này, PITO Cloud Canteen ghi nhận thông tin, đồng thời đã rà
          soát và chấn chỉnh lại quy trình lên menu cũng như vận hành đơn hàng,
          nhằm hạn chế tối đa các sai sót tương tự trong thời gian tới và mang
          đến trải nghiệm tốt hơn cho bạn.
        </div>

        <div className={css.paragraph}>
          Một lần nữa, PITO Cloud Canteen rất mong nhận được sự thông cảm từ bạn
          và thành thật xin lỗi vì sự cố vừa qua.
        </div>

        <div className={css.signature}>
          <div className={css.signatureText}>Trân trọng,</div>
          <div className={css.signatureName}>Nguyễn Thị Xuân Phú</div>
          <div className={css.signatureTitle}>Growth & Client Partnerships</div>
          <div className={css.signatureCompany}>PITO Cloud Canteen | PITO</div>
        </div>
      </div>
    </div>
  );
};

export default ApologiesPage;
