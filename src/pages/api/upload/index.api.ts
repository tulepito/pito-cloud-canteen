import type { Fields, Files } from 'formidable';
import formidable from 'formidable';
import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';

import { getIntegrationSdk } from '@services/sdk'; // Updated to use getIntegrationSdk
import { createSlackNotification } from '@services/slackNotification';
import type { PlanListing, WithFlexSDKData } from '@src/types';
import { ESlackNotificationType } from '@src/utils/enums';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });

    return;
  }

  const form = formidable({
    keepExtensions: true,
  });

  form.parse(req, async (err: Error | null, fields: Fields, files: Files) => {
    if (err) {
      console.error('Error parsing form:', err);
      res.status(500).json({ message: 'Error parsing form data' });

      return;
    }

    const planIds = fields.planId as string[];
    const subOrderDates = fields.subOrderTimestamp as string[];
    const phoneNumbers = fields.deliveryPhoneNumber as string[];
    const planId = planIds?.[0];
    const subOrderDate = subOrderDates?.[0];
    const phoneNumber = phoneNumbers?.[0];
    const _files = files.file as formidable.File[] | undefined;

    if (!_files?.[0]) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!planId || !subOrderDate || !phoneNumber) {
      res.status(400).json({ message: 'Missing required fields' });

      return;
    }

    const sdk = getIntegrationSdk();
    const planListing: WithFlexSDKData<PlanListing> = await sdk.listings.show({
      id: planId,
    });

    const images =
      planListing.data.data.attributes?.metadata?.deliveryInfo?.[
        subOrderDate
      ]?.[phoneNumber]?.images || [];
    const MAX_IMAGES_CAN_UPLOAD = 20;
    const totalImagesForEachDeliverier = images.length + _files.length;
    if (totalImagesForEachDeliverier >= MAX_IMAGES_CAN_UPLOAD) {
      res.status(400).json({
        message: `Mỗi tài xế chỉ được upload tối đa ${MAX_IMAGES_CAN_UPLOAD} ảnh cho mỗi đơn hàng`,
      });

      return;
    }

    const MAX_IMAGES = 40;
    const allImages = planListing.data.data.attributes?.metadata?.deliveryInfo
      ? Object.values(planListing.data.data.attributes?.metadata?.deliveryInfo)
          .flatMap((info: any) => Object.values(info))
          .flatMap((info: any) => info.images)
      : [];
    const totalImages = allImages.length + _files.length;
    if (totalImages >= MAX_IMAGES) {
      res.status(400).json({
        message:
          'Đơn hàng này không thể tải thêm ảnh, hãy liên hệ nhân viên vận hành',
      });

      return;
    }

    try {
      const promises = _files.map((file) => {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve) => {
          const filePath = file.filepath;
          const fileStream = fs.createReadStream(filePath);

          const response = await sdk.images.upload(
            { image: fileStream },
            {
              expand: true,
              'fields.image': ['variants.scaled-large'],
            },
          );

          const imageUrl =
            response.data.data.attributes.variants['scaled-large'].url;
          const imageId = response.data.data.id.uuid;

          resolve({
            imageUrl,
            imageId,
          });
        });
      });
      const results = await Promise.all(promises);

      const currentDateValueGMTTime =
        new Date().valueOf() + new Date().getTimezoneOffset() * 60 * 1000;
      const resultsWithMetaData = results.map((result) => ({
        ...(result || {}),
        uploadedAt: currentDateValueGMTTime,
        lastTransition:
          planListing.data.data.attributes?.metadata?.orderDetail?.[
            subOrderDate
          ]?.lastTransition,
      }));

      const metadata = {
        deliveryInfoLastUpdatedAtTimestamp: currentDateValueGMTTime,
        deliveryInfo: {
          ...(planListing.data.data.attributes?.metadata?.deliveryInfo || {}),
          [subOrderDate]: {
            ...(planListing.data.data.attributes?.metadata?.deliveryInfo?.[
              subOrderDate
            ] || {}),
            [phoneNumber]: {
              ...(planListing.data.data.attributes?.metadata?.deliveryInfo?.[
                subOrderDate
              ]?.[phoneNumber] || {}),
              images: [
                ...resultsWithMetaData,
                ...(planListing.data.data.attributes?.metadata?.deliveryInfo?.[
                  subOrderDate
                ]?.[phoneNumber]?.images || []),
              ],
            },
          },
        },
      };

      const lastUpdatedAtTimestamp =
        planListing.data.data.attributes?.metadata
          ?.deliveryInfoLastUpdatedAtTimestamp;
      const lastUpdatedAtTimestampDate = lastUpdatedAtTimestamp
        ? new Date(lastUpdatedAtTimestamp)
        : null;

      const currentTime = Date.now().valueOf();
      const timeDifference = lastUpdatedAtTimestampDate
        ? Math.abs(currentTime - lastUpdatedAtTimestampDate.valueOf())
        : 0;

      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
      if (!timeDifference || timeDifference > fiveMinutes) {
        createSlackNotification(
          ESlackNotificationType.DELIVERY_AGENT_IMAGES_UPLOADED,
          {
            deliveryAgentImagesUploadedData: {
              orderLink: `${process.env.NEXT_PUBLIC_CANONICAL_URL}/admin/order/${planListing.data.data.attributes?.metadata?.orderId}`,
              threadTs:
                planListing.data.data.attributes?.metadata?.slackThreadTs,
            },
          },
        );
      }
      await sdk.listings.update({
        id: planId,
        metadata,
      });

      res.status(200).json({
        message: 'File uploaded successfully',
        uploadedImage: resultsWithMetaData,
      });
    } catch (uploadError) {
      console.error('Error uploading image:', uploadError);
      res.status(500).json({ message: 'Error uploading image' });
    }
  });
};

export default handler;
