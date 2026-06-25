import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { usePatients } from '@/hooks/usePatients';
import { useInvoicesByPatient, usePaymentsByPatient } from '@/hooks/useInvoices';
import { InvoiceDto, PaymentDto } from '@/services/invoiceService';
import invoiceService from '@/services/invoiceService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  LayoutDashboard, Calendar, Bell, Pill, User, ClipboardList,
  Receipt, DollarSign, CreditCard, Eye, CheckCircle, AlertCircle,
  Clock, Banknote, Globe, ExternalLink,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard',       path: '/patient',               icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Appointments',    path: '/patient/appointments',  icon: <Calendar className="h-5 w-5" /> },
  { label: 'Prescriptions',   path: '/patient/prescriptions', icon: <Pill className="h-5 w-5" /> },
  { label: 'Medical History', path: '/patient/history',       icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Billing',         path: '/patient/billing',       icon: <Receipt className="h-5 w-5" /> },
  { label: 'Notifications',   path: '/patient/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile',         path: '/patient/profile',       icon: <User className="h-5 w-5" /> },
];

// ── Payment method badge ──────────────────────────────────────────────────────
const MethodBadge = ({ method }: { method?: string }) => {
  const m = method?.toUpperCase();
  if (m === 'PAYPAL')  return <Badge className="bg-[#003087] text-white text-xs">PayPal</Badge>;
  if (m === 'KASHIER') return <Badge className="bg-emerald-600 text-white text-xs">Kashier</Badge>;
  if (m === 'CASH')    return <Badge variant="secondary" className="text-xs">Cash</Badge>;
  return <Badge variant="outline" className="text-xs">{method || '—'}</Badge>;
};

