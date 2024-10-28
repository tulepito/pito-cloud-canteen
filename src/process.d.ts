declare namespace NodeJS {
  export interface ProcessEnv {
    NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN: string;
    NEXT_PUBLIC_MIXPANEL_ENABLED: 'true' | 'false';
    NEXT_PUBLIC_MIXPANEL_DEBUG_ENABLED: 'true' | 'false';

    SENTRY_SOURCE_MAPS_ENABLED: 'true' | 'false';
    SENTRY_AUTH_TOKEN: string;
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: 'development' | 'staging' | 'production';
    NEXT_PUBLIC_SENTRY_ENABLED: 'true' | 'false';
  }
}
