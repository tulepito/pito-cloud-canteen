'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  PiCallBell,
  PiCaretDown,
  PiCheckCircle,
  PiClock,
  PiMagnifyingGlass,
  PiMagnifyingGlassLight,
  PiPackage,
} from 'react-icons/pi';
import { toast } from 'react-toastify';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import QRCode from 'qrcode';

import { scanApi } from '@apis/scanner';
import { isJoinedPlan } from '@helpers/order/orderPickingHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import type { FirebaseScannedRecord } from '@pages/admin/order/FirebaseScannedRecord';
import { generateScannerBarCode } from '@pages/api/admin/scanner/[planId]/toggle-mode.api';
import {
  getErrorStringFromErrorObject,
  ScannerThunks,
} from '@redux/slices/scanner.slice';
import { firestore } from '@services/firebase';
import { formatTimestamp } from '@src/utils/dates';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';
import type { TObject, TUser } from '@src/utils/types';

import { LoadingWrapper } from './LoadingWrapper';

// Utility functions
const prepareDataGroups = ({
  orderDetailPerDate = {},
  participantDataMap = {},
  planId,
  group,
  timestamp,
}: {
  orderDetailPerDate: TObject;
  participantDataMap: Record<string, { name: string; email: string }>;
  planId: string;
  group: { id: string; members?: { id: string }[] };
  timestamp: string;
}): { name: string; email: string; barcode: string }[] => {
  const { memberOrders = {} } = orderDetailPerDate;
  const memberIds = group?.members?.map((m) => m.id) ?? [];

  return memberIds.reduce((results, memberId) => {
    const memberOrder = memberOrders[memberId];
    const participant = participantDataMap[memberId];

    if (
      memberOrder &&
      participant &&
      isJoinedPlan(memberOrder.foodId, memberOrder.status)
    ) {
      results.push({
        name: participant.name,
        email: participant.email,
        barcode: generateScannerBarCode(planId, memberId, timestamp),
      });
    }

    return results;
  }, [] as { name: string; email: string; barcode: string }[]);
};

export function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

const getTimestampAndGroupId = (queryParam: string | string[] | undefined) => {
  if (typeof queryParam !== 'string')
    return { timestamp: undefined, groupId: undefined };

  const parts = queryParam.split('_');
  if (parts.length === 2) {
    const [timestamp, groupId] = parts;

    return { timestamp, groupId };
  }

  return { timestamp: queryParam, groupId: undefined };
};

// Types
interface IParticipant {
  name: string;
  barcode: string;
  email: string;
}

interface ScannerInputFormProps {
  searchValue?: string;
  handleSearchInputChange: (value: string) => void;
  resetSearchInput: () => void;
}

