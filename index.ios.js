/**
 * React Native Email Link
 *
 * This file supports both iOS and Android.
 */

import { ActionSheetIOS, Alert, Linking } from "react-native";

class EmailException {
  constructor(message) {
    this.message = message;
    this.name = "EmailException";
  }
}

const prefixes = {
  appleMail: "message://",
  gmail: "googlegmail://",
  inbox: "inbox-gmail://",
  spark: "readdle-spark://",
  yahoo: "airmail://",
  outlook: "ms-outlook://"
};

const titles = {
  appleMail: "Mail",
  gmail: "Gmail",
  inbox: "Inbox",
  spark: "Spark",
  yahoo: "Yahoo",
  outlook: "Outlook"
};

/**
 * Check if a given mail app is installed.
 *
 * @param {string} app
 * @returns {Promise<boolean>}
 */
export function isAppInstalled(app) {
  return new Promise(resolve => {
    if (!(app in prefixes)) {
      return resolve(false);
    }

    Linking.canOpenURL(prefixes[app])
      .then(isSupported => {
        resolve(isSupported);
      })
      .catch(() => resolve(false));
  });
}

/**
 * Ask the user to choose one of the available mail apps.
 * @param title
 * @param message
 * @param cancelLabel
 * @returns {Promise<String|null>}
 */
export function askAppChoice(
  title = "Open mail app",
  message = "Which app would you like to open?",
  cancelLabel = "Cancel"
) {
  return new Promise(async resolve => {
    let availableApps = [];
    for (let app in prefixes) {
      let avail = await isAppInstalled(app);
      if (avail) {
        availableApps.push(app);
      }
    }
    if (availableApps.length < 2) {
      return resolve(availableApps[0] || null);
    }

    let options = availableApps.map(app => titles[app]);
    options.push(cancelLabel);

    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: title,
        message: message,
        options: options,
        cancelButtonIndex: options.length - 1
      },
      buttonIndex => {
        if (buttonIndex === options.length - 1) {
          return resolve(null);
        }
        return resolve(availableApps[buttonIndex]);
      }
    );

    return;
  });
}

/**
 * Open an email app, or let the user choose what app to open.
 *
 * @param {{
 *     app: string | undefined | null,
 *     title: string,
 *     message: string,
 *     cancelLabel: string,
 *     recipient: string | undefined | null,
 *     subject: string | undefined | null
 * }} options
 */
export async function openInbox(options = {}) {
  if (!options || typeof options !== "object") {
    throw new EmailException(
      "First parameter of `openInbox` should contain object with options."
    );
  }
  if (
    "app" in options &&
    options.app &&
    Object.keys(prefixes).indexOf(options.app) < 0
  ) {
    throw new EmailException(
      'Option `app` should be undefined, null, or one of the following: "' +
      Object.keys(prefixes).join('", "') +
      '".'
    );
  }

  let { app = null } = options;

  if (!app) {
    const { title, message, cancelLabel } = options;
    app = await askAppChoice(title, message, cancelLabel);
  }

  let url = null;

  if (app === "appleMail")
    url = prefixes[app] + "mailto:" + options.recipient + "?subject=" + options.subject;
  if (app === "gmail" || app === "inbox")
    url = prefixes[app] + "/co?to=" + options.recipient + "&subject=" + options.subject;
  if (app === "spark")
    url = prefixes[app] + "compose?recipient:" + options.recipient + "?subject=" + options.subject;
  if (app === "yahoo")
    url = prefixes[app] + "mail/compose?to:" + options.recipient + "?subject=" + options.subject;
  if (app === "outlook")
    url = prefixes[app] + "compose?to:" + options.recipient + "?subject=" + options.subject;
  else 
    url = prefixes[app];
    
  if (url) {
    return Linking.openURL(url);
  }
}
