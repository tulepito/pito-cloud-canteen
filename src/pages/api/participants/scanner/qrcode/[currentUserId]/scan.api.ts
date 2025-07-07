import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import type { FirebaseScannedRecord } from '@pages/admin/order/FirebaseScannedRecord';
import {
  detachScannerBarCodeUniqueKey,
  generateBarcodeHashMap,
  generateScannerBarCode,
} from '@pages/api/admin/scanner/[planId]/toggle-mode.api';
import type { POSTScannerParticipantScanQRcodeBody } from '@pages/qrcode/POSTScannerPlanIdTimestampScanORCodeBody';
import { denormalisedResponseEntities } from '@services/data';
import { firestore } from '@services/firebase';
import { getIntegrationSdk } from '@services/sdk';
import type { FoodListing, MemberOrderValue, UserListing } from '@src/types';
import { EImageVariants, EOrderStates } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

// ==================== CONSTANTS ====================
const ERROR_MESSAGES = {
  INVALID_USER_ID: 'ID người dùng không đúng. Vui lòng kiểm tra lại.',
  PLAN_NOT_FOUND: 'Chưa có kế hoạch ăn uống được tạo cho bạn.',
  ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng nào.',
  ACTIVE_ORDER_NOT_FOUND: 'Hiện bạn chưa có đơn hàng đang hoạt động.',
  BARCODE_MAP_NOT_FOUND: 'Mã QR này không hợp lệ. Vui lòng thử lại.',
  BARCODE_NOT_FOUND: 'Mã QR hôm nay không hợp lệ hoặc đã hết hạn.',
  INVALID_DATE: 'Ngày bạn chọn không hợp lệ. Vui lòng thử lại.',
  MEMBER_NOT_FOUND: 'Chúng tôi không tìm thấy thông tin của bạn.',
  NO_FOOD_SELECTED: 'Bạn chưa chọn món ăn. Vui lòng chọn trước khi quét mã.',
  MEMBER_DATA_NOT_LOADED:
    'Đang gặp sự cố khi tải thông tin của bạn. Vui lòng thử lại.',
  NOT_IN_GROUP: 'Bạn không thuộc nhóm được chỉ định.',
  ALREADY_SCANNED: 'Bạn đã nhận phần ăn hôm nay. Hẹn gặp lại vào ngày mai!',
  INTERNAL_ERROR: 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.',
  METHOD_NOT_ALLOWED: 'Thao tác này không được hỗ trợ.',
  COMPANY_NOT_FOUND: 'Không tìm thấy thông tin công ty.',
  FIREBASE_ERROR: 'Có lỗi xảy ra khi kết nối dữ liệu. Vui lòng thử lại.',
  SDK_ERROR: 'Đang gặp trục trặc khi kết nối dịch vụ. Vui lòng đợi giây lát.',
  GROUP_NOT_FOUND: 'Không tìm thấy nhóm phù hợp.',
  USER_NOT_IN_REQUESTED_GROUP: 'Bạn không nằm trong nhóm được yêu cầu.',
} as const;

const ERROR_STATUS_MAP: Record<string, number> = {
  [ERROR_MESSAGES.INVALID_USER_ID]: 400,
  [ERROR_MESSAGES.INVALID_DATE]: 400,
  [ERROR_MESSAGES.NO_FOOD_SELECTED]: 400,
  [ERROR_MESSAGES.NOT_IN_GROUP]: 403,
  [ERROR_MESSAGES.USER_NOT_IN_REQUESTED_GROUP]: 403,
  [ERROR_MESSAGES.METHOD_NOT_ALLOWED]: 405,
  [ERROR_MESSAGES.ALREADY_SCANNED]: 409,
  [ERROR_MESSAGES.PLAN_NOT_FOUND]: 404,
  [ERROR_MESSAGES.ORDER_NOT_FOUND]: 404,
  [ERROR_MESSAGES.ACTIVE_ORDER_NOT_FOUND]: 404,
  [ERROR_MESSAGES.BARCODE_MAP_NOT_FOUND]: 404,
  [ERROR_MESSAGES.BARCODE_NOT_FOUND]: 404,
  [ERROR_MESSAGES.MEMBER_NOT_FOUND]: 404,
  [ERROR_MESSAGES.MEMBER_DATA_NOT_LOADED]: 500,
  [ERROR_MESSAGES.COMPANY_NOT_FOUND]: 404,
  [ERROR_MESSAGES.GROUP_NOT_FOUND]: 404,
  [ERROR_MESSAGES.INTERNAL_ERROR]: 500,
  [ERROR_MESSAGES.FIREBASE_ERROR]: 500,
  [ERROR_MESSAGES.SDK_ERROR]: 500,
};

