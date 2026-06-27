import React from 'react';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useUnreadNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications';
import { NotificationDto } from '@/services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { getRoleDashboardPath } from '@/contexts/AuthContext';

/** Icon colour per notification type */
const typeColor = (type: string): string => {
  switch (type?.toUpperCase()) {
    case 'TEST_COMPLETED':
    case 'PRESCRIPTION_DISPENSED':
    case 'PAYMENT_RECEIVED':
    case 'RADIOLOGY_ORDER_COMPLETED':
      return 'bg-blue-500';
    case 'APPOINTMENT_CONFIRMED':
    case 'APPOINTMENT_COMPLETED':
      return 'bg-primary';
    case 'APPOINTMENT_CANCELLED':
    case 'BLOOD_REQUEST_CANCELLED':
    case 'TRANSFER_REQUEST_FAILED':
      return 'bg-destructive';
    case 'SYSTEM_ALERT':
      return 'bg-warning';
    case 'INVOICE_CREATED':
      return 'bg-accent';
    case 'CHARGE_ADDED':
      return 'bg-orange-500';
    case 'BLOOD_REQUEST_CREATED':
    case 'BLOOD_REQUEST_RESERVED':
    case 'BLOOD_REQUEST_COMPLETED':
      return 'bg-red-500';
    case 'TRANSFER_REQUEST_CREATED':
    case 'TRANSFER_REQUEST_SENT':
      return 'bg-orange-500';
    case 'RADIOLOGY_ORDER_CREATED':
      return 'bg-violet-500';
    default:
      return 'bg-primary';
  }
};

const NotificationBadge = () => {
  const { user } = useAuth();
  const { data: notifications = [], isLoading } = useUnreadNotifications(user?.id);
  const markAsRead    = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const unreadCount = notifications.length;

  // Build the "view all" path based on role
  const notifPath = user?.role === 'patient'
    ? '/patient/notifications'
    : `${getRoleDashboardPath(user?.role as never)}/notifications`;

  const handleMarkAsRead = (n: NotificationDto, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead.mutate(n.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">{unreadCount} new</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
              onClick={() => user?.id && markAllAsRead.mutate(user.id)}
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* List */}
        <ScrollArea className="max-h-[380px]">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-2.5 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n: NotificationDto) => (
                <div
                  key={n.id}
                  className={cn(
                    'flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50',
                    !n.read && 'bg-primary/5'
                  )}
                  onClick={(e) => handleMarkAsRead(n, e)}
                >
                  {/* Type dot */}
                  <div className={cn('h-2 w-2 rounded-full mt-2 shrink-0', typeColor(n.type))} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm font-medium leading-tight', !n.read && 'text-primary')}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <DropdownMenuSeparator />
        <div className="p-2">
          <Link to={notifPath}>
            <Button variant="ghost" size="sm" className="w-full gap-2 text-xs text-muted-foreground hover:text-foreground">
              <ExternalLink className="h-3.5 w-3.5" />
              View all notifications
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBadge;
