import {
  addDoc,
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import type { FirebaseScannedRecord } from '@pages/admin/order/FirebaseScannedRecord';
import type { POSTScannerPlanIdTimestampScanBody } from '@pages/admin/order/POSTScannerPlanIdTimestampScanBody';
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
import { EImageVariants } from '@src/utils/enums';

import {
  detachScannerBarCodeUniqueKey,
  generateBarcodeHashMap,
} from '../toggle-mode.api';

export const buildFullName = (
  firstName?: string,
  lastName?: string,
  options?: {
    compareToGetLongerWith?: string;
  },
) => {
  if (!firstName || !lastName) return firstName || lastName || '';

  if (firstName === lastName) return firstName;

  const fullName = `${lastName} ${firstName}`;
  if (!options) return fullName;

  const { compareToGetLongerWith } = options;

  if (!compareToGetLongerWith) return fullName;

  if (fullName.length < compareToGetLongerWith.length) {
    return compareToGetLongerWith;
  }

  return fullName;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === HttpMethod.POST) {
    const { planId, timestamp } = req.query as {
      planId: string;
      timestamp: string;
    };
    const { barcode, groupId, screen } =
      req.body as POSTScannerPlanIdTimestampScanBody;
    let matchedBarcodeMemberOrder: Partial<MemberOrderValue> | undefined;

    if (typeof planId !== 'string') {
      return res.status(400).json({ error: 'ID tuần ăn không hợp lệ' });
    }

    const integrationSdk = await getIntegrationSdk();

    try {
      const planListingResponse: WithFlexSDKData<PlanListing> =
        await integrationSdk.listings.show({
          id: planId,
        });

      const planListing = planListingResponse.data.data;
      if (!planListing) {
        return res
          .status(404)
          .json({ error: 'Không tìm thấy thông tin tuần ăn' });
      }

      const orderDetail = planListing.attributes?.metadata?.orderDetail;
      if (!orderDetail) {
        return res
          .status(404)
          .json({ error: 'Không tìm thấy thông tin đơn hàng' });
      }

      const barcodeHashMap = planListing.attributes?.metadata?.barcodeHashMap;
      if (!barcodeHashMap) {
        return res.status(404).json({ error: 'Không tìm thấy thông tin' });
      }

      let barcodeHashDigest = barcodeHashMap[barcode];
      const barcodeHashMapLength = Object.keys(barcodeHashMap).length;
      const totalMemberOrders = Object.values(orderDetail).reduce(
        (acc, curr) => acc + Object.keys(curr?.memberOrders || {}).length,
        0,
      );

      if (!barcodeHashDigest) {
        if (barcodeHashMapLength === totalMemberOrders) {
          return res.status(404).json({
            error: 'Không tìm thấy thông tin mã vạch',
          });
        }

        const refilledBarcodeHashMap = generateBarcodeHashMap(
          planId,
          orderDetail,
        );

        integrationSdk.listings.update({
          id: planId,
          metadata: {
            barcodeHashMap: refilledBarcodeHashMap,
          },
        });

        barcodeHashDigest = refilledBarcodeHashMap[barcode];
        if (!barcodeHashDigest) {
          return res
            .status(404)
            .json({ error: 'Không tìm thấy mã trong ngày ăn' });
        }
      }

      const { memberId, date } =
        detachScannerBarCodeUniqueKey(barcodeHashDigest);

      if (date !== timestamp) {
        return res.status(404).json({ error: 'Ngày ăn không hợp lệ' });
      }

      matchedBarcodeMemberOrder = orderDetail[date]?.memberOrders?.[memberId];
      if (!matchedBarcodeMemberOrder) {
        return res.status(404).json({ error: 'Không tìm thấy thông tin' });
      }

      const foodId = matchedBarcodeMemberOrder.foodId;

      if (!foodId) {
        return res.status(404).json({ error: 'Người dùng chưa chọn món' });
      }

      const foodListingResponse: FoodListing = denormalisedResponseEntities(
        await integrationSdk.listings.show({
          id: foodId,
          include: ['images'],
          'fields.image': [`variants.${EImageVariants.squareSmall}`],
        }),
      )[0];
      const memberListingResponse: UserListing = denormalisedResponseEntities(
        await integrationSdk.users.show({
          id: memberId,
          include: ['profileImage'],
          'fields.image': [`variants.${EImageVariants.squareSmall}`],
        }),
      )[0];
      const memberListing = memberListingResponse;

      const foodListing = foodListingResponse;

      const scannedRecordRef = collection(
        firestore,
        process.env.NEXT_PUBLIC_FIREBASE_SCANNED_RECORDS_COLLECTION_NAME,
      );
      const q = query(scannedRecordRef, where('barcode', '==', barcode));
      const querySnapshot = await getDocs(q);
      const _record = {
        planId,
        timestamp: +timestamp,
        barcode,
        memberProfileImageUrl:
          memberListing.profileImage?.attributes?.variants?.['square-small']
            ?.url || '',
        memberAbbrName:
          memberListing.attributes?.profile?.abbreviatedName || '',
        memberName: buildFullName(
          memberListing.attributes?.profile?.firstName,
          memberListing.attributes?.profile?.lastName,
          {
            compareToGetLongerWith:
              memberListing.attributes?.profile?.displayName,
          },
        ),
        foodName: foodListing.attributes?.title!,
        foodThumbnailUrl:
          foodListingResponse.images?.[0]?.attributes?.variants?.[
            'square-small'
          ]?.url || '',
        state: 'live',
        scannedAt: Date.now(),
        ...(matchedBarcodeMemberOrder?.requirement && {
          note: matchedBarcodeMemberOrder?.requirement,
        }),
        ...(groupId && { groupId }),
        ...(screen && { screen }),
      } satisfies Omit<FirebaseScannedRecord, 'id'>;

      if (querySnapshot.empty) {
        await addDoc(scannedRecordRef, _record);
      } else {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, _record);
      }

      return res.status(200).json(_record);
    } catch (error) {
      return res.status(500).json({
        error: `Đã xảy ra lỗi trong quá trình cập nhật dữ liệu: ${error}`,
      });
    }
  }

  return res.status(405).json({ error: 'Phương thức không cho phép' });
}