export function ScannerInputForm({
  searchValue = '',
  handleSearchInputChange,
  resetSearchInput,
}: ScannerInputFormProps) {
  // States
  const [barcode, setBarcode] = useState('');
  const [searchInput, setSearchInput] = useState(searchValue);
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [searchResults, setSearchResults] = useState<IParticipant[]>([]);
  const [totalBarcodes, setTotalBarcodes] = useState<FirebaseScannedRecord[]>(
    [],
  );

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);

  // Router and Redux
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { timestamp: timestampQuery, planId } = router.query;
  const screen = searchParams.get('screen') || undefined;
  const { timestamp, groupId } = getTimestampAndGroupId(timestampQuery);

  const {
    planListing,
    participantData,
    anonymousParticipantData,
    companyData: company,
    fetchOrderInProgress,
  } = useAppSelector((state) => state.scanner);

  console.log({
    participantData,
  });

  // Memoized values
  const { orderId } = planListing?.attributes?.metadata || {};
  const orderDetail = useMemo(
    () => planListing?.attributes?.metadata?.orderDetail || {},
    [planListing],
  );

  const groups = useMemo(
    () => company?.attributes?.profile?.metadata?.groups || [],
    [company],
  );

  const group = useMemo(() => {
    return groups.find((g: TObject) => g.id === groupId) || {};
  }, [groups, groupId]);

  const participantDataList = useMemo(() => {
    const mapUserToParticipant = (p: TUser) => ({
      id: p.id.uuid,
      name: buildFullName(
        p.attributes?.profile?.firstName,
        p.attributes?.profile?.lastName,
        {
          compareToGetLongerWith: p.attributes?.profile?.displayName,
        },
      ),
      email: p.attributes?.email,
    });

    return [...participantData, ...anonymousParticipantData].map(
      mapUserToParticipant,
    );
  }, [participantData, anonymousParticipantData]);

  const participantDataMap = useMemo(
    () =>
      participantDataList.reduce((res: TObject, curr: TObject) => {
        return { ...res, [curr.id]: curr };
      }, {}),
    [participantDataList],
  );

  const preparedGroupsData = useMemo(() => {
    if (
      !orderDetail ||
      !participantDataMap ||
      !planId ||
      !group ||
      !timestamp
    ) {
      return [];
    }

    return prepareDataGroups({
      orderDetailPerDate: orderDetail[timestamp] || {},
      participantDataMap,
      planId: planId as string,
      group,
      timestamp,
    });
  }, [orderDetail, participantDataMap, planId, group, timestamp]);

  // Event handlers
  const performSubmit = async (barcodeValue: string) => {
    if (!barcodeValue) return;

    try {
      setLoading(true);
      await scanApi({
        planId: planId as string,
        timestamp: timestamp as string,
        barcode: barcodeValue,
        groupId: groupId as string,
        screen,
      });
      setBarcode('');
      setShowPopup(false);
      toast.success('Lấy món thành công!', {
        position: 'top-right',
      });
    } catch (error) {
      toast.error(getErrorStringFromErrorObject(error), {
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    await performSubmit(barcode);
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPopup(!showPopup);

    if (!showPopup) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleParticipantSelect = async (participant: IParticipant) => {
    setBarcode(participant.barcode);
    setShowPopup(false);
    await performSubmit(participant.barcode);
  };

  const handleSubmitInput = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();

    const trimmedInput = searchInput.trim();
    if (!trimmedInput) {
      resetSearchInput();

      return;
    }

    handleSearchInputChange(trimmedInput);
  };

  // Handler for search input change with empty check
  const handleSearchInputChangeInternal = (value: string) => {
    setSearchInput(value);

    // If input becomes empty, trigger the submit action immediately
    if (value.trim() === '') {
      resetSearchInput();
    } else {
      // Only update parent state if not empty to avoid unnecessary re-renders
      handleSearchInputChange(value);
    }
  };

  // Statistics calculations

  const offlinePortions = useMemo(() => {
    if (!Array.isArray(totalBarcodes)) return 0;
    const count = totalBarcodes.filter(
      (barcodeItem) => barcodeItem.state === 'offline',
    ).length;

    return Math.max(0, count);
  }, [totalBarcodes]);

  const totalPortions = useMemo(() => {
    const count = preparedGroupsData?.length ?? 0;

    return Math.max(0, count);
  }, [preparedGroupsData]);

  const livePortions = useMemo(() => {
    const remaining = totalPortions - offlinePortions;

    return Math.max(0, remaining);
  }, [offlinePortions, totalPortions]);

  // Effects
  useEffect(() => {
    if (orderId && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      dispatch(ScannerThunks.loadData({ orderId }));
    }
  }, [orderId, dispatch]);

  useEffect(() => {
    if (searchValue) {
      setSearchInput(searchValue);
    } else {
      setSearchInput('');
    }
  }, [searchValue]);

  // Firebase listener for total barcodes
  useEffect(() => {
    if (!router.query.planId || !timestamp) return;

    const scannerRecordsRef = collection(
      firestore,
      process.env.NEXT_PUBLIC_FIREBASE_SCANNED_RECORDS_COLLECTION_NAME!,
    );

    const conditions = [
      where('planId', '==', router.query.planId),
      where('timestamp', '==', +timestamp),
    ];

    if (groupId) {
      conditions.push(where('groupId', '==', groupId));
    }

    const q = query(scannerRecordsRef, ...conditions);

    const unsubscribe = onSnapshot(q, {
      next: (snapshot) => {
        const allRecords = snapshot.docs.map((_doc) => ({
          id: _doc.id,
          ...(_doc.data() as Omit<FirebaseScannedRecord, 'id'>),
        }));

        const sortedRecords = allRecords.sort(
          (a, b) => +a.scannedAt - +b.scannedAt,
        );

        setTotalBarcodes(sortedRecords);
      },
      error: (error) => {
        console.error('Firestore error for total records:', error);
      },
    });

    return () => unsubscribe();
  }, [router.query.planId, timestamp, groupId, screen]);

  // QR Code generation
  useEffect(() => {
    const generateQR = async () => {
      try {
        const dataUrl = `${process.env.NEXT_PUBLIC_CANONICAL_URL}/qrcode`;
        const queryParams = new URLSearchParams();

        if (groupId) queryParams.append('groupId', groupId);
        if (screen) queryParams.append('screen', screen);

        const dataToEncode = queryParams.toString()
          ? `${dataUrl}?${queryParams.toString()}`
          : dataUrl;

        const url = await QRCode.toDataURL(dataToEncode);
        setQrUrl(url);
      } catch (err) {
        console.error(err);
      }
    };

    generateQR();
  }, [groupId, screen]);

  // Filter search results
  useEffect(() => {
    const searchTerm = removeVietnameseTones(barcode.trim().toLowerCase());

    const transformedData: IParticipant[] = preparedGroupsData.map(
      ({ name, email, barcode: barcodeValue }) => ({
        name,
        email,
        barcode: barcodeValue,
      }),
    );

    if (searchTerm) {
      const filtered = transformedData.filter(
        ({ name, email }) =>
          removeVietnameseTones(name.toLowerCase()).includes(searchTerm) ||
          removeVietnameseTones(email.toLowerCase()).includes(searchTerm),
      );

      setSearchResults(filtered);
    } else {
      setSearchResults(transformedData);
    }
  }, [barcode, preparedGroupsData]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-start justify-between gap-40 bg-white py-5 md:py-10 px-4 md:px-8 shadow-sm border-b sticky top-0 z-10">
      <div className="flex-1 w-full h-full flex flex-col justify-between gap-4 md:gap-16">
        <div className="flex flex-col gap-2 w-full">
          <h1 className="hidden md:block text-2xl md:text-4xl font-bold text-gray-900">
            Danh sách món ăn{' '}
            <span className="text-blue-600">{group?.name}</span>
          </h1>

          <h1 className="block md:hidden text-2xl md:text-4xl font-bold text-gray-900">
            <span className="text-blue-600">{group?.name}</span>
            <span className="text-gray-600">
              {formatTimestamp(+timestamp!)}
            </span>
          </h1>
          <p className="hidden md:block text-lg md:text-2xl text-gray-500">
            {formatTimestamp(+timestamp!)}
          </p>
        </div>

        <div className="flex flex-row items-center justify-between md:justify-start gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <PiPackage className="size-5 md:w-6 md:h-6 text-blue-600" />
            <span className="text-lg md:text-2xl text-gray-600">Tổng:</span>
            <span className="font-semibold text-lg md:text-2xl text-blue-600">
              {totalPortions}
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:gap-6 items-center justify-start md:justify-center">
            <div className="flex items-center gap-2">
              <PiCheckCircle className="size-5 md:w-6 md:h-6 text-green-600" />
              <span className="text-lg md:text-2xl text-gray-600">
                Đã phát:
              </span>
              <span className="font-semibold text-lg md:text-2xl text-green-600">
                {offlinePortions}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <PiClock className="size-5 md:w-6 md:h-6 text-orange-600" />
              <span className="text-lg md:text-2xl text-gray-600">
                Còn lại:
              </span>
              <span className="font-semibold text-lg md:text-2xl text-orange-600">
                {livePortions}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center w-full">
          <form
            className="flex items-center gap-4 rounded-lg w-full md:w-[40%]"
            onSubmit={handleSubmitInput}>
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                <PiMagnifyingGlass className="size-6 md:size-8" />
              </div>

              <input
                type="text"
                value={searchInput}
                onChange={(e) =>
                  handleSearchInputChangeInternal(e.target.value)
                }
                placeholder="Nhập tên người tham gia..."
                className="w-full p-4 pl-12 md:pl-14 border-gray-300 rounded-xl text-base md:text-2xl border-1 border-solid outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              />
            </div>
          </form>
          <div className="w-full md:w-fit relative" ref={dropdownRef}>
            <button
              onClick={handleIconClick}
              disabled={loading}
              className="flex flex-row items-center justify-center gap-2 md:gap-4 cursor-pointer bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed w-fit px-4 md:px-6 py-3 md:py-4 rounded-md transition-colors duration-200">
              {loading ? (
                <div className="animate-spin rounded-full border-b-2 border-white w-[30px] h-[30px]" />
              ) : (
                <PiCallBell className="size-6 md:size-[30px] text-white" />
              )}
              <p className="text-lg md:text-xl text-white uppercase">lấy món</p>
              <PiCaretDown
                className="text-white size-6 md:size-8"
                style={{
                  transform: showPopup ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                }}
              />
            </button>

            <div
              className={`absolute top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 transition-all duration-300 ease-in-out left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0
              ${
                showPopup
                  ? 'opacity-100 translate-y-0 visible'
                  : 'opacity-0 -translate-y-2 invisible'
              }`}>
              <div className="p-4 border-b border-gray-200">
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="Nhập tên người lấy món"
                      className="w-full p-3 text-base md:text-lg border-2 border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                  </div>
                </form>
              </div>

              <div className="max-h-80 overflow-y-auto">
                <LoadingWrapper isLoading={fetchOrderInProgress}>
                  {searchResults.length > 0 ? (
                    <div className="py-2">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                        {searchResults.length} kết quả tìm kiếm
                      </div>
                      {searchResults.map((participant) => (
                        <div
                          key={participant.email}
                          onClick={() => handleParticipantSelect(participant)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors duration-150">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">
                                {participant.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Email: {participant.email}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : barcode ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <PiMagnifyingGlassLight
                        size={32}
                        className="mx-auto mb-2 text-gray-300"
                      />
                      <div className="text-sm">Không tìm thấy kết quả nào</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Thử tìm kiếm với từ khóa khác
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <PiCallBell
                        size={32}
                        className="mx-auto mb-2 text-gray-300"
                      />
                      <div className="text-sm">Nhập tên để tìm kiếm</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Bắt đầu nhập để xem danh sách
                      </div>
                    </div>
                  )}
                </LoadingWrapper>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:flex flex-col items-center h-full">
        <p className="text-xs text-gray-600 mb-1">Mã QRCode</p>
        <div className="aspect-square h-full bg-white border border-gray-200 rounded flex items-center justify-center">
          <div className="relative w-full aspect-square">
            <Image
              src={qrUrl}
              alt="QRCode"
              fill
              className="aspect-square rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
