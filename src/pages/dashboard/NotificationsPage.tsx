import { Helmet } from "react-helmet-async";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import type { NotificationType } from "@/types";

const typeColors: Record<NotificationType, string> = {
  booking: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  promo: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  system: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  reminder: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
};

export default function NotificationsPage() {
  const { data: notifications, isLoading, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  const handleMarkRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllAsRead.mutate();
  };

  return (
    <>
      <Helmet>
        <title>Notifications - Dream Go India</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h2>
            <p className="text-gray-500 dark:text-gray-400">
              {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="mr-1.5 h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  "transition-colors dark:border-gray-800 dark:bg-gray-900",
                  !notification.is_read && "border-primary/20 bg-primary/5",
                )}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      <Badge className={cn("border-0 text-xs capitalize", typeColors[notification.type])}>
                        {notification.type}
                      </Badge>
                      {!notification.is_read && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {notification.message}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                      {notification.link && (
                        <Link
                          to={notification.link}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          View details
                        </Link>
                      )}
                      {!notification.is_read && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(notification.id)}
                          className="text-xs font-medium text-gray-500 hover:text-primary"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center dark:border-gray-700">
            <Bell className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500 dark:text-gray-400">No notifications yet.</p>
          </div>
        )}
      </div>
    </>
  );
}
