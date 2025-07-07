import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import type { FirebaseScannedRecord } from '@pages/admin/order/FirebaseScannedRecord';
import {
  detachScannerBarCodeUniqueKey,
  generateBarcodeHashMap,
} from '@pages/api/admin/scanner/[planId]/toggle-mode.api';
import type { POSTScannerPlanIdTimestampScanQRcodeBody } from '@pages/qrcode/POSTScannerPlanIdTimestampScanORCodeBody';
import { denormalisedResponseEntities } from '@services/data';
import { firestore } from '@services/firebase';
import { getIntegrationSdk } from '@services/sdk';
import type {
  FoodListing,
  MemberOrderValue,
  PlanListing,
  UserListing,
  WithFlexSDKData,
} from '@src/types';
import { buildFullName } from '@src/utils/emailTemplate/participantOrderPicking';
import { EImageVariants } from '@src/utils/enums';
import type { TObject } from '@src/utils/types';

// Error messages constants
const ERROR_MESSAGES = {
  INVALID_PLAN_ID: 'ID tuần ăn không hợp lệ',
  PLAN_NOT_FOUND: 'Không tìm thấy thông tin tuần ăn',
  ORDER_NOT_FOUND: 'Không tìm thấy thông tin đơn hàng',
  BARCODE_MAP_NOT_FOUND: 'Không tìm thấy thông tin mã vạch',
  BARCODE_NOT_FOUND: 'Không tìm thấy mã trong ngày ăn',
  INVALID_DATE: 'Ngày ăn không hợp lệ',
  MEMBER_NOT_FOUND: 'Không tìm thấy thông tin thành viên',
  NOT_IN_GROUP: 'Bạn không thuộc nhóm này',
  NO_FOOD_SELECTED: 'Người dùng chưa chọn món',
  ALREADY_SCANNED: 'Bạn đã quét mã QR này.',
  INTERNAL_ERROR: 'Đã xảy ra lỗi trong quá trình cập nhật dữ liệu',
  METHOD_NOT_ALLOWED: 'Phương thức không cho phép',
} as const;

interface ValidatedRequestData {
  planId: string;
  timestamp: string;
  barcode: string;
  groupId?: string;
}

interface PlanData {
  planListing: PlanListing;
  orderDetail: any;
  companyAccount: any;
}

interface BarcodeValidationResult {
  barcodeHashDigest: string;
  memberId: string;
  date: string;
}

interface MemberOrderData {
  memberOrder: Partial<MemberOrderValue>;
  foodListing: FoodListing;
  memberListing: UserListing;
}

// Validation functions
function validateRequestData(req: NextApiRequest): ValidatedRequestData {
  const { planId, timestamp } = req.query as {
    planId: string;
    timestamp: string;
  };
  const { code: barcode, groupId } =
    req.body as POSTScannerPlanIdTimestampScanQRcodeBody;

  if (typeof planId !== 'string') {
    throw new Error(ERROR_MESSAGES.INVALID_PLAN_ID);
  }

  return { planId, timestamp, barcode, groupId };
}

async function fetchPlanData(
  integrationSdk: any,
  planId: string,
): Promise<PlanData> {
  // Fetch plan listing
  const planListingResponse: WithFlexSDKData<PlanListing> =
    await integrationSdk.listings.show({
      id: planId,
    });

  const planListing = planListingResponse.data.data;
  if (!planListing) {
    throw new Error(ERROR_MESSAGES.PLAN_NOT_FOUND);
  }

  // Fetch order detail
  const orderDetail = planListing.attributes?.metadata?.orderDetail;
  if (!orderDetail) {
    throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND);
  }

  // Fetch company account
  const orderDetailListing = await integrationSdk.listings.show({
    id: planListing.attributes?.metadata?.orderId,
  });

  const orderDetailData = denormalisedResponseEntities(orderDetailListing)[0];
  const companyId = orderDetailData.attributes?.metadata?.companyId;

  const companyAccountResponse = await integrationSdk.users.show({
    id: companyId,
  });

  const companyAccount = denormalisedResponseEntities(
    companyAccountResponse,
  )[0];

  return { planListing, orderDetail, companyAccount };
}

