import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ArrowLeftIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { receiveVoucherApi } from '@apis/participantApi';
import Button from '@components/Button/Button';
import PitoLogo from '@components/PitoLogo/PitoLogo';
import { mapUserPermissionByRole } from '@components/RoleSelectModal/helpers/mapUserPermissionByRole';
import { getItem, setItem } from '@helpers/localStorageHelpers';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import type { VoucherInfo } from '@pages/api/participants/events/voucher/receive.api';
import {
  currentUserSelector,
  userActions,
  userThunks,
} from '@redux/slices/user.slice';
import { buildFullNameFromProfile } from '@src/utils/emailTemplate/participantOrderPicking';
import { EUserRole } from '@src/utils/enums';
import { HttpStatus } from '@src/utils/response';

import pitoxCoolmate from '../../../website/assets/events/pito-coolmate.png';
import logo from '../../../website/assets/Logo.svg';

const EventPage = () => {
  const [isVoucherVisible, setIsVoucherVisible] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [scaleState, setScaleState] = useState<'normal' | 'pop'>('normal');
  const dispatch = useAppDispatch();
  const currentRole = useAppSelector((state) => state.user.currentRole);
  const currentUser = useAppSelector(currentUserSelector);
  const userName = buildFullNameFromProfile(currentUser?.attributes?.profile);
  const [isLoading, setIsLoading] = useState(false);
  const [voucher, setVoucher] = useState<VoucherInfo>();
  useEffect(() => {
    const userRole = getItem('userRole');
    if (
      userRole === EUserRole.booker &&
      currentRole !== EUserRole.participant
    ) {
      setItem('userRole', EUserRole.participant);

      dispatch(userActions.setRole(EUserRole.participant));
      dispatch(
        userActions.setUserPermission(
          mapUserPermissionByRole(EUserRole.participant),
        ),
      );

      dispatch(
        userThunks.fetchCurrentUser({
          userRole: EUserRole.participant,
        }),
      );
    }
  }, [dispatch, currentRole]);

  const handleRevealVoucher = async () => {
    try {
      setIsLoading(true);
      const response = await receiveVoucherApi();
      if (response.status === HttpStatus.OK) {
        const voucherInfo = response.data?.data;
        if (voucherInfo) {
          setVoucher(voucherInfo);
          setIsVoucherVisible(true);
          setScaleState('pop');
          setTimeout(() => setScaleState('normal'), 600);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Failed to receive voucher', error);
      toast.error('Bạn không nằm trong danh sách người dùng của sự kiện');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyVoucher = async () => {
    if (!isVoucherVisible || isCopying) {
      return;
    }

    setIsCopying(true);

    try {
      if (navigator?.clipboard?.writeText && voucher?.voucherCode) {
        await navigator.clipboard.writeText(voucher.voucherCode);
      }
    } catch (error) {
      console.warn('Failed to copy voucher code', error);
    } finally {
      setTimeout(() => setIsCopying(false), 1600);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans py-10 px-6 md:px-12 relative overflow-hidden">
      {/* Background Decorators */}
      <div className="pointer-events-none z-0">
        <Image
          src="/static/decorator-green.png"
          alt="decorator"
          width={200}
          height={200}
          className="object-contain absolute opacity-30 top-[-200px] right-[-120px] w-[400px] h-[400px] rotate-[60deg]"
        />
        <Image
          src="/static/decorator-pink.png"
          alt="decorator"
          width={150}
          height={150}
          className="object-contain absolute opacity-30 top-[120px] left-[-120px] w-[800px] h-[800px] rotate-12"
        />
        <Image
          src="/static/decorator-blue.png"
          alt="decorator"
          width={250}
          height={250}
          className="object-contain absolute opacity-30 top-[400px] right-[-150px] w-[800px] h-[800px] rotate-[290deg]"
        />
        <Image
          src="/static/decorator-yellow.png"
          alt="decorator"
          width={180}
          height={180}
          className="object-contain absolute opacity-30 top-[800px] right-[-200px] w-[800px] h-[800px] rotate-12"
        />
        <Image
          src="/static/decorator-blue.png"
          alt="decorator"
          width={250}
          height={250}
          className="object-contain absolute opacity-30 bottom-[-300px] left-[-100px] w-[800px] h-[800px] rotate-[60deg]"
        />
      </div>

      <div className="relative w-full max-w-3xl mx-auto z-10">
        {/* Header with Logo */}
        <Link className="md:hidden mb-5" href="/participant/orders">
          <Button
            type="button"
            size="small"
            variant="inline"
            className="flex border-none p-0">
            <ArrowLeftIcon className="w-4 h-4" />
          </Button>
        </Link>
        <div className="relative mt-2 md:hidden w-16 aspect-[1415/929]">
          <Image
            src={logo}
            alt="logo"
            fill
            priority
            loading="eager"
            quality={100}
          />
        </div>
        {/* Hero Video */}
        <div className="mb-8 mt-4">
          <div className="relative w-full rounded-2xl border border-[#17176026] bg-gradient-to-r from-[#e0f3ff] via-white to-[#ffe2f1] p-[1px] shadow-lg shadow-[#1717601a]">
            <div className="relative overflow-hidden rounded-[18px] bg-black/70">
              <video
                src="https://pito-test-bucket.s3.ap-southeast-2.amazonaws.com/cloudcanteen.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="block w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-black/10" />
              <div className="pointer-events-none absolute bottom-4 left-0 right-0 px-6 text-white">
                <p className="text-xs tracking-[0.3em] uppercase text-white/70">
                  PITO Cloud Canteen
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* HAPPY MEN'S DAY Banner */}
        <div className="bg-white px-6 py-4 rounded-sm mt-5">
          <h1 className="md:text-3xl font-[unbounded] text-black text-2xl font-bold text-center">
            HAPPY MEN&apos;S DAY
          </h1>
        </div>
        <div className="relative md:hidden w-32 mx-auto aspect-[1415/929]">
          <Image
            src={pitoxCoolmate}
            alt="PITOxCoolmate"
            fill
            priority
            loading="eager"
            className="object-contain"
          />
        </div>
        {/* Introductory Text */}
        <p className="text-base text-black px-3 py-2 mb-6 rounded-sm font-sans font-bold bg-[#b8e7ff]">
          Dành tặng riêng cho anh {userName} nhân dịp 19/11 - Ngày Quốc tế Nam
          giới
        </p>
        {/* Voucher Section */}
        <div className="bg-white py-3 rounded-lg border border-[#838383]">
          <h2 className="text-xl text-center md:text-2xl font-[unbounded] font-bold text-[#62BCEA] mb-4">
            Voucher giảm 100k <br />
            <span className="underline text-black"> tại Coolmate</span>
          </h2>
          <ul className="list-disc list-inside mb-4 space-y-2 px-4 text-black">
            <li>Cho đơn hàng tối thiểu 299k</li>
            <li>Áp dụng cho các sản phẩm đã giảm giá.</li>
            <li>Mỗi voucher chỉ có thể sử dụng một lần cho mỗi đơn hàng.</li>
          </ul>
          <p className="text-sm text-black italic px-4 text-[10px]">
            <span className="font-semibold">*Coolmate</span> -{' '}
            <span>thương hiệu đồ basics được nam giới Việt Nam tin dùng</span>
          </p>
        </div>
        {/* Voucher Code Display Section */}
        {isVoucherVisible && (
          <div className="my-8">
            <div
              className={`relative rounded-[24px] border-2 border-dashed border-[#17176026] bg-gradient-to-br from-[#1717600d] via-white to-[#ffecea] px-6 py-8 text-center shadow-sm transition-all duration-500 ${
                scaleState === 'pop' ? 'scale-105 shadow-lg' : 'scale-100'
              }`}>
              <span className="text-xs uppercase tracking-[0.3em] text-[#8c8c8c]">
                MÃ VOUCHER CỦA BẠN
              </span>
              <span className="mt-4 block text-lg md:text-5xl font-bold tracking-[0.3em] text-[#171760]">
                {voucher?.voucherCode}
              </span>
              <span className="mt-3 text-sm text-[#8c8c8c]">
                {isCopying
                  ? 'Đã sao chép! Chúc bạn mua sắm vui vẻ.'
                  : 'Sao chép và nhập tại bước thanh toán Coolmate.'}
              </span>

              <span className="absolute left-0 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
              <span className="absolute right-0 top-1/2 h-4 w-4 translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
            </div>

            <div className="flex flex-col gap-3 mt-4">
              <Button
                type="button"
                className="font-[unbounded]"
                onClick={handleCopyVoucher}
                fullWidth>
                {isCopying ? 'Đã sao chép' : 'Sao chép mã'}
              </Button>
            </div>
          </div>
        )}
        {/* Button */}
        <div className="my-6">
          {!isVoucherVisible ? (
            <Button
              type="button"
              className="font-[unbounded]"
              onClick={handleRevealVoucher}
              fullWidth
              disabled={isLoading}
              inProgress={isLoading}
              loadingMode="replace">
              Nhận mã Voucher
            </Button>
          ) : null}
        </div>
        {/* Validity Period */}
        <p className="text-center font-semibold text-lg text-black mb-8">
          Thời gian áp dụng: 19/11/2025 - 31/12/2025
        </p>
        {/* Voucher Usage Instructions */}
        <div className="bg-white mb-8 rounded-lg border border-[#4f4f4f]">
          <h3 className="text-lg p-3 text-center font-[unbounded] font-bold text-black">
            Sử dụng mã voucher
          </h3>
          <div className="space-y-3 px-6 pb-3">
            <div className="bg-[#F3F2D9] p-3 rounded">
              <p className="text-black">
                <span className="font-bold">Bước 1:</span> Bấm{' '}
                <span className="font-bold">&quot;Nhận mã voucher&quot;.</span>
              </p>
            </div>
            <div className="bg-[#F3F2D9]   p-3 rounded">
              <p className="text-black">
                <span className="font-bold">Bước 2:</span> Lưu mã voucher để sử
                dụng mua hàng trong thời gian quy định.
              </p>
            </div>
            <div className="bg-[#F3F2D9]   p-3 rounded">
              <p className="text-black">
                <span className="font-bold">Bước 3:</span> Sử dụng Voucher trực
                tiếp tại cửa hàng hoặc website{' '}
                <span className="underline">Coolmate.me</span>
              </p>
            </div>
          </div>
        </div>
        {/* Closing Message */}
        <p className="text-base text-black mb-8">
          Cảm ơn anh đã đồng hành cùng PITO Cloud Canteen. Chúc anh{' '}
          <span className="font-semibold">{userName || '[Tên nhân viên]'}</span>{' '}
          một ngày 19/11 thật trọn vẹn và ý nghĩa.
        </p>
        {/* Footer */}
        <div className="text-right text-sm text-black">
          From
          <PitoLogo className="inline-block align-middle mx-1 !h-4 !w-auto" />
          with ❤️
        </div>
      </div>
    </div>
  );
};

export default EventPage;
