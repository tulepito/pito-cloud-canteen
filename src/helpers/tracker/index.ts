import mixpanel from 'mixpanel-browser';

const NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN =
  process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN;
const NEXT_PUBLIC_MIXPANEL_ENABLED =
  process.env.NEXT_PUBLIC_MIXPANEL_ENABLED === 'true';
const NEXT_PUBLIC_MIXPANEL_DEBUG_ENABLED =
  process.env.NEXT_PUBLIC_MIXPANEL_DEBUG_ENABLED === 'true';

type TrackerEventType =
  // Add the following event type here
  // -->
  | 'booker:order:randomly-suggest-menus'
  | 'booker:order:search-restaurants'
  | 'booker:order:add-emails'
  | 'booker:order:send-invitation-emails'
  | 'booker:order:place-order'
  | 'booker:order:purchase-order'
  | 'booker:orders:view'
  | 'booker:order:view'
  | 'booker:rating:create'
  | 'participant:foods:view'
  | 'participant:order:place'
  | 'participant:rating:create'
  | 'participant:food:ignore'
  | 'participant:food:randomly-suggest'
  | 'participant:foods:randomly-suggest';
// <--

class Tracker {
  private static _initMixpanel() {
    if (NEXT_PUBLIC_MIXPANEL_ENABLED) {
      console.info('Mixpanel init', 'Initialize Mixpanel');

      mixpanel.init(NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN, {
        debug: NEXT_PUBLIC_MIXPANEL_DEBUG_ENABLED,
        track_pageview: true,
        persistence: 'localStorage',
      });
    }
  }

  static init() {
    Tracker._initMixpanel();
  }

  private static _executeTracking(callback: (...args: any[]) => void) {
    if (NEXT_PUBLIC_MIXPANEL_ENABLED) {
      callback();
    }
  }

  private static async _track(
    eventName: string,
    params: Record<string, unknown>,
  ) {
    console.info('Tracker track', { eventName, params });
    Tracker._executeTracking(() => mixpanel.track(eventName, params));
  }

  // Add the following method here
  // -->
  static track(
    eventType: 'booker:order:randomly-suggest-menus',
    payload: {
      orderId: string;
      planId?: string;
      timestamp?: number;
    },
  ): void;
  static track(
    eventType: 'booker:order:search-restaurants',
    payload: {
      orderId: string;
      planId: string;
      timestamp: number;
    },
  ): void;
  static track(
    eventType: 'booker:order:add-emails',
    payload: {
      orderId: string;
      emails: string[];
    },
  ): void;
  static track(
    eventType: 'booker:order:send-invitation-emails',
    payload: {
      orderId: string;
    },
  ): void;
  static track(
    eventType: 'booker:order:place-order',
    payload: {
      orderId: string;
    },
  ): void;
  static track(
    eventType: 'booker:order:purchase-order',
    payload: {
      orderId: string;
    },
  ): void;
  static track(eventType: 'booker:orders:view', payload: {}): void;
  static track(
    eventType: 'booker:order:view',
    payload: {
      orderId: string;
    },
  ): void;
  static track(
    eventType: 'booker:rating:create',
    payload: {
      orderId: string;
      ratingScore: number;
      content: string;
    },
  ): void;
  static track(eventType: 'participant:foods:view', payload: {}): void;
  static track(
    eventType: 'participant:order:place',
    payload: {
      orderId: string;
    },
  ): void;
  static track(
    eventType: 'participant:rating:create',
    payload: {
      orderId: string;
      ratingScore: number;
      content: string;
    },
  ): void;
  static track(
    eventType: 'participant:food:ignore',
    payload: {
      orderId: string;
      timestamp: number;
    },
  ): void;
  static track(
    eventType: 'participant:food:randomly-suggest',
    payload: {
      orderId: string;
      timestamp: number;
    },
  ): void;
  static track(
    eventType: 'participant:foods:randomly-suggest',
    payload: {
      orderId: string;
    },
  ): void;
  // <--

  static track(
    eventType: TrackerEventType,
    payload: Record<string, any>,
  ): void {
    switch (eventType) {
      // Add the following case here
      // -->
      case 'booker:order:randomly-suggest-menus':
        Tracker._track('booker:order:randomly-suggest-menus', payload);
        break;
      case 'booker:order:search-restaurants':
        Tracker._track('booker:order:search-restaurants', payload);
        break;
      case 'booker:order:send-invitation-emails':
        Tracker._track('booker:order:send-invitation-emails', payload);
        break;
      case 'booker:order:place-order':
        Tracker._track('booker:order:place-order', payload);
        break;
      case 'booker:order:purchase-order':
        Tracker._track('booker:order:purchase-order', payload);
        break;
      case 'booker:orders:view':
        Tracker._track('booker:orders:view', payload);
        break;
      case 'booker:order:view':
        Tracker._track('booker:order:view', payload);
        break;
      case 'booker:rating:create':
        Tracker._track('booker:rating:create', payload);
        break;
      case 'participant:foods:view':
        Tracker._track('participant:foods:view', payload);
        break;
      case 'participant:order:place':
        Tracker._track('participant:order:place', payload);
        break;
      case 'participant:rating:create':
        Tracker._track('booker:rating:create', payload);
        break;
      case 'participant:food:ignore':
        Tracker._track('participant:food:ignore', payload);
        break;
      case 'participant:food:randomly-suggest':
        Tracker._track('participant:food:randomly-suggest', payload);
        break;
      case 'participant:foods:randomly-suggest':
        Tracker._track('participant:foods:randomly-suggest', payload);
        break;

      // <--
      default:
        break;
    }
  }

  static async setUser(user: { id: string; name: string; email: string }) {
    console.info('Tracker setUserId', user.id);

    Tracker._executeTracking(() => {
      mixpanel.identify(user.id);
      mixpanel.people.set({
        name: user.name,
        email: user.email,
      });
    });
  }

  static async removeUser() {
    console.info('Tracker removeUser', 'Remove user id from analytics');

    Tracker._executeTracking(() => mixpanel.reset());
  }
}

export default Tracker;
