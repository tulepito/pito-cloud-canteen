/* eslint-disable import/prefer-default-export */
/* eslint-disable no-undef */
/* eslint-disable func-names */
/* eslint-disable no-use-before-define */
/* eslint-disable prefer-spread */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable radix */
// this function accepts a callback function as params.callback that will be called with the command results
// if a callback is not provided it returns a promise that will resolve with the command results
export function addCommandCallback(command, params, persistCallback) {
  if (params && (params.callback || params.callbackFunction)) {
    // execute command with provided callback function
    addCommand(command, params, persistCallback);
  } else {
    // create a temporary function and return a promise that executes command
    const tempFunctionName = `_gonative_temp_${Math.random()
      .toString(36)
      .slice(2)}`;
    if (!params) params = {};
    params.callback = tempFunctionName;

    return new Promise(function (resolve, reject) {
      // declare a temporary function
      window[tempFunctionName] = function (data) {
        resolve(data);
        delete window[tempFunctionName];
      };
      // execute command
      addCommand(command, params);
    });
  }
}

function addCallbackFunction(callbackFunction, persistCallback) {
  let callbackName;
  if (typeof callbackFunction === 'string') {
    callbackName = callbackFunction;
  } else {
    callbackName = `_gonative_temp_${Math.random().toString(36).slice(2)}`;
    window[callbackName] = function (...args) {
      callbackFunction.apply(null, args);
      if (!persistCallback) {
        // if callback is used just once
        delete window[callbackName];
      }
    };
  }

  return callbackName;
}

export function addCommand(command, params, persistCallback) {
  let commandObject;
  if (params) {
    commandObject = {};
    if (params.callback && typeof params.callback === 'function') {
      params.callback = addCallbackFunction(params.callback, persistCallback);
    }
    if (
      params.callbackFunction &&
      typeof params.callbackFunction === 'function'
    ) {
      params.callbackFunction = addCallbackFunction(
        params.callbackFunction,
        persistCallback,
      );
    }
    if (params.statuscallback && typeof params.statuscallback === 'function') {
      params.statuscallback = addCallbackFunction(
        params.statuscallback,
        persistCallback,
      );
    }
    commandObject.medianCommand = command;
    commandObject.data = params;
  } else commandObject = command;

  // Begin changes
  // 1. Comment out or delete the following iOS specific method
  // window.webkit.messageHandlers.JSBridge.postMessage(commandObject);

  // 2. Add the following to provide compatibility for both iOS and Android
  if (navigator.vendor === 'Apple Computer, Inc.') {
    window?.webkit?.messageHandlers?.JSBridge?.postMessage(commandObject);
  } else window?.JSBridge?.postMessage(commandObject);

  // End of changes
}

/// ////////////////////////////
/// /    General Commands   ////
/// ////////////////////////////

export const gonative = {};

// to be modified as required
gonative.nativebridge = {
  custom(params) {
    addCommand('gonative://nativebridge/custom', params);
  },
  multi(params) {
    addCommand('gonative://nativebridge/multi', params);
  },
};

gonative.registration = {
  send(customData) {
    const params = { customData };
    addCommand('gonative://registration/send', params);
  },
};

gonative.sidebar = {
  setItems(params) {
    addCommand('gonative://sidebar/setItems', params);
  },
  getItems(params) {
    return addCommandCallback('gonative://sidebar/getItems', params);
  },
};

gonative.tabNavigation = {
  selectTab(tabIndex) {
    addCommand(`gonative://tabs/select/${tabIndex}`);
  },
  deselect() {
    addCommand('gonative://tabs/deselect');
  },
  setTabs(tabs) {
    addCommand('gonative://tabs/setTabs', { tabs });
  },
};

gonative.share = {
  sharePage(params) {
    addCommand('gonative://share/sharePage', params);
  },
  downloadFile(params) {
    addCommand('gonative://share/downloadFile', params);
  },
  downloadImage(params) {
    addCommand('gonative://share/downloadImage', params);
  },
};

gonative.open = {
  appSettings() {
    addCommand('gonative://open/app-settings');
  },
};

gonative.webview = {
  clearCache() {
    addCommand('gonative://webview/clearCache');
  },
  clearCookies() {
    addCommand('gonative://webview/clearCookies');
  },
  reload() {
    addCommand('gonative://webview/reload');
  },
};

gonative.webconsolelogs = {
  print(params) {
    addCommand('gonative://webconsolelogs/print', params);
  },
};

gonative.config = {
  set(params) {
    addCommand('gonative://config/set', params);
  },
};