// ==================== TYPES ====================
interface ValidatedRequestData {
  currentUserId: string;
  timestamp: string;
  groupId?: string;
}

interface ProcessedScanData {
  planId: string;
  barcode: string;
  memberOrder: Partial<MemberOrderValue>;
  foodListing: FoodListing;
  memberListing: UserListing;
  groupId?: string;
}

// ==================== CUSTOM ERROR CLASS ====================
class APIError extends Error {
  statusCode: number;

  data?: any;

  constructor(message: string, statusCode?: number, data?: any) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode || ERROR_STATUS_MAP[message] || 500;
    this.data = data;
  }
}

// ==================== UTILITY FUNCTIONS ====================
const buildFullName = (
  firstName?: string,
  lastName?: string,
  displayName?: string,
): string => {
  if (!firstName || !lastName) return firstName || lastName || '';
  if (firstName === lastName) return firstName;

  const fullName = `${lastName} ${firstName}`;

  return displayName && displayName.length > fullName.length
    ? displayName
    : fullName;
};

const logScanResult = (
  memberId: string,
  timestamp: string,
  planId: string,
  barcode: string,
  foodTitle: string,
  isSuccess: boolean = true,
): void => {
  const status = isSuccess ? 'successfully scanned' : 'already scanned';
  console.log(
    `LOG ~ QR Code ${status} for user ${memberId} planId ${planId} timestamp: ${timestamp} barcode: ${barcode}${
      isSuccess ? ` food: ${foodTitle}` : ''
    }`,
  );
};

