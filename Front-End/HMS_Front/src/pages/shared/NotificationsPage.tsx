import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import {
  useAllNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '@/hooks/useNotifications';
import { NotificationDto } from '@/services/notificationService';
import {
  Bell, CheckCircle2, AlertTriangle, XCircle, Info,
  Calendar, FlaskConical, Receipt, Pill, CheckCheck, Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface NotificationsPageProps {
  navItems: NavItem[];
}

/** Map notification type → icon + colour */
const getTypeConfig = (type: string) => {
  switch (type?.toUpperCase()) {
    case 'TEST_ASSIGNED':
      return { icon: <FlaskConical className="h-5 w-5" />, color: 'text-primary', bg: 'bg-primary/10' };
    case 'TEST_COMPLETED':
      return { icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' };
    case 'APPOINTMENT_REMINDER':
    case 'APPOINTMENT_CONFIRMED':
      return { icon: <Calendar className="h-5 w-5" />, color: 'text-primary', bg: 'bg-primary/10' };
    case 'APPOINTMENT_CANCELLED':
      return { icon: <XCircle className="h-5 w-5" />, color: 'text-destructive', bg: 'bg-destructive/10' };
    case 'INVOICE_CREATED':
      return { icon: <Receipt className="h-5 w-5" />, color: 'text-accent', bg: 'bg-accent/10' };
    case 'PAYMENT_RECEIVED':
      return { icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' };
    case 'PRESCRIPTION_CREATED':
    case 'PRESCRIPTION_DISPENSED':
      return { icon: <Pill className="h-5 w-5" />, color: 'text-primary', bg: 'bg-primary/10' };
    case 'SYSTEM_ALERT':
      return { icon: <AlertTriangle className="h-5 w-5" />, color: 'text-warning', bg: 'bg-warning/10' };
    default:
      return { icon: <Info className="h-5 w-5" />, color: 'text-muted-foreground', bg: 'bg-muted' };
  }
};

const NotificationCard = ({
  n,
  onMarkRead,
  onDelete,
}: {
  n: NotificationDto;
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
}) => {
  const { icon, color, bg } = getTypeConfig(n.type);

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        !n.read && 'border-primary/40 shadow-sm bg-primary/[0.02]'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn('p-2.5 rounded-xl shrink-0', bg)}>
            <span className={color}>{icon}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className={cn('font-semibold text-sm', !n.read && 'text-primary')}>
                    {n.title}
                  </h4>
                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                <p className="text-xs text-muted-foreground/70 mt-2">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  {' · '}
                  {new Date(n.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {!n.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-primary hover:text-primary"
                    onClick={() => onMarkRead(n.id)}
                  >
                    Mark read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(n.id)}
                  aria-label="Delete notification"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const NotificationsPage: React.FC<NotificationsPageProps> = ({ navItems }) => {
  const { user } = useAuth();
  const { data: all = [], isLoading } = useAllNotifications(user?.id);
  const markAsRead    = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotif   = useDeleteNotification();
  const unread = all.filter(n => !n.read);
  const read   = all.filter(n => n.read);

  return (
    <DashboardLayout navItems={navItems} title="Notifications">
      <PageHeader
        title="Notifications"
        description={
          unread.length > 0
            ? `${unread.length} unread notification${unread.length !== 1 ? 's' : ''}`
            : 'All caught up!'
        }
        action={
          unread.length > 0 ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => user?.id && markAllAsRead.mutate(user.id)}
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      {isLoading && (
        <div className="space-y-3 max-w-2xl">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4 animate-pulse">
                  <div className="h-10 w-10 rounded-xl bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && (
        <Tabs defaultValue="unread" className="max-w-2xl">
          <TabsList className="mb-4">
            <TabsTrigger value="unread" className="gap-2">
              Unread
              {unread.length > 0 && (
                <Badge variant="destructive" className="text-xs">{unread.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              All
              <Badge variant="secondary" className="text-xs">{all.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unread">
            {unread.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-14 text-muted-foreground">
                  <Bell className="h-10 w-10 mb-3 opacity-25" />
                  <p className="font-medium">No unread notifications</p>
                  <p className="text-sm mt-1">You're all caught up!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {unread.map(n => (
                  <NotificationCard
                    key={n.id}
                    n={n}
                    onMarkRead={(id) => markAsRead.mutate(id)}
                    onDelete={(id) => deleteNotif.mutate(id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            {all.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-14 text-muted-foreground">
                  <Bell className="h-10 w-10 mb-3 opacity-25" />
                  <p className="font-medium">No notifications yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {all.map(n => (
                  <NotificationCard
                    key={n.id}
                    n={n}
                    onMarkRead={(id) => markAsRead.mutate(id)}
                    onDelete={(id) => deleteNotif.mutate(id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </DashboardLayout>
  );
};

export default NotificationsPage;
