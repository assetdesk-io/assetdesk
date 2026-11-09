"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { clsx } from "clsx";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/lib/query/hooks/useNotifications";
import { NotificationType } from "@/lib/api/notifications";

const TYPE_ICON: Record<NotificationType, React.ElementType> = {
  [NotificationType.INFO]: Info,
  [NotificationType.WARNING]: AlertTriangle,
  [NotificationType.ALERT]: AlertCircle,
};

const TYPE_COLOR: Record<NotificationType, string> = {
  [NotificationType.INFO]: "text-blue-500",
  [NotificationType.WARNING]: "text-yellow-500",
  [NotificationType.ALERT]: "text-red-500",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <Bell size={18} aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"
          />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 disabled:opacity-50 transition-colors"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={24} className="text-gray-200 mx-auto mb-2" aria-hidden="true" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = TYPE_ICON[n.type];
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      if (!n.isRead) markRead.mutate(n.id);
                    }}
                    className={clsx(
                      "w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3",
                      !n.isRead && "bg-blue-50/40",
                    )}
                  >
                    <span className={clsx("mt-0.5 flex-shrink-0", TYPE_COLOR[n.type])}>
                      <Icon size={15} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={clsx(
                          "text-sm leading-snug truncate",
                          n.isRead ? "text-gray-600 font-normal" : "text-gray-900 font-medium",
                        )}
                      >
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{n.message}</p>
                      )}
                      <p className="text-xs text-gray-300 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.isRead && (
                      <span
                        aria-label="Unread"
                        className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-blue-500"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
