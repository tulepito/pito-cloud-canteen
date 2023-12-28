import AWS from 'aws-sdk';
import { isEmpty } from 'lodash';
import { DateTime } from 'luxon';

import { convertHHmmStringToTimeParts } from '@helpers/dateHelpers';
import { formatTimestamp, VNTimezone } from '@src/utils/dates';

const LAMBDA_ARN = `${process.env.LAMBDA_ARN}`;
const ROLE_ARN = `${process.env.ROLE_ARN}`;
const SEND_FOOD_RATING_NOTIFICATION_LAMBDA_ARN = `${process.env.SEND_FOOD_RATING_NOTIFICATION_LAMBDA_ARN}`;
const AUTOMATIC_START_ORDER_JOB_LAMBDA_ARN = `${process.env.AUTOMATIC_START_ORDER_JOB_LAMBDA_ARN}`;
const PICK_FOOD_FOR_EMPTY_MEMBER_LAMBDA_ARN = `${process.env.PICK_FOOD_FOR_EMPTY_MEMBER_LAMBDA_ARN}`;
const SEND_REMIND_PICKING_NATIVE_NOTIFICATION_TO_BOOKER_LAMBDA_ARN = `${process.env.SEND_REMIND_PICKING_NATIVE_NOTIFICATION_TO_BOOKER_LAMBDA_ARN}`;
const NEXT_PUBLIC_ENV = `${process.env.NEXT_PUBLIC_ENV}`;

const isProduction = NEXT_PUBLIC_ENV === 'production';

const Scheduler = new AWS.Scheduler({
  accessKeyId: `${process.env.NEXT_APP_SCHEDULER_ACCESS_KEY}`,
  secretAccessKey: `${process.env.NEXT_APP_SCHEDULER_SECRET_KEY}`,
  region: `${process.env.AWS_SES_REGION}`,
  apiVersion: '2021-06-30',
});

type CreateSchedulerParams = {
  params?: any;
  customName: string; // less than 64 characters
  timeExpression?: string; // yyyy-mm-ddThh:mm:ss
  arn?: string;
};
export const createScheduler = ({
  arn,
  params,
  customName,
  timeExpression,
}: CreateSchedulerParams) => {
  const schedulerParams = {
    FlexibleTimeWindow: {
      Mode: 'OFF',
    },
    Name: customName,
    ScheduleExpression: `at(${timeExpression})`,
    ScheduleExpressionTimezone: 'Asia/Ho_Chi_Minh',
    ActionAfterCompletion: isProduction ? 'NONE' : 'DELETE',
    Target: {
      Arn: arn || LAMBDA_ARN,
      RoleArn: ROLE_ARN,
      Input: JSON.stringify(params),
    },
  };

  return Scheduler.createSchedule(schedulerParams).promise();
};

export const getScheduler = (name: string) => {
  const schedulerParams = {
    Name: name,
  };

  return Scheduler.getSchedule(schedulerParams).promise();
};

export const updateScheduler = ({
  arn,
  params,
  customName,
  timeExpression,
}: CreateSchedulerParams) => {
  const schedulerParams = {
    FlexibleTimeWindow: {
      Mode: 'OFF',
    },
    Name: customName,
    ScheduleExpression: `at(${timeExpression})`,
    ScheduleExpressionTimezone: 'Asia/Ho_Chi_Minh',
    ActionAfterCompletion: isProduction ? 'NONE' : 'DELETE',
    Target: {
      Arn: arn || LAMBDA_ARN,
      RoleArn: ROLE_ARN,
      Input: JSON.stringify(params),
    },
  };

  return Scheduler.updateSchedule(schedulerParams).promise();
};

export const createFoodRatingNotificationScheduler = async ({
  params,
  customName,
  timeExpression,
}: CreateSchedulerParams) => {
  const schedulerParams = {
    FlexibleTimeWindow: {
      Mode: 'OFF',
    },
    Name: customName,
    ScheduleExpression: `at(${timeExpression})`,
    ScheduleExpressionTimezone: 'Asia/Ho_Chi_Minh',
    ActionAfterCompletion: isProduction ? 'NONE' : 'DELETE',
    Target: {
      Arn: SEND_FOOD_RATING_NOTIFICATION_LAMBDA_ARN,
      RoleArn: ROLE_ARN,
      Input: JSON.stringify(params),
    },
  };

  Scheduler.createSchedule(schedulerParams)
    .promise()
    .then((res) => {
      console.log('Create Food Rating Notification Scheduler Success: ', res);
    })
    .catch((err) => {
      console.log('Create Food Rating Notification Scheduler Error: ', err);
    });
};

