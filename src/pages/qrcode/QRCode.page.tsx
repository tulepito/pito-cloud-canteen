'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  PiCheckCircleFill,
  PiWarningCircleFill,
  PiXCircleFill,
} from 'react-icons/pi';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import { scanQRCodeForParticipantApi } from '@apis/scanner';
import { Button } from '@components/ui/button';
import { isUserAParticipant } from '@helpers/user';
import { useAppSelector } from '@hooks/reduxHooks';
import { adminPaths, companyPaths, participantPaths } from '@src/paths';
import { User } from '@src/utils/data';

import ScanQRCode from './assets/scan-qrcode.gif';

const QRCodePage = () => {
  const intl = useIntl();
  const router = useRouter();
  const searchParams = useSearchParams();

  const groupId = searchParams.get('groupId') || undefined;

  const currentUser = useAppSelector((state) => state.user.currentUser);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAlreadyScanned, setIsAlreadyScanned] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasCalledRef = useRef(false);

  const currentUserId = currentUser ? User(currentUser).getId() : null;
  const isAdmin = !!currentUser?.attributes?.profile?.metadata?.isAdmin;
  const isParticipant = currentUser ? isUserAParticipant(currentUser) : false;

  const now = new Date();
  const timestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    .getTime()
    .toString();

  console.log(timestamp);

  useEffect(() => {
    // Chỉ gọi API 1 lần khi đã có currentUserId và không phải admin
    if (
      !currentUserId ||
      typeof isAdmin !== 'boolean' ||
      isAdmin ||
      hasCalledRef.current
    ) {
      if (isAdmin) {
        toast.error('Bạn không truy cập được tính năng này');
        router.replace(adminPaths.Dashboard);
      }

      return;
    }

    hasCalledRef.current = true;

    const fetchData = async () => {
      try {
        await scanQRCodeForParticipantApi({
          groupId,
          currentUserId,
          timestamp,
        });
        setIsSuccess(true);
      } catch (error: any) {
        if (
          error?.response?.status === 409 &&
          error?.response?.data?.isAlreadyScanned
        ) {
          setIsAlreadyScanned(true);
        } else {
          setErrorMessage(
            error?.response?.data?.message || 'Có lỗi xảy ra khi quét mã QR',
          );
        }
      }
    };

    fetchData();
  }, [currentUserId, groupId, isAdmin, router, timestamp]);

  useEffect(() => {
    if (isSuccess || isAlreadyScanned || errorMessage) {
      const timer = setTimeout(() => {
        router.push(
          isParticipant ? participantPaths.OrderList : companyPaths.Home,
        );
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, isAlreadyScanned, errorMessage, isParticipant, router]);

  if (!currentUserId || typeof isAdmin !== 'boolean') return null;

  const getIcon = () => {
    if (isSuccess) {
      return <PiCheckCircleFill className="text-green-500" size={100} />;
    }
    if (isAlreadyScanned) {
      return <PiWarningCircleFill className="text-orange-500" size={100} />;
    }
    if (errorMessage) {
      return <PiXCircleFill className="text-red-500" size={100} />;
    }

    return (
      <Image
        src={ScanQRCode}
        alt="scan-qr-code"
        className="object-cover"
        priority
        loading="eager"
        width={150}
        height={143}
      />
    );
  };

  const getMessage = () => {
    if (isSuccess) {
      return intl.formatMessage({ id: 'quet-ma-thanh-cong' });
    }
    if (isAlreadyScanned) {
      return intl.formatMessage({ id: 'ban-da-quet-ma-nay-roi' });
    }
    if (errorMessage) {
      return errorMessage;
    }

    return `${intl.formatMessage({ id: 'he-thong-dang-xu-ly' })}...`;
  };

  const showButton = isSuccess || isAlreadyScanned || errorMessage;
  const showProcessingText = !isSuccess && !isAlreadyScanned && !errorMessage;

  return (
    <div className="w-full h-screen flex flex-col gap-4 items-center justify-center">
      {getIcon()}

      <div className="text-center mt-4">
        <h1 className="text-lg font-bold">{getMessage()}</h1>

        {showButton && (
          <Button
            onClick={() =>
              router.push(
                isParticipant ? participantPaths.OrderList : companyPaths.Home,
              )
            }
            className="text-sm mt-4">
            {intl.formatMessage({ id: 'quay-lai-trang-chu' })}
          </Button>
        )}

        {showProcessingText && (
          <p className="text-gray-600 text-sm mt-2">
            {intl.formatMessage({ id: 'vui-long-doi-trong-giay-lat' })}
          </p>
        )}
      </div>
    </div>
  );
};

export default QRCodePage;
