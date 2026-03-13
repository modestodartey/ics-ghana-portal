export type BrowserNotificationPermissionState = NotificationPermission | "checking" | "unsupported";

type BrowserNotificationOptions = {
  body: string;
  tag: string;
};

export function getBrowserNotificationPermission(): BrowserNotificationPermissionState {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return "unsupported";
  }

  return Notification.permission;
}

export async function requestBrowserNotificationPermission() {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return "unsupported" as const;
  }

  return Notification.requestPermission();
}

export function showBrowserNotification(title: string, options: BrowserNotificationOptions) {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return null;
  }

  if (Notification.permission !== "granted") {
    return null;
  }

  return new Notification(title, {
    body: options.body,
    tag: options.tag,
    icon: "/ics-ghana-logo.svg"
  });
}

export async function prepareFirebaseMessagingGroundwork() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return {
      serviceWorkerRegistered: false,
      messagingSupported: false
    };
  }

  let serviceWorkerRegistered = false;
  let messagingSupported = false;

  try {
    await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    serviceWorkerRegistered = true;
  } catch {
    serviceWorkerRegistered = false;
  }

  try {
    const messagingModule = await import("firebase/messaging");
    messagingSupported = await messagingModule.isSupported();
  } catch {
    messagingSupported = false;
  }

  return {
    serviceWorkerRegistered,
    messagingSupported
  };
}