gonative.navigationTitles = {
  set(parameters) {
    const params = {
      persist: parameters.persist,
      data: parameters,
    };
    addCommand('gonative://navigationTitles/set', params);
  },
  setCurrent(params) {
    addCommand('gonative://navigationTitles/setCurrent', params);
  },
  revert() {
    addCommand('gonative://navigationTitles/set?persist=true');
  },
};

gonative.navigationLevels = {
  set(parameters) {
    const params = {
      persist: parameters.persist,
      data: parameters,
    };
    addCommand('gonative://navigationLevels/set', params);
  },
  setCurrent(params) {
    addCommand('gonative://navigationLevels/set', params);
  },
  revert() {
    addCommand('gonative://navigationLevels/set?persist=true');
  },
};

gonative.statusbar = {
  set(params) {
    addCommand('gonative://statusbar/set', params);
  },
  matchBodyBackgroundColor(params) {
    addCommand('gonative://statusbar/matchBodyBackgroundColor', params);
  },
};

gonative.screen = {
  setBrightness(data) {
    let params = data;
    if (typeof params === 'number') {
      params = { brightness: data };
    }
    addCommand('gonative://screen/setBrightness', params);
  },
  setMode(params) {
    if (params.mode) {
      addCommand('gonative://screen/setMode', params);
    }
  },
  keepScreenOn(params) {
    addCommand('gonative://screen/keepScreenOn', params);
  },
  keepScreenNormal() {
    addCommand('gonative://screen/keepScreenNormal');
  },
};

gonative.navigationMaxWindows = {
  set(maxWindows, autoClose) {
    const params = {
      data: maxWindows,
      autoClose,
      persist: true,
    };
    addCommand('gonative://navigationMaxWindows/set', params);
  },
  setCurrent(maxWindows, autoClose) {
    const params = { data: maxWindows, autoClose };
    addCommand('gonative://navigationMaxWindows/set', params);
  },
};

gonative.connectivity = {
  get(params) {
    return addCommandCallback('gonative://connectivity/get', params);
  },
  subscribe(params) {
    return addCommandCallback(
      'gonative://connectivity/subscribe',
      params,
      true,
    );
  },
  unsubscribe() {
    addCommand('gonative://connectivity/unsubscribe');
  },
};

gonative.run = {
  deviceInfo() {
    addCommand('gonative://run/gonative_device_info');
  },
};

gonative.deviceInfo = function (params) {
  return addCommandCallback(
    'gonative://run/gonative_device_info',
    params,
    true,
  );
};

gonative.internalExternal = {
  set(params) {
    addCommand('gonative://internalExternal/set', params);
  },
};

gonative.clipboard = {
  set(params) {
    addCommand('gonative://clipboard/set', params);
  },
  get(params) {
    return addCommandCallback('gonative://clipboard/get', params);
  },
};

gonative.window = {
  open(urlString) {
    const params = { url: urlString };
    addCommand('gonative://window/open', params);
  },
  close() {
    addCommand('gonative://window/close');
  },
};

/// ////////////////////////////
/// /     iOS Exclusive     ////
/// ////////////////////////////

gonative.ios = {};

gonative.ios.window = {
  open(urlString) {
    const params = { url: urlString };
    addCommand('gonative://window/open', params);
  },
  setWindowOpenHideNavbar(value) {
    const params = { windowOpenHideNavbar: value };
    addCommand('gonative://window/setWindowOpenHideNavbar', params);
  },
};

gonative.ios.geoLocation = {
  requestLocation() {
    addCommand('gonative://geolocationShim/requestLocation');
  },
  startWatchingLocation() {
    addCommand('gonative://geolocationShim/startWatchingLocation');
  },
  stopWatchingLocation() {
    addCommand('gonative://geolocationShim/stopWatchingLocation');
  },
};

gonative.ios.attconsent = {
  request(params) {
    return addCommandCallback('gonative://ios/attconsent/request', params);
  },
  status(params) {
    return addCommandCallback('gonative://ios/attconsent/status', params);
  },
};

gonative.ios.backgroundAudio = {
  start() {
    addCommand('gonative://backgroundAudio/start');
  },
  end() {
    addCommand('gonative://backgroundAudio/end');
  },
};

gonative.ios.contextualNavToolbar = {
  set(params) {
    addCommand('gonative://ios/contextualNavToolbar/set', params);
  },
};

/// ////////////////////////////
/// /   Android Exclusive   ////
/// ////////////////////////////

