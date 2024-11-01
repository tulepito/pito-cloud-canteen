declare namespace NodeJS {
  export interface ProcessEnv {
    ONE_SIGNAL_APP_ID: string;
    ONE_SIGNAL_API_KEY: string;

    SEND_FOOD_RATING_NOTIFICATION_LAMBDA_ARN: string;
    TIME_TO_SEND_FOOD_RATING_NOTIFICATION: string;

    NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN: string;
    NEXT_PUBLIC_MIXPANEL_ENABLED: 'true' | 'false';
    NEXT_PUBLIC_MIXPANEL_DEBUG_ENABLED: 'true' | 'false';

    SENTRY_SOURCE_MAPS_ENABLED: 'true' | 'false';
    SENTRY_AUTH_TOKEN: string;
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: 'development' | 'staging' | 'production';
    NEXT_PUBLIC_SENTRY_ENABLED: 'true' | 'false';
  }
}
