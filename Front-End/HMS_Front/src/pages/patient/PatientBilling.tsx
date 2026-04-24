import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Calendar, Bell, FileText, Pill, User, ClipboardList, Receipt, DollarSign, CreditCard, Eye, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/patient', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Appointments', path: '/patient/appointments', icon: <Calendar className="h-5 w-5" /> },
  { label: 'Prescriptions', path: '/patient/prescriptions', icon: <Pill className="h-5 w-5" /> },
  { label: 'Medical History', path: '/patient/history', icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Billing', path: '/patient/billing', icon: <Receipt className="h-5 w-5" /> },
  { label: 'Notifications', path: '/patient/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile', path: '/patient/profile', icon: <User className="h-5 w-5" /> },
];

const PatientBilling = () => {
  const { user } = useAuth();
  const { getPatientByUserId, getInvoicesByPatientId, getPaymentsByPatientId } = useData();

  const patient = user ? getPatientByUserId(user.id) : undefined;
  const invoices = patient ? getInvoicesByPatientId(patient.id) : [];
  const payments = patient ? getPaymentsByPatientId(patient.id) : [];

  const [selectedInvoice, setSelectedInvoice] = useState<(typeof invoices)[0] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const pendingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'partial');
  const paidInvoices = invoices.filter(i => i.status === 'paid');

  const totalDue = pendingInvoices.reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalBilled = invoices.reduce((sum, i) => sum + i.totalAmount, 0);

  const getSourceLabel = (source?: string) => {
    const map: Record<string, string> = {
      pharmacy: 'Pharmacy',
      lab: 'Lab Test',
      consultation: 'Consultation',
      other: 'Other',
    };
    return map[source ?? 'other'] ?? 'Other';
  };

  const getSourceColor = (source?: string) => {
    const map: Record<string, string> = {
      pharmacy: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      lab: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      consultation: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      other: 'bg-muted text-muted-foreground',
    };
    return map[source ?? 'other'] ?? 'bg-muted text-muted-foreground';
  };

  const getMethodIcon = (method: string) => {
    const map: Record<string, React.ReactNode> = {
      cash: <DollarSign className="h-4 w-4" />,
      card: <CreditCard className="h-4 w-4" />,
      insurance: <FileText className="h-4 w-4" />,
      bank_transfer: <Receipt className="h-4 w-4" />,
    };
    return map[method] ?? <DollarSign className="h-4 w-4" />;
  };

  return (
    <DashboardLayout navItems={navItems} title="Billing & Payments">
      <PageHeader
        title="Billing & Payments"
        description="View your invoices and payment history"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border-destructive/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Balance Due</p>
              <p className="text-2xl font-bold text-destructive">${totalDue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Billed</p>
              <p className="text-2xl font-bold">${totalBilled.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/10">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Unpaid
            {pendingInvoices.length > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {pendingInvoices.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="paid">Paid ({paidInvoices.length})</TabsTrigger>
          <TabsTrigger value="history">Payment History ({payments.length})</TabsTrigger>
        </TabsList>

        {/* Unpaid Invoices */}
        <TabsContent value="pending" className="space-y-3">
          {pendingInvoices.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-70" />
                <p className="font-medium">All clear! No outstanding balance.</p>
              </CardContent>
            </Card>
          ) : (
            pendingInvoices.map(invoice => (
              <Card key={invoice.id} className="border-l-4 border-l-destructive/60">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">Invoice #{invoice.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSourceColor(invoice.source)}`}>
                          {getSourceLabel(invoice.source)}
                        </span>
                        <StatusBadge status={invoice.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">Date: {invoice.date}</p>
                      <div className="flex gap-4 text-sm mt-2">
                        <span>Total: <strong>${invoice.totalAmount.toFixed(2)}</strong></span>
                        <span>Paid: <strong className="text-green-600">${invoice.paidAmount.toFixed(2)}</strong></span>
                        <span>Due: <strong className="text-destructive">${(invoice.totalAmount - invoice.paidAmount).toFixed(2)}</strong></span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedInvoice(invoice); setDialogOpen(true); }}>
                      <Eye className="h-4 w-4 mr-1" /> Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Paid Invoices */}
        <TabsContent value="paid" className="space-y-3">
          {paidInvoices.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No paid invoices yet.</p>
              </CardContent>
            </Card>
          ) : (
            paidInvoices.map(invoice => (
              <Card key={invoice.id} className="border-l-4 border-l-green-500/60">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">Invoice #{invoice.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSourceColor(invoice.source)}`}>
                          {getSourceLabel(invoice.source)}
                        </span>
                        <StatusBadge status={invoice.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">Date: {invoice.date}</p>
                      <p className="text-sm font-semibold text-green-600 mt-1">
                        Paid: ${invoice.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedInvoice(invoice); setDialogOpen(true); }}>
                      <Eye className="h-4 w-4 mr-1" /> Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Payment History */}
        <TabsContent value="history">
          {payments.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No payment history yet.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-4 divide-y">
                {payments.map(payment => (
                  <div key={payment.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-muted">
                        {getMethodIcon(payment.method)}
                      </div>
                      <div>
                        <p className="text-sm font-medium capitalize">{payment.method.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">{payment.date}</p>
                        {payment.notes && <p className="text-xs text-muted-foreground">{payment.notes}</p>}
                      </div>
                    </div>
                    <span className="font-bold text-green-600">+${payment.amount.toFixed(2)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Invoice Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invoice #{selectedInvoice?.id}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">{selectedInvoice.date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Source</p>
                  <p className="font-medium">{getSourceLabel(selectedInvoice.source)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <StatusBadge status={selectedInvoice.status} />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-sm">Items</h4>
                <div className="space-y-2">
                  {selectedInvoice.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 border rounded text-sm">
                      <div>
                        <p>{item.description}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                      </div>
                      <p className="font-medium">${item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-semibold">${selectedInvoice.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-semibold text-green-600">${selectedInvoice.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t pt-2">
                  <span>Balance Due</span>
                  <span className={selectedInvoice.totalAmount - selectedInvoice.paidAmount > 0 ? 'text-destructive' : 'text-green-600'}>
                    ${(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PatientBilling;
