import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useInvoicesByStatus, useRecordPayment, usePayments } from '@/hooks/useInvoices';
import { InvoiceDto, PaymentDto } from '@/services/invoiceService';
import invoiceService from '@/services/invoiceService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  LayoutDashboard, FileText, CreditCard, User, DollarSign,
  Search, History, Bell, Banknote, Globe, CheckCircle2, ExternalLink,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard',     path: '/accountant',               icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Invoices',      path: '/accountant/invoices',      icon: <FileText className="h-5 w-5" /> },
  { label: 'Payments',      path: '/accountant/payments',      icon: <CreditCard className="h-5 w-5" /> },
  { label: 'Notifications', path: '/accountant/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile',       path: '/accountant/profile',       icon: <User className="h-5 w-5" /> },
];

type InvoiceRow = Omit<InvoiceDto, 'id'> & { id: string };
type PaymentRow = Omit<PaymentDto, 'id'> & { id: string };

// ── Payment method badge ──────────────────────────────────────────────────────
const MethodBadge = ({ method }: { method?: string }) => {
  if (!method) return <span className="text-muted-foreground">—</span>;
  const m = method.toUpperCase();
  if (m === 'PAYPAL')  return <Badge className="bg-[#003087] text-white gap-1"><Globe className="h-3 w-3" />PayPal</Badge>;
  if (m === 'KASHIER') return <Badge className="bg-emerald-600 text-white gap-1"><CreditCard className="h-3 w-3" />Kashier</Badge>;
  return <Badge variant="secondary" className="gap-1"><Banknote className="h-3 w-3" />Cash</Badge>;
};

