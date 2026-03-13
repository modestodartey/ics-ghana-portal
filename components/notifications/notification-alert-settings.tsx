"use client";

import { useNotificationAlerts } from "@/components/notifications/notification-alert-provider";

export function NotificationAlertSettings() {
  const { browserPermission, browserNotificationsReady, requestDesktopAlerts } = useNotificationAlerts();

  const isUnsupported = browserPermission === "unsupported";
  const isGranted = browserPermission === "granted";
  const isDenied = browserPermission === "denied";

  return (
    <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Desktop alerts</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {isUnsupported
              ? "This browser does not support desktop notifications."
              : isGranted
                ? "Desktop alerts are enabled for this browser."
                : isDenied
                  ? "Desktop alerts are blocked in this browser. You can change this in site settings."
                  : "Enable browser notifications if you would like visible desktop alerts while the portal is open."}
          </p>
          <p className="mt-2 text-xs leading-6 text-slate-500">
            {browserNotificationsReady
              ? "Web notification groundwork is ready for later Firebase Cloud Messaging setup."
              : "Basic browser alerts can work now, but full background push setup still needs Firebase Messaging configuration later."}
          </p>
        </div>

        {!isUnsupported && !isGranted ? (
          <button
            type="button"
            onClick={() => {
              void requestDesktopAlerts();
            }}
            className="inline-flex items-center justify-center rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-brand-700"
          >
            Enable desktop alerts
          </button>
        ) : null}
      </div>
    </div>
  );
}