export const createOrUpdateAutomaticStartOrderScheduler = async ({
  orderId,
  startDate,
  deliveryHour,
}: any) => {
  const ensuredDeliveryHour = isEmpty(deliveryHour)
    ? undefined
    : deliveryHour.includes('-')
    ? deliveryHour.split('-')[0]
    : deliveryHour;
  const customName = `automaticStartOrder_${orderId}`;
  const timeExpression = formatTimestamp(
    DateTime.fromMillis(startDate)
      .setZone(VNTimezone)
      .plus({
        ...convertHHmmStringToTimeParts(ensuredDeliveryHour),
      })
      .minus({ day: 1 })
      .toMillis(),
    "yyyy-MM-dd'T'hh:mm:ss",
  );

  try {
    await getScheduler(customName);
    await updateScheduler({
      arn: AUTOMATIC_START_ORDER_JOB_LAMBDA_ARN,
      customName,
      timeExpression,
    });
  } catch (error) {
    createScheduler({
      arn: AUTOMATIC_START_ORDER_JOB_LAMBDA_ARN,
      customName,
      timeExpression,
      params: {
        orderId,
      },
    })
      .then((res) => {
        console.log('Create Automatic start order Scheduler Success: ', res);
      })
      .catch((err) => {
        console.log('Create Automatic start order Scheduler Error: ', err);
      });
  }
};

export const createOrUpdatePickFoodForEmptyMembersScheduler = async ({
  orderId,
  startDate,
  deliveryHour,
}: any) => {
  const ensuredDeliveryHour = isEmpty(deliveryHour)
    ? undefined
    : deliveryHour.includes('-')
    ? deliveryHour.split('-')[0]
    : deliveryHour;
  const customName = `PFFEM_${orderId}`; // PFFEM: Pick Food For Empty Members
  const timeExpression = formatTimestamp(
    DateTime.fromMillis(startDate)
      .setZone(VNTimezone)
      .plus({
        ...convertHHmmStringToTimeParts(ensuredDeliveryHour),
      })
      .minus({ day: 1, hour: 1 })
      .toMillis(),
    "yyyy-MM-dd'T'hh:mm:ss",
  );

  try {
    await getScheduler(customName);
    await updateScheduler({
      arn: PICK_FOOD_FOR_EMPTY_MEMBER_LAMBDA_ARN,
      customName,
      timeExpression,
      params: {
        orderId: null,
      },
    });
  } catch (error) {
    createScheduler({
      arn: PICK_FOOD_FOR_EMPTY_MEMBER_LAMBDA_ARN,
      customName,
      timeExpression,
      params: {
        orderId,
      },
    })
      .then((res) => {
        console.log('Create Automatic picking food Scheduler Success: ', res);
      })
      .catch((err) => {
        console.log('Create Automatic picking food Scheduler Error: ', err);
      });
  }
};

export const sendRemindPickingNativeNotificationToBookerScheduler = async ({
  orderId,
  deadlineDate,
}: {
  orderId: string;
  deadlineDate: number;
}) => {
  const customName = `send_RPNNTB_${orderId}`; // send remind picking native notification to booker
  const timeExpression = formatTimestamp(
    DateTime.fromMillis(deadlineDate)
      .setZone(VNTimezone)
      .minus({ hours: 3 })
      .toMillis(),
    "yyyy-MM-dd'T'hh:mm:ss",
  );

  try {
    await getScheduler(customName);
    await updateScheduler({
      arn: SEND_REMIND_PICKING_NATIVE_NOTIFICATION_TO_BOOKER_LAMBDA_ARN,
      customName,
      timeExpression,
    });
  } catch (error) {
    createScheduler({
      arn: SEND_REMIND_PICKING_NATIVE_NOTIFICATION_TO_BOOKER_LAMBDA_ARN,
      customName,
      timeExpression,
      params: {
        orderId,
      },
    })
      .then((res) => {
        console.log(
          'Send remind picking native notification to booker Success: ',
          res,
        );
      })
      .catch((err) => {
        console.log(
          'Send remind picking native notification to booker Error: ',
          err,
        );
      });
  }
};