async function validateBarcode(
  integrationSdk: any,
  planId: string,
  planListing: PlanListing,
  orderDetail: any,
  barcode: string,
  timestamp: string,
): Promise<BarcodeValidationResult> {
  const barcodeHashMap = planListing.attributes?.metadata?.barcodeHashMap;

  if (!barcodeHashMap) {
    throw new Error(ERROR_MESSAGES.BARCODE_MAP_NOT_FOUND);
  }

  let barcodeHashDigest = barcodeHashMap[barcode];

  // If barcode not found, try to regenerate the hash map
  if (!barcodeHashDigest) {
    const barcodeHashMapLength = Object.keys(barcodeHashMap).length;
    const totalMemberOrders = (
      Object.values(orderDetail) as { memberOrders?: Record<string, unknown> }[]
    ).reduce(
      (acc: number, curr) => acc + Object.keys(curr?.memberOrders || {}).length,
      0,
    );

    if (barcodeHashMapLength === totalMemberOrders) {
      throw new Error(ERROR_MESSAGES.BARCODE_NOT_FOUND);
    }

    // Regenerate barcode hash map
    const refilledBarcodeHashMap = generateBarcodeHashMap(planId, orderDetail);

    await integrationSdk.listings.update({
      id: planId,
      metadata: {
        barcodeHashMap: refilledBarcodeHashMap,
      },
    });

    barcodeHashDigest = refilledBarcodeHashMap[barcode];
    if (!barcodeHashDigest) {
      throw new Error(ERROR_MESSAGES.BARCODE_NOT_FOUND);
    }
  }

  // Validate timestamp
  const { memberId, date } = detachScannerBarCodeUniqueKey(barcodeHashDigest);
  if (date !== timestamp) {
    throw new Error(ERROR_MESSAGES.INVALID_DATE);
  }

  return { barcodeHashDigest, memberId, date };
}

function validateGroupMembership(
  companyAccount: any,
  memberId: string,
  groupId?: string,
): void {
  if (!groupId) return;

  const group = companyAccount?.attributes?.profile?.metadata?.groups
    ?.find((g: TObject) => g.id === groupId)
    ?.members?.find((m: TObject) => m.id === memberId);

  if (!group) {
    throw new Error(ERROR_MESSAGES.NOT_IN_GROUP);
  }
}

async function fetchMemberOrderData(
  integrationSdk: any,
  orderDetail: any,
  memberId: string,
  date: string,
): Promise<MemberOrderData> {
  const memberOrder = orderDetail[date]?.memberOrders?.[memberId];
  if (!memberOrder) {
    throw new Error(ERROR_MESSAGES.MEMBER_NOT_FOUND);
  }

  const foodId = memberOrder.foodId;
  if (!foodId) {
    throw new Error(ERROR_MESSAGES.NO_FOOD_SELECTED);
  }

  // Fetch food and member data in parallel
  const [foodListingResponse, memberListingResponse] = await Promise.all([
    integrationSdk.listings.show({
      id: foodId,
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
  const memberListing = denormalisedResponseEntities(memberListingResponse)[0];

  return { memberOrder, foodListing, memberListing };
}

async function checkIfAlreadyScanned(barcode: string): Promise<void> {
  const scannedRecordRef = collection(
    firestore,
    process.env.NEXT_PUBLIC_FIREBASE_SCANNED_RECORDS_COLLECTION_NAME,
  );

  const q = query(scannedRecordRef, where('barcode', '==', barcode));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const existingData = querySnapshot.docs[0].data();
    const error = new Error(ERROR_MESSAGES.ALREADY_SCANNED) as any;
    error.statusCode = 409;
    error.data = { isAlreadyScanned: true, data: existingData };
    throw error;
  }
}

async function createScannedRecord(
  planId: string,
  timestamp: string,
  barcode: string,
  memberListing: UserListing,
  foodListing: FoodListing,
  groupId?: string,
): Promise<Omit<FirebaseScannedRecord, 'id'>> {
  console.log(memberListing?.attributes?.profile);
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
      {
        compareToGetLongerWith: memberListing?.attributes?.profile?.displayName,
      },
    ),
    foodName: foodListing.attributes?.title!,
    foodThumbnailUrl:
      foodListing.images?.[0]?.attributes?.variants?.['square-small']?.url ||
      '',
    state: 'live',
    scannedAt: new Date().valueOf(),
    ...(groupId && { groupId }),
  } satisfies Omit<FirebaseScannedRecord, 'id'>;

  const scannedRecordRef = collection(
    firestore,
    process.env.NEXT_PUBLIC_FIREBASE_SCANNED_RECORDS_COLLECTION_NAME,
  );

  await addDoc(scannedRecordRef, record);

  return record;
}

function logScanResult(
  memberId: string,
  timestamp: string,
  planId: string,
  barcode: string,
  foodTitle: string,
  isSuccess: boolean = true,
): void {
  const dateStr = new Date(+timestamp).toLocaleString('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
  });

  const status = isSuccess ? 'successfully scanned' : 'already scanned';

  console.log(
    `LOG ~ QR Code ${status} for user ${memberId} at ${dateStr} planId ${planId} timestamp: ${timestamp} barcode: ${barcode}${
      isSuccess ? ` food: ${foodTitle}` : ''
    }`,
  );
}

