import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useData } from '@/contexts/DataContext';
import { Invoice, Payment } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { LayoutDashboard, FileText, CreditCard, User, DollarSign, History, Search } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/accountant', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Invoices', path: '/accountant/invoices', icon: <FileText className="h-5 w-5" /> },
  { label: 'Payments', path: '/accountant/payments', icon: <CreditCard className="h-5 w-5" /> },
  { label: 'Profile', path: '/accountant/profile', icon: <User className="h-5 w-5" /> },
];

const AccountantPayments = () => {
  const { invoices, updateInvoice, payments, addPayment, addNotification, patients } = useData();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: '' as Payment['method'] | '',
    notes: '',
  });

  const unpaidInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'partial');
  
  const filteredInvoices = unpaidInvoices.filter(
    (i) => i.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openPaymentDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentData({
      amount: String(invoice.totalAmount - invoice.paidAmount),
      method: '',
      notes: '',
    });
    setDialogOpen(true);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !paymentData.amount || !paymentData.method) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(paymentData.amount);
    const balance = selectedInvoice.totalAmount - selectedInvoice.paidAmount;

    if (amount <= 0) {
      toast.error('Payment amount must be greater than zero');
      return;
    }

    if (amount > balance) {
      toast.error(`Payment amount cannot exceed balance due ($${balance.toFixed(2)})`);
      return;
    }

    // Record payment
    addPayment({
      invoiceId: selectedInvoice.id,
      patientId: selectedInvoice.patientId,
      patientName: selectedInvoice.patientName,
      amount,
      method: paymentData.method as Payment['method'],
      date: new Date().toISOString().split('T')[0],
      notes: paymentData.notes,
    });

    // Update invoice
    const newPaidAmount = selectedInvoice.paidAmount + amount;
    const newStatus = newPaidAmount >= selectedInvoice.totalAmount ? 'paid' : 'partial';
    
    updateInvoice(selectedInvoice.id, {
      paidAmount: newPaidAmount,
      status: newStatus,
    });

    // If fully paid, send notifications
    if (newStatus === 'paid') {
      // Notify Patient
      const patient = patients.find(p => p.id === selectedInvoice.patientId);
      if (patient) {
        addNotification({
          userId: patient.userId || selectedInvoice.patientId,
          role: 'patient',
          title: 'Invoice Paid',
          message: `Your invoice #${selectedInvoice.id} has been fully paid. Thank you!`,
          type: 'success',
          read: false,
        });
      }

      // Notify Receptionist
      addNotification({
        userId: '',
        role: 'receptionist',
        title: 'Invoice Paid',
        message: `Invoice #${selectedInvoice.id} for ${selectedInvoice.patientName} has been paid in full`,
        type: 'success',
        read: false,
      });
    }

    toast.success(`Payment of $${amount.toFixed(2)} recorded successfully`);
    setDialogOpen(false);
    setSelectedInvoice(null);
  };

  const invoiceColumns = [
    { key: 'id', header: 'Invoice #' },
    { key: 'patientName', header: 'Patient' },
    { key: 'date', header: 'Date' },
    { key: 'totalAmount', header: 'Total', render: (i: Invoice) => `$${i.totalAmount.toFixed(2)}` },
    { key: 'paidAmount', header: 'Paid', render: (i: Invoice) => `$${i.paidAmount.toFixed(2)}` },
    { 
      key: 'balance', 
      header: 'Balance', 
      render: (i: Invoice) => (
        <span className="font-semibold text-destructive">
          ${(i.totalAmount - i.paidAmount).toFixed(2)}
        </span>
      )
    },
    { key: 'status', header: 'Status', render: (i: Invoice) => <StatusBadge status={i.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (invoice: Invoice) => (
        <Button size="sm" onClick={() => openPaymentDialog(invoice)}>
          <DollarSign className="h-4 w-4 mr-1" />
          Record Payment
        </Button>
      ),
    },
  ];

  const paymentColumns = [
    { key: 'invoiceId', header: 'Invoice #' },
    { key: 'patientName', header: 'Patient' },
    { key: 'amount', header: 'Amount', render: (p: Payment) => `$${p.amount.toFixed(2)}` },
    { key: 'method', header: 'Method', render: (p: Payment) => (
      <span className="capitalize">{p.method.replace('_', ' ')}</span>
    )},
    { key: 'date', header: 'Date' },
    { key: 'notes', header: 'Notes', render: (p: Payment) => p.notes || '-' },
  ];

  // Group payments by patient for history view
  const getPatientPaymentHistory = () => {
    const history: Record<string, { patientName: string; payments: Payment[]; total: number }> = {};
    
    payments.forEach(payment => {
      if (!history[payment.patientId]) {
        history[payment.patientId] = {
          patientName: payment.patientName,
          payments: [],
          total: 0,
        };
      }
      history[payment.patientId].payments.push(payment);
      history[payment.patientId].total += payment.amount;
    });
    
    return Object.values(history);
  };

  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);

  return (
    <DashboardLayout navItems={navItems} title="Payments">
      <PageHeader
        title="Payment Management"
        description="Record and track patient payments"
      />

      <Tabs defaultValue="record" className="space-y-4">
        <TabsList>
          <TabsTrigger value="record">Record Payment</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="by-patient">By Patient</TabsTrigger>
        </TabsList>

        <TabsContent value="record">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Unpaid Invoices</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredInvoices.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No unpaid invoices</p>
              ) : (
                <DataTable data={filteredInvoices} columns={invoiceColumns} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentPayments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No payment records</p>
              ) : (
                <DataTable data={recentPayments} columns={paymentColumns} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-patient">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getPatientPaymentHistory().length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center text-muted-foreground">
                  No payment history available
                </CardContent>
              </Card>
            ) : (
              getPatientPaymentHistory().map((record, idx) => (
                <Card key={idx}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{record.patientName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {record.payments.slice(0, 5).map((payment, pIdx) => (
                        <div key={pIdx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{payment.date}</span>
                          <span className="font-medium">${payment.amount.toFixed(2)}</span>
                        </div>
                      ))}
                      {record.payments.length > 5 && (
                        <p className="text-xs text-muted-foreground">
                          +{record.payments.length - 5} more payments
                        </p>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                      <span className="font-medium">Total Paid:</span>
                      <span className="text-lg font-bold text-green-600">
                        ${record.total.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice #:</span>
                  <span className="font-medium">{selectedInvoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient:</span>
                  <span className="font-medium">{selectedInvoice.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-medium">${selectedInvoice.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Already Paid:</span>
                  <span className="font-medium text-green-600">${selectedInvoice.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg border-t pt-2">
                  <span className="font-medium">Balance Due:</span>
                  <span className="font-bold text-destructive">
                    ${(selectedInvoice.totalAmount - selectedInvoice.paidAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <Label>Payment Amount ($) *</Label>
                <Input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  min="0.01"
                  max={selectedInvoice.totalAmount - selectedInvoice.paidAmount}
                  step="0.01"
                  required
                />
              </div>

              <div>
                <Label>Payment Method *</Label>
                <Select 
                  value={paymentData.method} 
                  onValueChange={(value) => setPaymentData({ ...paymentData, method: value as Payment['method'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notes (Optional)</Label>
                <Input
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                />
              </div>

              <Button type="submit" className="w-full">
                <DollarSign className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AccountantPayments;
