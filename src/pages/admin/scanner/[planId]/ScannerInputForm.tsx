'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  PiCallBell,
  PiMagnifyingGlass,
  PiMagnifyingGlassLight,
} from 'react-icons/pi';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

import { scanApi } from '@apis/scanner';
import { isJoinedPlan } from '@helpers/order/orderPickingHelper';
import { useAppDispatch, useAppSelector } from '@hooks/reduxHooks';
import { generateScannerBarCode } from '@pages/api/admin/scanner/[planId]/toggle-mode.api';
import {
  getErrorStringFromErrorObject,
  ScannerThunks,
} from '@redux/slices/scanner.slice';
import { formatTimestamp } from '@src/utils/dates';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';
import type { TObject, TUser } from '@src/utils/types';

import { LoadingWrapper } from './LoadingWrapper';

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
  const [barcode, setBarcode] = useState('');
  const [searchInput, setSearchInput] = useState(searchValue);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [searchResults, setSearchResults] = useState<IParticipant[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const hasLoadedRef = useRef(false);

  const { timestamp: timestampQuery, planId } = router.query;

  const getTimestampAndGroupId = (
    queryParam: string | string[] | undefined,
  ) => {
    if (typeof queryParam !== 'string')
      return { timestamp: undefined, groupId: undefined };

    const parts = queryParam.split('_');
    if (parts.length === 2) {
      const [timestamp, groupId] = parts;

      return { timestamp, groupId };
    }

    return { timestamp: queryParam, groupId: undefined };
  };

  const { timestamp, groupId } = getTimestampAndGroupId(timestampQuery);

  const {
    planListing,
    participantData,
    anonymousParticipantData,
    companyData: company,
    fetchOrderInProgress,
  } = useAppSelector((state) => state.scanner);

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

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node) &&
        !iconRef.current?.contains(event.target as Node) // Thêm điều kiện cho icon
      ) {
        setShowPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tách logic submit thành hàm riêng để có thể gọi từ nhiều nơi
  const performSubmit = async (barcodeValue: string) => {
    if (!barcodeValue) return;

    try {
      setLoading(true);
      await scanApi({
        planId: planId as string,
        timestamp: timestamp as string,
        barcode: barcodeValue,
        groupId: groupId as string,
      });
      setBarcode('');
      setShowPopup(false);
      toast.success('Xác nhận mã code thành công!', {
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

  const handleInputFocus = () => {
    setShowPopup(true);
  };

  // Thêm handler riêng cho icon click
  const handleIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPopup(!showPopup);

    // Nếu đang mở popup, focus vào input
    if (!showPopup) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleParticipantSelect = async (participant: IParticipant) => {
    setBarcode(participant.barcode);
    setShowPopup(false);

    // Gọi trực tiếp API với barcode của participant được chọn
    await performSubmit(participant.barcode);
  };

  useEffect(() => {
    if (orderId && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      dispatch(ScannerThunks.loadData({ orderId }));
    }
  }, [orderId, dispatch]);

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

  const handleSubmitInput = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();

    const trimmedInput = searchInput.trim();

    if (!trimmedInput) {
      resetSearchInput();

      return;
    }

    handleSearchInputChange(trimmedInput);
  };

  useEffect(() => {
    if (searchValue) {
      setSearchInput(searchValue);
    } else {
      setSearchInput('');
    }
  }, [searchValue]);

  return (
    <div className=" bg-white w-full py-10 shadow-sm border-b sticky top-0 z-10">
      <div className="grid grid-cols-7 gap-10 container mx-auto">
        <div className="w-full col-span-4 mx-auto relative">
          <div className="text-center flex flex-col gap-8 mb-6">
            <h1 className="text-5xl font-medium text-gray-900">
              Danh sách món ăn{' '}
              <span className="text-blue-700 font-bold">{group?.name}</span>
            </h1>
            <form
              className="flex items-center gap-4 rounded-lg"
              onAbort={handleSubmitInput}>
              <div className="relative flex-1">
                {/* Icon Search */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <PiMagnifyingGlass size={32} />
                </div>

                {/* Input Field */}
                <input
                  type="text"
                  value={searchInput}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // Ngăn reload page
                      handleSubmitInput(); // Gọi hàm xử lý tìm kiếm
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchInput(value);
                  }}
                  placeholder="Nhập tên người tham gia..."
                  className="w-full p-6 pl-14 border-gray-600 rounded-lg text-2xl border-2 border-solid outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
              </div>
            </form>
          </div>
        </div>
        <div className="w-full col-span-3 mx-auto relative">
          <div className="text-center flex flex-col justify-center items-end gap-8">
            <h1 className="text-[40px] font-medium text-gray-500">
              {formatTimestamp(+timestamp!)}
            </h1>
            <div
              className="flex flex-row items-center justify-center gap-4 cursor-pointer bg-black w-fit px-6 py-4 rounded-md"
              onClick={handleIconClick}>
              {loading ? (
                <div
                  className={`animate-spin rounded-full border-b-2 border-white`}
                  style={{ width: 30, height: 30 }}
                />
              ) : (
                <div ref={iconRef} className="cursor-pointer">
                  <PiCallBell className="text-white" size={30} />
                </div>
              )}
              <p className="text-2xl text-white uppercase">lấy món</p>
            </div>
          </div>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              showPopup
                ? 'max-h-fit opacity-100 mt-4'
                : 'max-h-0 opacity-0 mb-0'
            }`}>
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-4 rounded-lg">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onFocus={handleInputFocus}
                  placeholder="Nhập tên người tham gia..."
                  className="w-full p-6 border-gray-600 rounded-lg text-2xl border-2 border-solid outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
              </div>
            </form>

            {showPopup && (
              <div
                ref={popupRef}
                className="absolute top-full w-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                <LoadingWrapper isLoading={fetchOrderInProgress}>
                  {searchResults.length > 0 ? (
                    <div className="py-2">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                        {searchResults.length} kết quả tìm kiếm
                      </div>
                      {searchResults.map((participant) => (
                        <div
                          key={participant.email}
                          onClick={async () =>
                            handleParticipantSelect(participant)
                          }
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
                  ) : (
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
                  )}
                </LoadingWrapper>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