// ==================== OPTIMIZED VALIDATION ====================
const validateAndProcess = async (
  req: NextApiRequest,
): Promise<{
  validatedData: ValidatedRequestData;
  processedData: ProcessedScanData;
}> => {
  // Early validation
  if (req.method !== HttpMethod.POST) {
    throw new APIError(ERROR_MESSAGES.METHOD_NOT_ALLOWED);
  }

  const { currentUserId } = req.query as { currentUserId: string };
  const { groupId: requestedGroupId, timestamp } =
    req.body as POSTScannerParticipantScanQRcodeBody;

  const timestampNum = +timestamp;
  if (!currentUserId || typeof currentUserId !== 'string') {
    throw new APIError(ERROR_MESSAGES.INVALID_USER_ID);
  }

  const integrationSdk = await getIntegrationSdk();

  try {
    // Step 1: Find active order - this is the most critical path
    const orderParticipantsRes = await integrationSdk.listings.query({
      meta_listingType: 'order',
      meta_participants: `has_any:${currentUserId}`,
      meta_orderState: EOrderStates.inProgress,
    });

    const orderParticipants =
      denormalisedResponseEntities(orderParticipantsRes);
    const activeOrder = orderParticipants.find((order: TObject) => {
      const { startDate, endDate } = order?.attributes?.metadata || {};

      return startDate <= timestampNum && timestampNum <= endDate;
    });

    if (!activeOrder?.attributes?.metadata?.plans?.[0]) {
      throw new APIError(ERROR_MESSAGES.ACTIVE_ORDER_NOT_FOUND);
    }

    const orderId = activeOrder.id;
    const planId = activeOrder.attributes.metadata.plans[0];
    const barcode = generateScannerBarCode(planId, currentUserId, timestamp);

    // Step 2: Early Firebase check - fail fast if already scanned
    const scannedRecordRef = collection(
      firestore,
      process.env.NEXT_PUBLIC_FIREBASE_SCANNED_RECORDS_COLLECTION_NAME!,
    );
    const q = query(scannedRecordRef, where('barcode', '==', barcode));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const existingData = querySnapshot.docs[0].data();
      throw new APIError(ERROR_MESSAGES.ALREADY_SCANNED, 409, {
        isAlreadyScanned: true,
        data: existingData,
      });
    }

    // Step 3: Parallel fetch of plan and order data
    const [planListingResponse, orderDetailListing] = await Promise.all([
      integrationSdk.listings.show({ id: planId }),
      integrationSdk.listings.show({ id: orderId }),
    ]);

    const planListing = planListingResponse.data.data;
    if (!planListing) {
      throw new APIError(ERROR_MESSAGES.PLAN_NOT_FOUND);
    }

    const orderDetail = planListing.attributes?.metadata?.orderDetail;
    if (!orderDetail) {
      throw new APIError(ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    // Step 4: Validate barcode
    const barcodeHashMap = planListing.attributes?.metadata?.barcodeHashMap;
    if (!barcodeHashMap) {
      throw new APIError(ERROR_MESSAGES.BARCODE_MAP_NOT_FOUND);
    }

    let barcodeHashDigest = barcodeHashMap[barcode];

    // Regenerate if needed (optimization: only when necessary)
    if (!barcodeHashDigest) {
      const barcodeHashMapLength = Object.keys(barcodeHashMap).length;
      const totalMemberOrders = Object.values(orderDetail).reduce(
        (acc: number, curr: any) =>
          acc + Object.keys(curr?.memberOrders || {}).length,
        0,
      );

      if (barcodeHashMapLength >= totalMemberOrders) {
        throw new APIError(ERROR_MESSAGES.BARCODE_NOT_FOUND, 404, {
          planId,
          currentUserId,
          timestamp,
          barcode,
        });
      }

      const refilledBarcodeHashMap = generateBarcodeHashMap(
        planId,
        orderDetail,
      );
      await integrationSdk.listings.update({
        id: planId,
        metadata: { barcodeHashMap: refilledBarcodeHashMap },
      });

      barcodeHashDigest = refilledBarcodeHashMap[barcode];
      if (!barcodeHashDigest) {
        throw new APIError(ERROR_MESSAGES.BARCODE_NOT_FOUND, 404, {
          planId,
          currentUserId,
          timestamp,
          barcode,
        });
      }
    }

    const { memberId, date } = detachScannerBarCodeUniqueKey(barcodeHashDigest);
    if (date !== timestamp) {
      throw new APIError(ERROR_MESSAGES.INVALID_DATE);
    }

    // Step 5: Get member order and validate
    const memberOrder = orderDetail[date]?.memberOrders?.[memberId];
    if (!memberOrder?.foodId) {
      throw new APIError(ERROR_MESSAGES.NO_FOOD_SELECTED);
    }

    // Step 6: Group validation (only if needed)
    let groupId: string | undefined;
    if (requestedGroupId) {
      const orderDetailData =
        denormalisedResponseEntities(orderDetailListing)[0];
      const companyId = orderDetailData.attributes?.metadata?.companyId;

      if (!companyId) {
        throw new APIError(ERROR_MESSAGES.COMPANY_NOT_FOUND);
      }

      const companyAccountResponse = await integrationSdk.users.show({
        id: companyId,
      });
      const companyAccount = denormalisedResponseEntities(
        companyAccountResponse,
      )[0];

      const groups = companyAccount?.attributes?.profile?.metadata?.groups;
      const requestedGroup = groups?.find(
        (group: TObject) => group.id === requestedGroupId,
      );

      if (
        !requestedGroup?.members?.some(
          (member: TObject) => member.id === currentUserId,
        )
      ) {
        throw new APIError(ERROR_MESSAGES.USER_NOT_IN_REQUESTED_GROUP);
      }

      groupId = requestedGroupId;
    }

    // Step 7: Parallel fetch of food and member data
    const [foodListingResponse, memberListingResponse] = await Promise.all([
      integrationSdk.listings.show({
        id: memberOrder.foodId,
        include: ['images'],
        'fields.image': [`variants.${EImageVariants.squareSmall}`],
      }),
      integrationSdk.users.show({
        id: memberId,
        include: ['profileImage'],
        'fields.image': [`variants.${EImageVariants.squareSmall}`],
      }),
    ]);

    const foodListing = denormalisedResponseEntities(foodListingResponse)[0];
    const memberListing = denormalisedResponseEntities(
      memberListingResponse,
    )[0];

    if (!foodListing || !memberListing?.attributes?.profile) {
      throw new APIError(ERROR_MESSAGES.MEMBER_DATA_NOT_LOADED);
    }

    return {
      validatedData: { currentUserId, timestamp, groupId: requestedGroupId },
      processedData: {
        planId,
        barcode,
        memberOrder,
        foodListing,
        memberListing,
        groupId,
      },
    };
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(ERROR_MESSAGES.SDK_ERROR);
  }
};

// ==================== OPTIMIZED RECORD CREATION ====================
const createOptimizedScannedRecord = async (
  data: ProcessedScanData,
  timestamp: string,
): Promise<Omit<FirebaseScannedRecord, 'id'>> => {
  const { planId, barcode, memberListing, foodListing, groupId } = data;

  const record = {
    planId,
    timestamp: +timestamp,
    barcode,
    memberProfileImageUrl:
      memberListing.profileImage?.attributes?.variants?.['square-small']?.url ||
      '',
    memberAbbrName: memberListing.attributes?.profile?.abbreviatedName || '',
    memberName: buildFullName(
      memberListing?.attributes?.profile?.firstName,
      memberListing?.attributes?.profile?.lastName,
      memberListing?.attributes?.profile?.displayName,
    ),
    foodName: foodListing.attributes?.title!,
    foodThumbnailUrl:
      foodListing.images?.[0]?.attributes?.variants?.['square-small']?.url ||
      '',
    state: 'live',
    scannedAt: Date.now(), // More efficient than new Date().valueOf()
    ...(groupId && { groupId }),
  } satisfies Omit<FirebaseScannedRecord, 'id'>;

  try {
    const scannedRecordRef = collection(
      firestore,
      process.env.NEXT_PUBLIC_FIREBASE_SCANNED_RECORDS_COLLECTION_NAME!,
    );
    await addDoc(scannedRecordRef, record);

    return record;
  } catch (error) {
    throw new APIError(ERROR_MESSAGES.FIREBASE_ERROR);
  }
};

// ==================== MAIN HANDLER ====================
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // Single optimized validation and processing step
    const { validatedData, processedData } = await validateAndProcess(req);

    // Create record
    const record = await createOptimizedScannedRecord(
      processedData,
      validatedData.timestamp,
    );

    // Optimized logging
    logScanResult(
      validatedData.currentUserId,
      validatedData.timestamp,
      processedData.planId,
      processedData.barcode,
      processedData.foodListing.attributes?.title!,
      true,
    );

    return res.status(200).json(record);
  } catch (error: any) {
    if (error instanceof APIError) {
      if (error.statusCode === 409) {
        logScanResult('', '', '', '', '', false);

        return res.status(409).json({
          message: error.message,
          ...error.data,
        });
      }

      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error('Unexpected error in scanner API:', error);

    return res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
}