const AccountantPayments = () => {
  const { data: pending = [],  isLoading: loadingPending } = useInvoicesByStatus('PENDING');
  const { data: partial = [],  isLoading: loadingPartial } = useInvoicesByStatus('PARTIAL');
  const { data: allPayments = [], isLoading: loadingPayments } = usePayments();
  const recordPayment = useRecordPayment();

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(null);
  const [dialogOpen,   setDialogOpen]   = useState(false);
  const [cashAmount,   setCashAmount]   = useState('');
  const [cashNotes,    setCashNotes]    = useState('');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [histSearch,   setHistSearch]   = useState('');
  const [redirecting,  setRedirecting]  = useState<'paypal' | 'kashier' | null>(null);

  const unpaid = [...pending, ...partial];

  const filteredInvoices: InvoiceRow[] = unpaid
    .filter(i =>
      i.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(i => ({ ...i, id: String(i.id) }));

  const filteredPayments: PaymentRow[] = allPayments
    .filter(p =>
      p.patientName?.toLowerCase().includes(histSearch.toLowerCase()) ||
      p.invoiceNumber?.toLowerCase().includes(histSearch.toLowerCase())
    )
    .map(p => ({ ...p, id: String(p.id ?? Math.random()) }));

  const openDialog = (row: InvoiceRow) => {
    const inv = unpaid.find(i => String(i.id) === row.id)!;
    setSelectedInvoice(inv);
    setCashAmount(String((inv.balance ?? 0).toFixed(2)));
    setCashNotes('');
    setDialogOpen(true);
  };

  // ── Cash payment ─────────────────────────────────────────────────────────
  const handleCash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    const amount = parseFloat(cashAmount);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    if (amount > (selectedInvoice.balance ?? 0))
      { toast.error(`Cannot exceed balance $${selectedInvoice.balance?.toFixed(2)}`); return; }
    try {
      await recordPayment.mutateAsync({
        invoiceId: selectedInvoice.id,
        payment: { amount, paymentMethod: 'CASH', notes: cashNotes },
      });
      toast.success(`Cash payment of $${amount.toFixed(2)} recorded`);
      setDialogOpen(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  // ── Online payments ───────────────────────────────────────────────────────
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

  const isLoading = loadingPending || loadingPartial;

  const invoiceCols = [
    { key: 'invoiceNumber', header: 'Invoice #' },
    { key: 'patientName',   header: 'Patient' },
    { key: 'createdAt',     header: 'Date',    render: (i: InvoiceRow) => String(i.createdAt ?? '').split('T')[0] },
    { key: 'totalAmount',   header: 'Total',   render: (i: InvoiceRow) => `$${(i.totalAmount ?? 0).toFixed(2)}` },
    { key: 'paidAmount',    header: 'Paid',    render: (i: InvoiceRow) => <span className="text-primary">${(i.paidAmount ?? 0).toFixed(2)}</span> },
    { key: 'balance',       header: 'Balance', render: (i: InvoiceRow) => (
      <span className="font-bold text-destructive">${(i.balance ?? 0).toFixed(2)}</span>
    )},
    { key: 'status', header: 'Status', render: (i: InvoiceRow) => <StatusBadge status={i.status?.toLowerCase() as never} /> },
    { key: 'actions', header: 'Pay', render: (i: InvoiceRow) => (
      <Button size="sm" onClick={() => openDialog(i)}>
        <DollarSign className="h-4 w-4 mr-1" />Pay
      </Button>
    )},
  ];

  const paymentCols = [
    { key: 'invoiceNumber', header: 'Invoice #', render: (p: PaymentRow) => p.invoiceNumber || '—' },
    { key: 'patientName',   header: 'Patient',   render: (p: PaymentRow) => p.patientName || '—' },
    { key: 'amount',        header: 'Amount',    render: (p: PaymentRow) => (
      <span className="font-bold text-primary">${(p.amount ?? 0).toFixed(2)}</span>
    )},
    { key: 'paymentMethod', header: 'Method', render: (p: PaymentRow) => <MethodBadge method={p.paymentMethod} /> },
    { key: 'referenceNumber', header: 'Reference', render: (p: PaymentRow) => p.referenceNumber || '—' },
    { key: 'paidAt', header: 'Date', render: (p: PaymentRow) =>
      p.paidAt ? String(p.paidAt).split('T')[0] : '—'
    },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Payments">
      <PageHeader title="Payment Management" description="Record cash payments or send online payment links" />

      <Tabs defaultValue="unpaid">
        <TabsList>
          <TabsTrigger value="unpaid" className="gap-2">
            Unpaid Invoices
            {unpaid.length > 0 && <Badge variant="destructive" className="ml-1">{unpaid.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />Payment History
            {allPayments.length > 0 && <Badge variant="secondary" className="ml-1">{allPayments.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unpaid">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Unpaid Invoices</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search patient or invoice…" value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading
                ? <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                : <DataTable data={filteredInvoices} columns={invoiceCols as never} emptyMessage="No unpaid invoices" />
              }
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Transactions</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search patient or invoice…" value={histSearch}
                    onChange={e => setHistSearch(e.target.value)} className="pl-10" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingPayments
                ? <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                : <DataTable data={filteredPayments} columns={paymentCols as never} emptyMessage="No payment records" />
              }
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Payment Dialog ───────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={v => { setDialogOpen(v); setRedirecting(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Pay Invoice — {selectedInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-5">
              {/* Invoice summary */}
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient</span>
                  <span className="font-medium">{selectedInvoice.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Billed</span>
                  <span>${(selectedInvoice.totalAmount ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Already Paid</span>
                  <span className="text-primary">${(selectedInvoice.paidAmount ?? 0).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Balance Due</span>
                  <span className="text-destructive">${(selectedInvoice.balance ?? 0).toFixed(2)}</span>
                </div>
              </div>

              {/* ── Option A: Cash ── */}
              <div className="rounded-xl border-2 border-dashed border-muted p-4 space-y-3">
                <p className="font-semibold flex items-center gap-2 text-sm">
                  <Banknote className="h-4 w-4 text-amber-500" />Cash Payment
                </p>
                <form onSubmit={handleCash} className="space-y-3">
                  <div>
                    <Label>Amount ($) <span className="text-destructive">*</span></Label>
                    <Input
                      type="number" min="0.01" step="0.01"
                      max={selectedInvoice.balance ?? 0}
                      value={cashAmount}
                      onChange={e => setCashAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Input value={cashNotes} onChange={e => setCashNotes(e.target.value)}
                      placeholder="Optional…" />
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={recordPayment.isPending}>
                    <CheckCircle2 className="h-4 w-4" />
                    {recordPayment.isPending ? 'Recording…' : 'Confirm Cash Payment'}
                  </Button>
                </form>
              </div>

              {/* ── Option B: Online ── */}
              <div className="rounded-xl border-2 border-dashed border-muted p-4 space-y-3">
                <p className="font-semibold flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-blue-500" />Online Payment
                  <span className="text-xs font-normal text-muted-foreground">(patient redirected to payment page)</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-14 flex-col gap-1.5 border-[#003087]/30 hover:bg-[#003087]/5"
                    disabled={!!redirecting}
                    onClick={() => handleOnline('paypal')}
                  >
                    <span className="text-[#003087] font-bold text-base">Pay</span>
                    <span className="text-[#003087] text-xs font-semibold">Pal</span>
                    {redirecting === 'paypal' && (
                      <span className="text-xs text-muted-foreground">Redirecting…</span>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-14 flex-col gap-1.5 border-emerald-500/30 hover:bg-emerald-50"
                    disabled={!!redirecting}
                    onClick={() => handleOnline('kashier')}
                  >
                    <CreditCard className="h-5 w-5 text-emerald-600" />
                    <span className="text-emerald-700 text-xs font-semibold">Kashier</span>
                    {redirecting === 'kashier' && (
                      <span className="text-xs text-muted-foreground">Redirecting…</span>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  Clicking will open the payment gateway in the same window.
                  The invoice updates automatically after payment.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AccountantPayments;
