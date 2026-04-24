import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useData } from '@/contexts/DataContext';
import { PharmacyCharge, LabCharge, Invoice } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { LayoutDashboard, FileText, CreditCard, User, Plus, Eye, Receipt } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/accountant', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Invoices', path: '/accountant/invoices', icon: <FileText className="h-5 w-5" /> },
  { label: 'Payments', path: '/accountant/payments', icon: <CreditCard className="h-5 w-5" /> },
  { label: 'Profile', path: '/accountant/profile', icon: <User className="h-5 w-5" /> },
];

const AccountantInvoices = () => {
  const { 
    invoices, addInvoice, 
    pharmacyCharges, updatePharmacyCharge,
    labCharges, updateLabCharge
  } = useData();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const pendingPharmacyCharges = pharmacyCharges.filter(c => c.status === 'pending');
  const pendingLabCharges = labCharges.filter(c => c.status === 'pending');

  const handleCreateInvoiceFromPharmacy = (charge: PharmacyCharge) => {
    const invoice = addInvoice({
      patientId: charge.patientId,
      patientName: charge.patientName,
      date: new Date().toISOString().split('T')[0],
      items: charge.items.map(item => ({
        description: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      totalAmount: charge.totalAmount,
      paidAmount: 0,
      status: 'pending',
      source: 'pharmacy',
    });

    updatePharmacyCharge(charge.id, { status: 'invoiced' });
    toast.success(`Invoice #${invoice.id} created for ${charge.patientName}`);
  };

  const handleCreateInvoiceFromLab = (charge: LabCharge) => {
    const invoice = addInvoice({
      patientId: charge.patientId,
      patientName: charge.patientName,
      date: new Date().toISOString().split('T')[0],
      items: [{
        description: `Lab Test: ${charge.testType}`,
        quantity: 1,
        unitPrice: charge.amount,
        total: charge.amount,
      }],
      totalAmount: charge.amount,
      paidAmount: 0,
      status: 'pending',
      source: 'lab',
    });

    updateLabCharge(charge.id, { status: 'invoiced' });
    toast.success(`Invoice #${invoice.id} created for ${charge.patientName}`);
  };

  const pharmacyChargeColumns = [
    { key: 'patientName', header: 'Patient' },
    { key: 'date', header: 'Date' },
    { key: 'items', header: 'Items', render: (c: PharmacyCharge) => `${c.items.length} item(s)` },
    { key: 'totalAmount', header: 'Amount', render: (c: PharmacyCharge) => `$${c.totalAmount.toFixed(2)}` },
    {
      key: 'actions',
      header: 'Actions',
      render: (charge: PharmacyCharge) => (
        <Button size="sm" onClick={() => handleCreateInvoiceFromPharmacy(charge)}>
          <Plus className="h-4 w-4 mr-1" />
          Create Invoice
        </Button>
      ),
    },
  ];

  const labChargeColumns = [
    { key: 'patientName', header: 'Patient' },
    { key: 'testType', header: 'Test Type' },
    { key: 'date', header: 'Date' },
    { key: 'amount', header: 'Amount', render: (c: LabCharge) => `$${c.amount.toFixed(2)}` },
    {
      key: 'actions',
      header: 'Actions',
      render: (charge: LabCharge) => (
        <Button size="sm" onClick={() => handleCreateInvoiceFromLab(charge)}>
          <Plus className="h-4 w-4 mr-1" />
          Create Invoice
        </Button>
      ),
    },
  ];

  const invoiceColumns = [
    { key: 'id', header: 'Invoice #' },
    { key: 'patientName', header: 'Patient' },
    { key: 'date', header: 'Date' },
    { key: 'source', header: 'Source', render: (i: Invoice) => (
      <span className="capitalize">{i.source || 'other'}</span>
    )},
    { key: 'totalAmount', header: 'Total', render: (i: Invoice) => `$${i.totalAmount.toFixed(2)}` },
    { key: 'paidAmount', header: 'Paid', render: (i: Invoice) => `$${i.paidAmount.toFixed(2)}` },
    { key: 'status', header: 'Status', render: (i: Invoice) => <StatusBadge status={i.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (invoice: Invoice) => (
        <Button variant="ghost" size="sm" onClick={() => {
          setSelectedInvoice(invoice);
          setDialogOpen(true);
        }}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const pendingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'partial');
  const paidInvoices = invoices.filter(i => i.status === 'paid');

  return (
    <DashboardLayout navItems={navItems} title="Invoices">
      <PageHeader
        title="Invoice Management"
        description="Create invoices from charges and manage billing"
      />

      <Tabs defaultValue="charges" className="space-y-4">
        <TabsList>
          <TabsTrigger value="charges">
            Pending Charges ({pendingPharmacyCharges.length + pendingLabCharges.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Invoices ({pendingInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Paid Invoices ({paidInvoices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charges" className="space-y-6">
          {/* Pharmacy Charges */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Pharmacy Charges
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingPharmacyCharges.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No pending pharmacy charges</p>
              ) : (
                <DataTable data={pendingPharmacyCharges} columns={pharmacyChargeColumns} />
              )}
            </CardContent>
          </Card>

          {/* Lab Charges */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Lab Charges
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingLabCharges.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No pending lab charges</p>
              ) : (
                <DataTable data={pendingLabCharges} columns={labChargeColumns} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardContent className="pt-6">
              {pendingInvoices.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending invoices</p>
              ) : (
                <DataTable data={pendingInvoices} columns={invoiceColumns} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid">
          <Card>
            <CardContent className="pt-6">
              {paidInvoices.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No paid invoices</p>
              ) : (
                <DataTable data={paidInvoices} columns={invoiceColumns} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Invoice #</p>
                  <p className="font-medium">{selectedInvoice.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">{selectedInvoice.date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="font-medium">{selectedInvoice.patientName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <StatusBadge status={selectedInvoice.status} />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedInvoice.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm p-2 border rounded">
                      <div>
                        <p>{item.description}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">${item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-semibold">${selectedInvoice.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid Amount:</span>
                  <span className="font-semibold text-green-600">${selectedInvoice.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-medium">Balance Due:</span>
                  <span className="font-bold text-destructive">
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

export default AccountantInvoices;
