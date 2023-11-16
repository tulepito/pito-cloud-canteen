import AWS from 'aws-sdk';

const LAMBDA_ARN = `${process.env.LAMBDA_ARN}`;
const ROLE_ARN = `${process.env.ROLE_ARN}`;
const SEND_FOOD_RATING_NOTIFICATION_LAMBDA_ARN = `${process.env.SEND_FOOD_RATING_NOTIFICATION_LAMBDA_ARN}`;
const AUTOMATIC_START_ORDER_JOB_LAMBDA_ARN = `${process.env.AUTOMATIC_START_ORDER_JOB_LAMBDA_ARN}`;
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
};
export const createScheduler = ({
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
    Target: {
      Arn: LAMBDA_ARN,
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
      Arn: LAMBDA_ARN,
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

export const createAutomaticStartOrderScheduler = async ({
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
      Arn: AUTOMATIC_START_ORDER_JOB_LAMBDA_ARN,
      RoleArn: ROLE_ARN,
      Input: JSON.stringify(params),
    },
  };

  Scheduler.createSchedule(schedulerParams)
    .promise()
    .then((res) => {
      console.log('Create Automatic start order Scheduler Success: ', res);
    })
    .catch((err) => {
      console.log('Create Automatic start order Scheduler Error: ', err);
    });
};
