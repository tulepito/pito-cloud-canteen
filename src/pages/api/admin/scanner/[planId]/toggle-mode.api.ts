import { createHash } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod } from '@apis/configs';
import { getIntegrationSdk } from '@services/sdk';
import type { OrderDetail, PlanListing, WithFlexSDKData } from '@src/types';

export interface PUTScannerPlanIdBody {}

const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const BASE62_LENGTH = 12;

export const bufferToBase62 = (buffer: Buffer) => {
  let num = BigInt(`0x${buffer.toString('hex')}`);
  let str = '';
  const BASE = BigInt(62);

  while (num > BigInt(0) && str.length < BASE62_LENGTH) {
    const index = Number(num % BASE);
    str = BASE62[index] + str;
    num /= BASE;
  }

  return str.padStart(BASE62_LENGTH, '0');
};

export const detachScannerBarCodeUniqueKey = (barcodeHashDigest: string) => {
  const [planId, memberId, date] = barcodeHashDigest.split('_');

  return { planId, memberId, date };
};

export const generateScannerBarCodeUniqueKey = (
  planId: string,
  memberId: string,
  date: string,
) => {
  return `${planId}_${memberId}_${date}`;
};

export const generateScannerBarCode = (
  planId: string,
  memberId: string,
  date: string,
) => {
  const uniqueKey = generateScannerBarCodeUniqueKey(planId, memberId, date);
  const hash = createHash('sha256').update(uniqueKey).digest();

  return bufferToBase62(hash);
};

export const generateBarcodeHashMap = (
  planId: string,
  orderDetail: OrderDetail,
): Record<string, string> => {
  const barcodeHashMap: Record<string, string> = {};
  Object.keys(orderDetail).forEach((date) => {
    const memberOrders = orderDetail[date]?.memberOrders;
    Object.keys(memberOrders || {}).forEach((memberId) => {
      const barcodeHashDigest = generateScannerBarCodeUniqueKey(
        planId,
        memberId,
        date,
      );
      const barcodeKey = generateScannerBarCode(planId, memberId, date);

      barcodeHashMap[barcodeKey] = barcodeHashDigest;
    });
  });

  return barcodeHashMap;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === HttpMethod.PUT) {
    const { planId } = req.query;

    if (typeof planId !== 'string') {
      return res.status(400).json({ error: 'Invalid planId' });
    }

    const integrationSdk = await getIntegrationSdk();

    try {
      const planListingResponse: WithFlexSDKData<PlanListing> =
        await integrationSdk.listings.show({
          id: planId,
        });
      const planListing = planListingResponse.data.data;
      const currentAllowToScan = planListing.attributes?.metadata?.allowToScan;

      if (!planListing) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      const orderDetail = planListing.attributes?.metadata?.orderDetail;
      if (!orderDetail) {
        return res.status(404).json({ error: 'Order detail not found' });
      }

      const barcodeHashMap = generateBarcodeHashMap(planId, orderDetail);

      const updatedPlanLisitngResponse: WithFlexSDKData<PlanListing> =
        await integrationSdk.listings.update({
          id: planId,
          metadata: {
            allowToScan: !currentAllowToScan,
            barcodeHashMap,
          },
        });

      res.status(200).json(updatedPlanLisitngResponse.data.data);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error occurred' });
    }

    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
