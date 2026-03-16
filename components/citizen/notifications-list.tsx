"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, getStatusColor } from "@/lib/utils";
import { Bell, CheckCheck } from "lucide-react";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/app/citizen/actions";

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  complaints: {
    ticket_number: string;
    title: string;
    status: string;
  } | null;
}

interface NotificationsListProps {
  notifications: Notification[];
}

export function NotificationsList({ notifications }: NotificationsListProps) {
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function handleMarkRead(id: string) {
    await markNotificationRead(id);
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No notifications yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Mark All as Read
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={notification.is_read ? "opacity-60" : ""}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{notification.title}</h4>
                    {!notification.is_read && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  {notification.complaints && (
                    <div className="flex items-center gap-2 pt-2">
                      <Link
                        href={`/citizen/complaint/${notification.complaints.ticket_number}`}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {notification.complaints.ticket_number}
                      </Link>
                      <Badge
                        className={getStatusColor(notification.complaints.status)}
                      >
                        {notification.complaints.status.replace("-", " ")}
                      </Badge>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(notification.created_at)}
                  </p>
                </div>
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkRead(notification.id)}
                  >
                    Mark Read
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
