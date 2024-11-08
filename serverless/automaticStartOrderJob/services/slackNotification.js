const axios = require('axios');
const { SLACK_NOTIFICATION_TYPE } = require('../utils/enums');

const createSlackNotification = async (
  notificationType,
  notificationParams,
) => {
  if (process.env.SLACK_WEBHOOK_ENABLED !== 'true') return;

  try {
    console.info(
      'createSlackNotification',
      `notificationType: ${notificationType}`,
    );
    switch (notificationType) {
      case SLACK_NOTIFICATION_TYPE.ORDER_STATUS_CHANGES_TO_IN_PROGRESS: {
        if (!notificationParams.orderStatusChangesToInProgressData) return;

        await axios.post(
          process.env.SLACK_WEBHOOK_URL,
          {
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `:firecracker::firecracker::firecracker: Bạn có đơn hàng đang triển khai:\n*<${notificationParams.orderStatusChangesToInProgressData.orderLink}|#${notificationParams.orderStatusChangesToInProgressData.orderCode} - ${notificationParams.orderStatusChangesToInProgressData.orderName}>*`,
                },
              },
              {
                type: 'section',
                fields: [
                  {
                    type: 'mrkdwn',
                    text: `*Khách hàng:*\n${notificationParams.orderStatusChangesToInProgressData.companyName}`,
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Giao đến:*\n${notificationParams.orderStatusChangesToInProgressData.deliveryAddress}`,
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Ngày bắt đầu:*\n${notificationParams.orderStatusChangesToInProgressData.startDate}`,
                  },

                  {
                    type: 'mrkdwn',
                    text: `*Giờ giao hàng:*\n${notificationParams.orderStatusChangesToInProgressData.deliveryHour}`,
                  },
                ],
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error('createSlackNotification', String(error));
  }
};

module.exports = { createSlackNotification };