gonative.android = {};

gonative.android.geoLocation = {
  promptAndroidLocationServices() {
    addCommand('gonative://geoLocation/promptAndroidLocationServices');
  },
};

gonative.android.screen = {
  fullscreen() {
    addCommand('gonative://screen/fullscreen');
  },
  normal() {
    addCommand('gonative://screen/normal');
  },
  keepScreenOn() {
    addCommand('gonative://screen/keepScreenOn');
  },
  keepScreenNormal() {
    addCommand('gonative://screen/keepScreenNormal');
  },
};

gonative.android.audio = {
  requestFocus(enabled) {
    const params = { enabled };
    addCommand('gonative://audio/requestFocus', params);
  },
};

/// ///////////////////////////////////
/// /   Webpage Helper Functions   ////
/// ///////////////////////////////////

function gonative_match_statusbar_to_body_background_color() {
  let rgb = window
    .getComputedStyle(document.body, null)
    .getPropertyValue('background-color');
  const sep = rgb.indexOf(',') > -1 ? ',' : ' ';
  rgb = rgb
    .substring(rgb.indexOf('(') + 1)
    .split(')')[0]
    .split(sep)
    .map(function (x) {
      return x * 1;
    });
  if (rgb.length === 4) {
    rgb = rgb.map(function (x) {
      return parseInt(x * rgb[3]);
    });
  }
  const hex = `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1]
    .toString(16)
    .padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`;
  const luma = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]; // per ITU-R BT.709
  if (luma > 40) {
    gonative.statusbar.set({ style: 'dark', color: hex });
  } else {
    gonative.statusbar.set({ style: 'light', color: hex });
  }
}

/// ////////////////////////////
/// /    Median Functions   ////
/// ////////////////////////////

const median = {};

median.keyboard = {
  info() {
    return addCommandCallback('median://keyboard/info');
  },
  listen(callback) {
    addCommand('median://keyboard/listen', { callback });
  },
};

// onesignal
gonative.onesignal = {
  run: {
    onesignalInfo() {
      addCommand('gonative://run/gonative_onesignal_info');
    },
  },
  onesignalInfo(params) {
    return addCommandCallback(
      'gonative://run/gonative_onesignal_info',
      params,
      true,
    );
  },
  register() {
    addCommand('gonative://onesignal/register');
  },
  userPrivacyConsent: {
    grant() {
      addCommand('gonative://onesignal/userPrivacyConsent/grant');
    },
    revoke() {
      addCommand('gonative://onesignal/userPrivacyConsent/revoke');
    },
  },
  tags: {
    getTags(params) {
      return addCommandCallback('gonative://onesignal/tags/get', params);
    },
    setTags(params) {
      addCommand('gonative://onesignal/tags/set', params);
    },
    deleteTags(params) {
      addCommand('gonative://onesignal/tags/delete', params);
    },
  },
  showTagsUI() {
    addCommand('gonative://onesignal/showTagsUI');
  },
  promptLocation() {
    addCommand('gonative://onesignal/promptLocation');
  },
  iam: {
    addTrigger(triggers) {
      if (triggers) {
        const keyLocal = Object.keys(triggers)[0];
        const params = {
          key: keyLocal,
          value: triggers[keyLocal],
        };
        addCommand('gonative://onesignal/iam/addTrigger', params);
      }
    },
    addTriggers(params) {
      addCommand('gonative://onesignal/iam/addTriggers', params);
    },
    removeTriggerForKey(key) {
      const params = { key };
      addCommand('gonative://onesignal/iam/removeTriggerForKey', params);
    },
    getTriggerValueForKey(key) {
      const params = { key };
      addCommand('gonative://onesignal/iam/getTriggerValueForKey', params);
    },
    pauseInAppMessages() {
      addCommand('gonative://onesignal/iam/pauseInAppMessages?pause=true');
    },
    resumeInAppMessages() {
      addCommand('gonative://onesignal/iam/pauseInAppMessages?pause=false');
    },
    setInAppMessageClickHandler(handler) {
      const params = { handler };
      addCommand(
        'gonative://onesignal/iam/setInAppMessageClickHandler',
        params,
      );
    },
  },
  externalUserId: {
    set(params) {
      addCommand('gonative://onesignal/externalUserId/set', params);
    },
    remove() {
      addCommand('gonative://onesignal/externalUserId/remove');
    },
  },
  enableForegroundNotifications(enabled) {
    addCommand('gonative://onesignal/enableForegroundNotifications', {
      enabled,
    });
  },
};
