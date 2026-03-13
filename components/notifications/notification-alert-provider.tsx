"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useAuth } from "@/components/auth/auth-provider";
import {
  getBrowserNotificationPermission,
  prepareFirebaseMessagingGroundwork,
  requestBrowserNotificationPermission,
  showBrowserNotification,
  type BrowserNotificationPermissionState
} from "@/lib/notifications/browser-alerts";
import {
  canUserViewNotification,
  hasUserReadNotification,
  subscribeToNotifications
} from "@/services/notifications";
import type { NotificationRecord } from "@/types/notification";

type NotificationToastTone = "info" | "success" | "error";

type NotificationToast = {
  id: string;
  title: string;
  message: string;
  tone: NotificationToastTone;
};

type NotificationAlertContextValue = {
  unreadCount: number;
  browserPermission: BrowserNotificationPermissionState;
  browserNotificationsReady: boolean;
  requestDesktopAlerts: () => Promise<BrowserNotificationPermissionState>;
  pushToast: (toast: Omit<NotificationToast, "id">) => void;
};

const NotificationAlertContext = createContext<NotificationAlertContextValue | undefined>(undefined);

function buildPortalNotificationHref(role: "admin" | "student") {
  return role === "admin" ? "/admin#notifications" : "/student#notifications";
}

function getToastToneClasses(tone: NotificationToastTone) {
  switch (tone) {
    case "success":
      return "border-brand-200 bg-white text-slate-700";
    case "error":
      return "border-red-200 bg-white text-red-700";
    default:
      return "border-brand-100 bg-white text-slate-700";
  }
}

export function NotificationAlertProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [browserPermission, setBrowserPermission] = useState<BrowserNotificationPermissionState>("checking");
  const [browserNotificationsReady, setBrowserNotificationsReady] = useState(false);
  const [toasts, setToasts] = useState<NotificationToast[]>([]);
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());
  const hasLoadedVisibleNotificationsRef = useRef(false);

  useEffect(() => {
    setBrowserPermission(getBrowserNotificationPermission());

    prepareFirebaseMessagingGroundwork().then((result) => {
      setBrowserNotificationsReady(result.serviceWorkerRegistered && result.messagingSupported);
    });
  }, []);

  const pushToast = (toast: Omit<NotificationToast, "id">) => {
    const toastId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setToasts((currentToasts) => [...currentToasts, { id: toastId, ...toast }]);

    window.setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((currentToast) => currentToast.id !== toastId));
    }, 5000);
  };

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      seenNotificationIdsRef.current = new Set();
      hasLoadedVisibleNotificationsRef.current = false;
      return;
    }

    const unsubscribe = subscribeToNotifications(
      (nextNotifications) => {
        const visibleNotifications = nextNotifications.filter((notification) => canUserViewNotification(notification, user));
        const unreadVisibleNotifications = visibleNotifications.filter(
          (notification) => !hasUserReadNotification(notification, user.uid)
        );

        setUnreadCount(unreadVisibleNotifications.length);

        if (!hasLoadedVisibleNotificationsRef.current) {
          seenNotificationIdsRef.current = new Set(visibleNotifications.map((notification) => notification.id));
          hasLoadedVisibleNotificationsRef.current = true;
          return;
        }

        const newNotifications = visibleNotifications.filter(
          (notification) =>
            !seenNotificationIdsRef.current.has(notification.id) && notification.createdByUid !== user.uid
        );

        seenNotificationIdsRef.current = new Set(visibleNotifications.map((notification) => notification.id));

        newNotifications.forEach((notification) => {
          pushToast({
            title: "New notification",
            message: notification.title,
            tone: "info"
          });

          if (browserPermission === "granted" && typeof document !== "undefined" && document.visibilityState === "hidden") {
            showBrowserNotification(notification.title, {
              body: notification.body,
              tag: `notification-${notification.id}`
            });
          }
        });
      },
      (message) => {
        pushToast({
          title: "Notifications unavailable",
          message,
          tone: "error"
        });
      }
    );

    return unsubscribe;
  }, [browserPermission, user]);

  async function handleRequestDesktopAlerts() {
    const permission = await requestBrowserNotificationPermission();
    setBrowserPermission(permission);

    if (permission === "granted") {
      pushToast({
        title: "Desktop alerts enabled",
        message: "Browser notifications are now allowed for this portal.",
        tone: "success"
      });
    }

    if (permission === "denied") {
      pushToast({
        title: "Desktop alerts blocked",
        message: "Browser notifications were blocked. You can change this later in browser site settings.",
        tone: "error"
      });
    }

    return permission;
  }

  const value = useMemo<NotificationAlertContextValue>(
    () => ({
      unreadCount,
      browserPermission,
      browserNotificationsReady,
      requestDesktopAlerts: handleRequestDesktopAlerts,
      pushToast
    }),
    [browserNotificationsReady, browserPermission, unreadCount]
  );

  return (
    <NotificationAlertContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-4 z-[70] flex flex-col gap-3 sm:left-auto sm:right-4 sm:w-full sm:max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-[1.35rem] border px-4 py-3 shadow-soft backdrop-blur ${getToastToneClasses(
              toast.tone
            )}`}
          >
            <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
            <p className="mt-1 text-sm leading-6">{toast.message}</p>
            {user ? (
              <a
                href={buildPortalNotificationHref(user.role)}
                className="mt-2 inline-flex text-xs font-semibold uppercase tracking-[0.16em] text-brand-700"
              >
                View notifications
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </NotificationAlertContext.Provider>
  );
}

export function useNotificationAlerts() {
  const context = useContext(NotificationAlertContext);

  if (!context) {
    throw new Error("useNotificationAlerts must be used inside NotificationAlertProvider.");
  }

  return context;
}
