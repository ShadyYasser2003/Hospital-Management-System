import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useInvoicesByStatus, useRecordPayment, usePayments } from '@/hooks/useInvoices';
import { InvoiceDto, PaymentDto } from '@/services/invoiceService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LayoutDashboard, FileText, CreditCard, User, DollarSign, Search, History, Bell } from 'lucide-react';

const navItems = [
  { label: 'Dashboard',     path: '/accountant',               icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Invoices',      path: '/accountant/invoices',      icon: <FileText className="h-5 w-5" /> },
  { label: 'Payments',      path: '/accountant/payments',      icon: <CreditCard className="h-5 w-5" /> },
  { label: 'Notifications', path: '/accountant/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile',       path: '/accountant/profile',       icon: <User className="h-5 w-5" /> },
];

const AccountantPayments = () => {
  const { data: pending = [], isLoading: loadingPending } = useInvoicesByStatus('PENDING');
  const { data: partial = [], isLoading: loadingPartial } = useInvoicesByStatus('PARTIAL');
  const { data: allPayments = [], isLoading: loadingPayments } = usePayments();
  const recordPayment = useRecordPayment();

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(null);
  const [dialogOpen, setDialogOpen]           = useState(false);
  const [searchQuery, setSearchQuery]         = useState('');
  const [historySearch, setHistorySearch]     = useState('');
  const [paymentData, setPaymentData]         = useState({ amount: '', method: '', notes: '', referenceNumber: '' });

  const unpaid = [...pending, ...partial];
  const filtered = unpaid.filter(i =>
    i.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredPayments = (allPayments as PaymentDto[]).filter(p =>
    p.patientName?.toLowerCase().includes(historySearch.toLowerCase()) ||
    p.invoiceNumber?.toLowerCase().includes(historySearch.toLowerCase())
  );
  const isLoading = loadingPending || loadingPartial;

  const openDialog = (inv: InvoiceDto) => {
    setSelectedInvoice(inv);
    setPaymentData({ amount: String((inv.balance ?? 0).toFixed(2)), method: '', notes: '', referenceNumber: '' });
    setDialogOpen(true);
  };

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !paymentData.amount || !paymentData.method) {
      toast.error('Fill all required fields'); return;
    }
    const amount = parseFloat(paymentData.amount);
    if (amount <= 0) { toast.error('Amount must be > 0'); return; }
    if (amount > (selectedInvoice.balance ?? 0)) {
      toast.error(`Cannot exceed balance $${selectedInvoice.balance?.toFixed(2)}`); return;
    }
    try {
      await recordPayment.mutateAsync({
        invoiceId: selectedInvoice.id,
        payment: {
          amount,
          paymentMethod: paymentData.method,
          notes: paymentData.notes,
          referenceNumber: paymentData.referenceNumber,
        } as PaymentDto,
      });
      toast.success(`Payment of $${amount.toFixed(2)} recorded`);
      setDialogOpen(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const invoiceCols = [
    { key: 'invoiceNumber', header: 'Invoice #' },
    { key: 'patientName',   header: 'Patient' },
    { key: 'createdAt',     header: 'Date', render: (i: InvoiceDto) => i.createdAt?.split('T')[0] },
    { key: 'totalAmount',   header: 'Total',   render: (i: InvoiceDto) => `$${i.totalAmount?.toFixed(2)}` },
    { key: 'paidAmount',    header: 'Paid',    render: (i: InvoiceDto) => `$${i.paidAmount?.toFixed(2)}` },
    { key: 'balance',       header: 'Balance', render: (i: InvoiceDto) => <span className="font-semibold text-destructive">${i.balance?.toFixed(2)}</span> },
    { key: 'status',        header: 'Status',  render: (i: InvoiceDto) => <StatusBadge status={i.status?.toLowerCase() as never} /> },
    { key: 'actions', header: 'Actions', render: (i: InvoiceDto) => (
      <Button size="sm" onClick={() => openDialog(i)}>
        <DollarSign className="h-4 w-4 mr-1" />Record Payment
      </Button>
    )},
  ];

  const paymentCols = [
    { key: 'invoiceNumber', header: 'Invoice #' },
    { key: 'patientName',   header: 'Patient' },
    { key: 'amount',        header: 'Amount', render: (p: PaymentDto) => <span className="font-semibold text-primary">${p.amount?.toFixed(2)}</span> },
    { key: 'paymentMethod', header: 'Method', render: (p: PaymentDto) => (
      <Badge variant="secondary">{p.paymentMethod?.replace('_', ' ')}</Badge>
    )},
    { key: 'referenceNumber', header: 'Reference', render: (p: PaymentDto) => p.referenceNumber || '—' },
    { key: 'paidAt', header: 'Date', render: (p: PaymentDto) => p.paidAt ? String(p.paidAt).split('T')[0] : '—' },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Payments">
      <PageHeader title="Payment Management" description="Record and track patient payments" />

      <Tabs defaultValue="unpaid">
        <TabsList>
          <TabsTrigger value="unpaid" className="gap-2">
            Unpaid Invoices
            {unpaid.length > 0 && <Badge variant="destructive" className="ml-1">{unpaid.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Payment History
            {(allPayments as PaymentDto[]).length > 0 && (
              <Badge variant="secondary" className="ml-1">{(allPayments as PaymentDto[]).length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Unpaid Invoices Tab */}
        <TabsContent value="unpaid">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Unpaid Invoices</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient or invoice..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading
                ? <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                : filtered.length === 0
                  ? <p className="text-center text-muted-foreground py-8">No unpaid invoices</p>
                  : <DataTable data={filtered} columns={invoiceCols} />
              }
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Transactions</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient or invoice..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingPayments
                ? <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                : filteredPayments.length === 0
                  ? <p className="text-center text-muted-foreground py-8">No payment records found</p>
                  : <DataTable data={filteredPayments} columns={paymentCols} />
              }
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          {selectedInvoice && (
            <form onSubmit={handleRecord} className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Invoice:</span><span className="font-medium">{selectedInvoice.invoiceNumber}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Patient:</span><span className="font-medium">{selectedInvoice.patientName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total:</span><span className="font-medium">${selectedInvoice.totalAmount?.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Paid:</span><span className="font-medium text-primary">${selectedInvoice.paidAmount?.toFixed(2)}</span></div>
                <div className="flex justify-between text-base font-bold border-t pt-2">
                  <span>Balance Due:</span><span className="text-destructive">${selectedInvoice.balance?.toFixed(2)}</span>
                </div>
              </div>
              <div>
                <Label>Amount ($) *</Label>
                <Input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  min="0.01"
                  max={selectedInvoice.balance ?? 0}
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Label>Payment Method *</Label>
                <Select value={paymentData.method} onValueChange={(v) => setPaymentData({ ...paymentData, method: v })}>
                  <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="INSURANCE">Insurance</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Reference Number</Label>
                <Input
                  value={paymentData.referenceNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, referenceNumber: e.target.value })}
                  placeholder="Card/insurance ref..."
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Input
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={recordPayment.isPending}>
                <DollarSign className="h-4 w-4 mr-2" />
                {recordPayment.isPending ? 'Recording...' : 'Record Payment'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AccountantPayments;
