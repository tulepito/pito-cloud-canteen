declare namespace NodeJS {
  export interface ProcessEnv {
    NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN: string;
    NEXT_PUBLIC_MIXPANEL_ENABLED: 'true' | 'false';
    NEXT_PUBLIC_MIXPANEL_DEBUG_ENABLED: 'true' | 'false';
  }
}