const PatientBilling = () => {
  const { user } = useAuth();
  const { data: patients = [] } = usePatients();
  const patient = patients.find(p => String(p.id) === user?.id || p.nationalId === user?.nationalId);

  const { data: invoices = [],  isLoading: loadingInvoices } = useInvoicesByPatient(patient?.id);
  const { data: payments = [],  isLoading: loadingPayments } = usePaymentsByPatient(patient?.id);

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(null);
  const [detailOpen,  setDetailOpen]  = useState(false);
  const [payOpen,     setPayOpen]     = useState(false);
  const [redirecting, setRedirecting] = useState<'paypal' | 'kashier' | null>(null);

  const pending = invoices.filter(i => ['PENDING', 'PARTIAL'].includes(i.status?.toUpperCase()));
  const paid    = invoices.filter(i => i.status?.toUpperCase() === 'PAID');

  const totalDue    = pending.reduce((s, i) => s + (i.balance ?? 0), 0);
  const totalPaid   = payments.reduce((s, p) => s + (p.amount ?? 0), 0);
  const totalBilled = invoices.reduce((s, i) => s + (i.totalAmount ?? 0), 0);

  const isLoading = loadingInvoices || loadingPayments;

  const openPay = (inv: InvoiceDto) => {
    setSelectedInvoice(inv);
    setRedirecting(null);
    setPayOpen(true);
  };

  const handleOnline = async (gateway: 'paypal' | 'kashier') => {
    if (!selectedInvoice) return;
    setRedirecting(gateway);
    try {
      const url = gateway === 'paypal'
        ? await invoiceService.payWithPaypal(selectedInvoice.id, selectedInvoice.balance ?? selectedInvoice.totalAmount)
        : await invoiceService.payWithKashier(selectedInvoice.id, selectedInvoice.balance ?? selectedInvoice.totalAmount);
      window.location.href = url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Payment gateway error');
      setRedirecting(null);
    }
  };

  if (isLoading) return (
    <DashboardLayout navItems={navItems} title="Billing & Payments">
      <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout navItems={navItems} title="Billing & Payments">
      <PageHeader title="Billing & Payments" description="View your invoices and pay online" />

      {/* Summary cards */}
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

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Unpaid
            {pending.length > 0 && (
              <span className="ml-1 bg-destructive text-destructive-foreground text-xs rounded-full px-1.5">
                {pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="paid">Paid ({paid.length})</TabsTrigger>
          <TabsTrigger value="history">History ({payments.length})</TabsTrigger>
        </TabsList>

        {/* ── Unpaid ── */}
        <TabsContent value="pending" className="space-y-3">
          {pending.length === 0
            ? (
              <Card>
                <CardContent className="p-10 text-center text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500 opacity-70" />
                  <p>No outstanding balance. You're all caught up!</p>
                </CardContent>
              </Card>
            )
            : pending.map(inv => (
              <Card key={inv.id} className="border-l-4 border-l-destructive/60">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{inv.invoiceNumber}</span>
                        <StatusBadge status={inv.status?.toLowerCase() as never} />
                      </div>
                      <p className="text-xs text-muted-foreground">{inv.createdAt?.split('T')[0]}</p>
                      <div className="flex gap-4 text-sm mt-1">
                        <span>Total: <strong>${inv.totalAmount?.toFixed(2)}</strong></span>
                        <span>Paid: <strong className="text-green-600">${inv.paidAmount?.toFixed(2)}</strong></span>
                        <span>Due: <strong className="text-destructive">${inv.balance?.toFixed(2)}</strong></span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button variant="outline" size="sm"
                        onClick={() => { setSelectedInvoice(inv); setDetailOpen(true); }}>
                        <Eye className="h-4 w-4 mr-1" />Details
                      </Button>
                      {(inv.balance ?? 0) > 0 && (
                        <Button size="sm" className="bg-primary gap-1.5"
                          onClick={() => openPay(inv)}>
                          <DollarSign className="h-3.5 w-3.5" />Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          }
        </TabsContent>

        {/* ── Paid ── */}
        <TabsContent value="paid" className="space-y-3">
          {paid.length === 0
            ? <Card><CardContent className="p-10 text-center text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>No paid invoices yet.</p>
              </CardContent></Card>
            : paid.map(inv => (
              <Card key={inv.id} className="border-l-4 border-l-green-500/60">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{inv.invoiceNumber}</span>
                        <StatusBadge status="paid" />
                      </div>
                      <p className="text-xs text-muted-foreground">{inv.createdAt?.split('T')[0]}</p>
                      <p className="text-sm font-semibold text-green-600">
                        Paid: ${inv.totalAmount?.toFixed(2)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm"
                      onClick={() => { setSelectedInvoice(inv); setDetailOpen(true); }}>
                      <Eye className="h-4 w-4 mr-1" />Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          }
        </TabsContent>

        {/* ── Payment History ── */}
        <TabsContent value="history">
          {payments.length === 0
            ? <Card><CardContent className="p-10 text-center text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No payment history yet.</p>
              </CardContent></Card>
            : (
              <Card>
                <CardContent className="pt-4 divide-y">
                  {payments.map((p: PaymentDto) => (
                    <div key={p.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <MethodBadge method={p.paymentMethod} />
                        <div>
                          <p className="text-xs text-muted-foreground">{p.paidAt?.split('T')[0]}</p>
                          {p.notes && <p className="text-xs text-muted-foreground">{p.notes}</p>}
                          {p.referenceNumber && (
                            <p className="text-xs text-muted-foreground">Ref: {p.referenceNumber}</p>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-green-600">+${p.amount?.toFixed(2)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          }
        </TabsContent>
      </Tabs>

      {/* ── Invoice Detail Dialog ── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{selectedInvoice?.invoiceNumber}</DialogTitle></DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg text-sm">
                <div><p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{selectedInvoice.createdAt?.split('T')[0]}</p></div>
                <div><p className="text-muted-foreground">Status</p>
                  <StatusBadge status={selectedInvoice.status?.toLowerCase() as never} /></div>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-sm">Items</h4>
                <div className="space-y-2">
                  {selectedInvoice.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 border rounded text-sm">
                      <div>
                        <p>{item.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} × ${item.unitPrice?.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium">${item.total?.toFixed(2)}</p>
                    </div>
                  ))}
                  {(!selectedInvoice.items?.length) && (
                    <p className="text-sm text-muted-foreground text-center py-2">No items yet</p>
                  )}
                </div>
              </div>
              <div className="border-t pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">${selectedInvoice.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="font-semibold text-green-600">${selectedInvoice.paidAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t pt-2">
                  <span>Balance</span>
                  <span className={(selectedInvoice.balance ?? 0) > 0 ? 'text-destructive' : 'text-green-600'}>
                    ${selectedInvoice.balance?.toFixed(2)}
                  </span>
                </div>
              </div>
              {(selectedInvoice.balance ?? 0) > 0 && (
                <Button className="w-full gap-2" onClick={() => { setDetailOpen(false); openPay(selectedInvoice); }}>
                  <DollarSign className="h-4 w-4" />Pay Now
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Payment Method Dialog ── */}
      <Dialog open={payOpen} onOpenChange={v => { setPayOpen(v); setRedirecting(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Pay — {selectedInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              {/* Balance */}
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Amount Due</p>
                <p className="text-3xl font-bold text-destructive">
                  ${(selectedInvoice.balance ?? selectedInvoice.totalAmount ?? 0).toFixed(2)}
                </p>
              </div>

              <p className="text-sm text-muted-foreground text-center">Choose a payment method</p>

              {/* Cash */}
              <Button
                variant="outline"
                className="w-full h-14 gap-3 text-base border-amber-400/50 hover:bg-amber-50 hover:border-amber-400"
                disabled={!!redirecting}
                onClick={async () => {
                  // Cash is recorded by the accountant — patient just views the invoice
                  toast.info('Please pay cash at the reception desk. Your invoice will update automatically.');
                  setPayOpen(false);
                }}
              >
                <Banknote className="h-6 w-6 text-amber-600" />
                <span className="font-semibold text-amber-700">Pay at Reception (Cash)</span>
              </Button>

              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                  or pay online
                </span>
              </div>

              {/* PayPal */}
              <Button
                className="w-full h-14 gap-3 text-base bg-[#003087] hover:bg-[#002069] text-white"
                disabled={!!redirecting}
                onClick={() => handleOnline('paypal')}
              >
                <Globe className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="font-bold leading-tight">PayPal</span>
                  <span className="text-xs opacity-80 leading-tight">
                    {redirecting === 'paypal' ? 'Redirecting…' : 'Pay securely with PayPal'}
                  </span>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto opacity-60" />
              </Button>

              {/* Kashier */}
              <Button
                className="w-full h-14 gap-3 text-base bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={!!redirecting}
                onClick={() => handleOnline('kashier')}
              >
                <CreditCard className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="font-bold leading-tight">Kashier</span>
                  <span className="text-xs opacity-80 leading-tight">
                    {redirecting === 'kashier' ? 'Redirecting…' : 'Card, Wallet & InstaPay'}
                  </span>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto opacity-60" />
              </Button>

              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Secure payment. Your invoice updates automatically.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PatientBilling;
