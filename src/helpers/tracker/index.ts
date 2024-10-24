/* eslint-disable no-underscore-dangle */
import mixpanel from 'mixpanel-browser';

// eslint-disable-next-line prefer-destructuring
const NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN =
  process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN;
const NEXT_PUBLIC_MIXPANEL_ENABLED =
  process.env.NEXT_PUBLIC_MIXPANEL_ENABLED === 'true';
const NEXT_PUBLIC_MIXPANEL_DEBUG_ENABLED =
  process.env.NEXT_PUBLIC_MIXPANEL_DEBUG_ENABLED === 'true';

type TrackerEventType =
  // Add the following event type here
  // -->
  'Login';
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // <--

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static track(eventType: TrackerEventType): void {
    switch (eventType) {
      // Add the following case here
      // -->
      case 'Login':
        Tracker._track('Login', {});
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
