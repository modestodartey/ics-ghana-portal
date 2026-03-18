"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { AdminDevicesOverview } from "@/components/devices/admin-devices-overview";
import { AdminNotificationsList } from "@/components/notifications/admin-notifications-list";
import { AdminLocationOverview } from "@/components/tracking/admin-location-overview";
import { SectionCard } from "@/components/ui/section-card";
import { listManagedAccounts } from "@/services/accounts";
import { subscribeToAllDevices } from "@/services/devices";
import { subscribeToNotifications } from "@/services/notifications";
import { isLiveLocationRecord, subscribeToAllLocationRecords } from "@/services/tracking";
import type { ManagedAccountRecord } from "@/types/accounts";
import type { DeviceRecord } from "@/types/device";
import type { LocationRecord } from "@/types/location";
import type { NotificationRecord } from "@/types/notification";

function buildLatestLocationRecords(records: LocationRecord[]) {
  const latestByUser = new Map<string, LocationRecord>();

  for (const record of records) {
    if (!latestByUser.has(record.userUid)) {
      latestByUser.set(record.userUid, record);
    }
  }

  return Array.from(latestByUser.values());
}

export function AdminDashboardOverview() {
  const { status, user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [locationRecords, setLocationRecords] = useState<LocationRecord[]>([]);
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [accounts, setAccounts] = useState<ManagedAccountRecord[]>([]);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);
  const [locationsLoaded, setLocationsLoaded] = useState(false);
  const [devicesLoaded, setDevicesLoaded] = useState(false);
  const [accountsLoaded, setAccountsLoaded] = useState(false);

  useEffect(() => {
    const unsubscribeNotifications = subscribeToNotifications(
      (nextNotifications) => {
        setNotifications(nextNotifications);
        setNotificationsLoaded(true);
      },
      () => {
        setNotificationsLoaded(true);
      }
    );

    const unsubscribeLocations = subscribeToAllLocationRecords(
      (nextRecords) => {
        setLocationRecords(nextRecords);
        setLocationsLoaded(true);
      },
      () => {
        setLocationsLoaded(true);
      }
    );

    const unsubscribeDevices = subscribeToAllDevices(
      (nextDevices) => {
        setDevices(nextDevices);
        setDevicesLoaded(true);
      },
      () => {
        setDevicesLoaded(true);
      }
    );

    return () => {
      unsubscribeNotifications();
      unsubscribeLocations();
      unsubscribeDevices();
    };
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || user?.role !== "admin") {
      return;
    }

    setAccountsLoaded(false);

    void listManagedAccounts()
      .then((nextAccounts) => {
        setAccounts(nextAccounts);
        setAccountsError(null);
        setAccountsLoaded(true);
      })
      .catch((error) => {
        setAccounts([]);
        setAccountsError(error instanceof Error ? error.message : "Accounts could not be loaded right now.");
        setAccountsLoaded(true);
      });
  }, [status, user?.role]);

  const latestLocationRecords = useMemo(() => buildLatestLocationRecords(locationRecords), [locationRecords]);
  const liveSessionCount = useMemo(
    () => latestLocationRecords.filter((record) => isLiveLocationRecord(record)).length,
    [latestLocationRecords]
  );
  const activeAccountCount = useMemo(
    () => accounts.filter((account) => account.isActive).length,
    [accounts]
  );
  const staffAccountCount = useMemo(
    () => accounts.filter((account) => account.role === "staff").length,
    [accounts]
  );
  const missingDeviceCount = useMemo(
    () => devices.filter((device) => device.status === "missing").length,
    [devices]
  );

  function renderStatValue(value: number, isLoaded: boolean) {
    if (!isLoaded) {
      return "—";
    }

    return value.toString();
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SectionCard title="Total notifications" description="All sent notifications currently stored in the portal." className="bg-white/95">
          <p className="font-display text-3xl text-slate-900">{renderStatValue(notifications.length, notificationsLoaded)}</p>
        </SectionCard>
        <SectionCard title="Total accounts" description="Current portal users across student, staff, and admin roles." className="bg-white/95">
          <p className="font-display text-3xl text-slate-900">{renderStatValue(accounts.length, accountsLoaded)}</p>
        </SectionCard>
        <SectionCard title="Active live sessions" description="Users whose latest saved location still appears live right now." className="bg-white/95">
          <p className="font-display text-3xl text-slate-900">{renderStatValue(liveSessionCount, locationsLoaded)}</p>
        </SectionCard>
        <SectionCard title="Latest saved locations" description="Most recent saved location records grouped by user." className="bg-white/95">
          <p className="font-display text-3xl text-slate-900">{renderStatValue(latestLocationRecords.length, locationsLoaded)}</p>
        </SectionCard>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SectionCard title="Staff accounts" description="Supported staff records using the same portal workflow." className="bg-white/95">
          <p className="font-display text-3xl text-slate-900">{renderStatValue(staffAccountCount, accountsLoaded)}</p>
        </SectionCard>
        <SectionCard title="Registered devices" description="Student devices currently linked into Find My Device." className="bg-white/95">
          <p className="font-display text-3xl text-slate-900">{renderStatValue(devices.length, devicesLoaded)}</p>
        </SectionCard>
        <SectionCard title="Devices marked missing" description="Items that currently need follow-up from the student side." className="bg-white/95">
          <p className="font-display text-3xl text-slate-900">{renderStatValue(missingDeviceCount, devicesLoaded)}</p>
        </SectionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminNotificationsList variant="dashboard" limit={4} />
        <SectionCard
          title="Portal overview"
          description="Keep an eye on current account totals while the account-management feature stays turned off."
          className="bg-white/95"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-brand-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Active accounts</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{renderStatValue(activeAccountCount, accountsLoaded)}</p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Staff accounts</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{renderStatValue(staffAccountCount, accountsLoaded)}</p>
            </div>
          </div>

          {accountsError ? (
            <p className="mt-4 text-sm leading-6 text-red-700">{accountsError}</p>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Account creation and account-management tools are temporarily unavailable in the portal.
            </p>
          )}
        </SectionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminLocationOverview variant="dashboard" latestLimit={4} />
        <SectionCard
          title="Operations shortcuts"
          description="Jump quickly into the full workflows without stretching the dashboard into a long archive page."
          className="bg-gradient-to-br from-white to-brand-50"
        >
          <div className="grid gap-3">
            <Link
              href="/admin/notifications"
              className="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-700"
            >
              View all notifications
            </Link>
            <Link
              href="/admin/tracking"
              className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-5 py-3 text-sm font-semibold text-brand-700 hover:border-brand-500"
            >
              View all tracking history
            </Link>
            <Link
              href="/admin/devices"
              className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-5 py-3 text-sm font-semibold text-brand-700 hover:border-brand-500"
            >
              View all devices
            </Link>
            <Link
              href="/admin/audit"
              className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white px-5 py-3 text-sm font-semibold text-brand-700 hover:border-brand-500"
            >
              View audit log
            </Link>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <AdminDevicesOverview variant="dashboard" limit={3} />
        <SectionCard
          title="Admin workflow"
          description="Use the dedicated pages for deeper work, while the dashboard stays short and easy to scan."
          className="bg-white/95"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-brand-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Daily review</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Start with fresh notifications, live location sessions, and missing devices.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Full records</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Open the full pages when you need filters, history, and longer record views.
              </p>
            </div>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
