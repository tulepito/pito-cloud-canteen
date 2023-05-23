import AWS from 'aws-sdk';

const LAMBDA_ARN = `${process.env.LAMBDA_ARN}`;
const ROLE_ARN = `${process.env.ROLE_ARN}`;

const credential = new AWS.Config({
  accessKeyId: `${process.env.NEXT_APP_SCHEDULER_ACCESS_KEY}`,
  secretAccessKey: `${process.env.NEXT_APP_SCHEDULER_SECRET_KEY}`,
  region: `${process.env.AWS_SES_REGION}`,
});

AWS.config.update(credential);

const Scheduler = new AWS.Scheduler({ apiVersion: '2021-06-30' });

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
    Target: {
      Arn: LAMBDA_ARN,
      RoleArn: ROLE_ARN,
      Input: JSON.stringify(params),
    },
  };

  return Scheduler.updateSchedule(schedulerParams).promise();
};
