import AWS from 'aws-sdk';
import { isEmpty } from 'lodash';
import { DateTime } from 'luxon';

import { convertHHmmStringToTimeParts } from '@helpers/dateHelpers';
import logger from '@helpers/logger';
import { formatTimestamp, VNTimezone } from '@src/utils/dates';

const LAMBDA_ARN = `${process.env.LAMBDA_ARN}`;
const ROLE_ARN = `${process.env.ROLE_ARN}`;
const { SEND_FOOD_RATING_NOTIFICATION_LAMBDA_ARN } = process.env;
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
  arn: string;
};
export const createScheduler = ({
  arn,
  params,
  customName,
  timeExpression,
}: CreateSchedulerParams) => {
  return Scheduler.createSchedule({
    FlexibleTimeWindow: {
      Mode: 'OFF',
    },
    Name: customName,
    ScheduleExpression: `at(${timeExpression})`,
    ScheduleExpressionTimezone: 'Asia/Ho_Chi_Minh',
    ActionAfterCompletion: isProduction ? 'NONE' : 'DELETE',
    Target: {
      Arn: arn,
      RoleArn: ROLE_ARN,
      Input: JSON.stringify(params),
    },
  })
    .promise()
    .then(() => {
      logger.success(
        `Create scheduler ${arn} at ${timeExpression} success`,
        JSON.stringify({ customName, timeExpression, arn, params }),
      );
    })
    .catch((error) => {
      logger.error(
        `Create scheduler ${arn} at ${timeExpression} failed`,
        String(error),
      );
    });
};

export const getScheduler = (name: string) => {
  const schedulerParams = {
    Name: name,
  };

  return Scheduler.getSchedule(schedulerParams)
    .promise()
    .then(() => {
      logger.info(
        `Scheduler ${name} is existed`,
        JSON.stringify(schedulerParams),
      );
    })
    .catch((error) => {
      logger.info(
        `Scheduler ${name} is not existed`,
        JSON.stringify(schedulerParams),
      );

      throw error; // enable to catch error in the caller function to trigger createScheduler
    });
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

  return Scheduler.updateSchedule(schedulerParams)
    .promise()
    .then(() => {
      logger.warn(
        'Update scheduler success',
        JSON.stringify({ customName, timeExpression, arn, params }),
      );
    })
    .catch((error) => {
      logger.error(
        'Update scheduler failed',
        JSON.stringify({ customName, timeExpression, arn, params, error }),
      );
      throw error; // enable to catch error in the caller function to trigger createScheduler
    });
};

export const createFoodRatingNotificationScheduler = async ({
  params,
  customName,
  timeExpression,
}: Omit<CreateSchedulerParams, 'arn'>) => {
  createScheduler({
    arn: SEND_FOOD_RATING_NOTIFICATION_LAMBDA_ARN,
    customName,
    timeExpression,
    params,
  });
};

export const upsertAutomaticStartOrderScheduler = async ({
  orderId,
  startDate,
  deliveryHour,
}: {
  orderId: string;
  startDate: number;
  deliveryHour: string;
}) => {
  if (!orderId || !startDate || !deliveryHour) return;

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
      .minus({
        hours:
          +process.env
            .NEXT_PUBLIC_ORDER_AUTO_START_TIME_TO_DELIVERY_TIME_OFFSET_IN_HOUR,
      })
      .toMillis(),
    "yyyy-MM-dd'T'HH:mm:ss",
  );

  try {
    await getScheduler(customName);
    await updateScheduler({
      arn: AUTOMATIC_START_ORDER_JOB_LAMBDA_ARN,
      customName,
      timeExpression,
      params: {
        orderId,
      },
    });
  } catch (error) {
    createScheduler({
      arn: AUTOMATIC_START_ORDER_JOB_LAMBDA_ARN,
      customName,
      timeExpression,
      params: {
        orderId,
      },
    });
  }
};

export const upsertPickFoodForEmptyMembersScheduler = async ({
  orderId,
  deadlineDate,
  params,
}: {
  orderId: string | null; // null for cancelling the scheduler
  deadlineDate: number;
  params: {
    orderId: string | null;
  };
}) => {
  if (!deadlineDate) return;

  const customName = `PFFEM_${orderId}`;
  const timeExpression = formatTimestamp(
    DateTime.fromMillis(deadlineDate).setZone(VNTimezone).toMillis(),
    "yyyy-MM-dd'T'HH:mm:ss",
  );

  try {
    await getScheduler(customName);
    await updateScheduler({
      arn: PICK_FOOD_FOR_EMPTY_MEMBER_LAMBDA_ARN,
      customName,
      timeExpression,
      params,
    });
  } catch (error) {
    createScheduler({
      arn: PICK_FOOD_FOR_EMPTY_MEMBER_LAMBDA_ARN,
      customName,
      timeExpression,
      params,
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
  const customName = `sendRPNNTB_${orderId}`; // send remind picking native notification to booker
  const timeExpression = formatTimestamp(
    DateTime.fromMillis(deadlineDate)
      .setZone(VNTimezone)
      .minus({
        minutes:
          +process.env
            .NEXT_PUBLIC_REMIND_PICKING_NATIVE_NOTIFICATION_TO_BOOKER_TIME_TO_DEADLINE_IN_MINUTES,
      })
      .toMillis(),
    "yyyy-MM-dd'T'HH:mm:ss",
  );

  try {
    await getScheduler(customName);
    await updateScheduler({
      arn: SEND_REMIND_PICKING_NATIVE_NOTIFICATION_TO_BOOKER_LAMBDA_ARN,
      customName,
      timeExpression,
      params: {
        orderId,
      },
    });
  } catch (error) {
    createScheduler({
      arn: SEND_REMIND_PICKING_NATIVE_NOTIFICATION_TO_BOOKER_LAMBDA_ARN,
      customName,
      timeExpression,
      params: {
        orderId,
      },
    });
  }
};