function getStatusCodeFromError(errorMessage: string): number {
  const errorStatusMap: Record<string, number> = {
    [ERROR_MESSAGES.INVALID_PLAN_ID]: 400,
    [ERROR_MESSAGES.PLAN_NOT_FOUND]: 404,
    [ERROR_MESSAGES.ORDER_NOT_FOUND]: 404,
    [ERROR_MESSAGES.BARCODE_MAP_NOT_FOUND]: 404,
    [ERROR_MESSAGES.BARCODE_NOT_FOUND]: 404,
    [ERROR_MESSAGES.INVALID_DATE]: 404,
    [ERROR_MESSAGES.MEMBER_NOT_FOUND]: 404,
    [ERROR_MESSAGES.NOT_IN_GROUP]: 404,
    [ERROR_MESSAGES.NO_FOOD_SELECTED]: 404,
  };

  return errorStatusMap[errorMessage] || 500;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== HttpMethod.POST) {
    return res.status(405).json({ message: ERROR_MESSAGES.METHOD_NOT_ALLOWED });
  }

  try {
    // 1. Validate request data
    const { planId, timestamp, barcode, groupId } = validateRequestData(req);

    // 2. Get integration SDK
    const integrationSdk = await getIntegrationSdk();

    // 3. Fetch plan data and validate
    const { planListing, orderDetail, companyAccount } = await fetchPlanData(
      integrationSdk,
      planId,
    );

    // 4. Validate barcode and get member info
    const { memberId, date } = await validateBarcode(
      integrationSdk,
      planId,
      planListing,
      orderDetail,
      barcode,
      timestamp,
    );

    // 5. Check group membership if groupId provided
    validateGroupMembership(companyAccount, memberId, groupId);

    // 6. Fetch member order data
    const { foodListing, memberListing } = await fetchMemberOrderData(
      integrationSdk,
      orderDetail,
      memberId,
      date,
    );

    // 7. Check if already scanned
    await checkIfAlreadyScanned(barcode);

    // 8. Create scanned record
    const record = await createScannedRecord(
      planId,
      timestamp,
      barcode,
      memberListing,
      foodListing,
      groupId,
    );

    // 9. Log success
    logScanResult(
      memberId,
      timestamp,
      planId,
      barcode,
      foodListing.attributes?.title!,
    );

    return res.status(200).json(record);
  } catch (error: any) {
    // Handle specific error cases
    if (error.statusCode === 409) {
      logScanResult('', '', '', '', '', false);

      return res.status(409).json({
        error: error.message,
        ...error.data,
      });
    }

    // Handle validation and business logic errors
    const errorMessage = error.message || ERROR_MESSAGES.INTERNAL_ERROR;
    const statusCode = getStatusCodeFromError(errorMessage);

    return res.status(statusCode).json({
      message: errorMessage.includes('Đã xảy ra lỗi')
        ? `${ERROR_MESSAGES.INTERNAL_ERROR}: ${error}`
        : errorMessage,
    });
  }
}
