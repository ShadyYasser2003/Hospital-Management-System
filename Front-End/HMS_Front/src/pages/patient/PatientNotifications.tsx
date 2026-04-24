import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Calendar, Pill, Bell, User, ClipboardList, CheckCircle, Info, AlertTriangle, XCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', path: '/patient', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Appointments', path: '/patient/appointments', icon: <Calendar className="h-5 w-5" /> },
  { label: 'Prescriptions', path: '/patient/prescriptions', icon: <Pill className="h-5 w-5" /> },
  { label: 'Medical History', path: '/patient/history', icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Notifications', path: '/patient/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile', path: '/patient/profile', icon: <User className="h-5 w-5" /> },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'success': return <CheckCircle className="h-5 w-5 text-success" />;
    case 'warning': return <AlertTriangle className="h-5 w-5 text-warning" />;
    case 'error': return <XCircle className="h-5 w-5 text-destructive" />;
    default: return <Info className="h-5 w-5 text-info" />;
  }
};

const PatientNotifications = () => {
  const { user } = useAuth();
  const { notifications, markNotificationRead, clearNotifications } = useData();

  const myNotifications = notifications
    .filter(n => n.userId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = myNotifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    myNotifications.forEach(n => { if (!n.read) markNotificationRead(n.id); });
  };

  const handleClearAll = () => {
    if (user) clearNotifications(user.id);
  };

  return (
    <DashboardLayout navItems={navItems} title="Notifications">
      <PageHeader
        title="Notifications"
        description={`You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        action={
          myNotifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" onClick={handleMarkAllRead}>
                  Mark All as Read
                </Button>
              )}
              <Button variant="outline" className="text-destructive hover:text-destructive gap-1" onClick={handleClearAll}>
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          )
        }
      />

      <div className="space-y-3 max-w-2xl">
        {myNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No notifications
            </CardContent>
          </Card>
        ) : (
          myNotifications.map(notification => (
            <Card
              key={notification.id}
              className={cn(!notification.read && "border-primary bg-primary/5")}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {getIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className={cn("font-medium", !notification.read && "text-primary")}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-auto p-0 text-primary"
                        onClick={() => markNotificationRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientNotifications;
