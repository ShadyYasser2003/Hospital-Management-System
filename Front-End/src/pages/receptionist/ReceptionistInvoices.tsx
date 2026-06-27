import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useInvoices, useInvoicesByStatus, useCreateInvoice, useCancelInvoice } from '@/hooks/useInvoices';
import { usePatients } from '@/hooks/usePatients';
import { InvoiceDto } from '@/services/invoiceService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Eye } from 'lucide-react';import { useLocation } from 'react-router-dom';
import { receptionistNavItems } from '@/constants/receptionistNavItems';

const ReceptionistInvoices = () => {
  const location = useLocation();
  const { data: allPage, isLoading } = useInvoices();
  const { data: pending = [] }       = useInvoicesByStatus('PENDING');
  const { data: partial = [] }       = useInvoicesByStatus('PARTIAL');
  const { data: paid = [] }          = useInvoicesByStatus('PAID');
  const { data: patients = [] }      = usePatients();
  const createInvoice = useCreateInvoice();
  const cancelInvoice = useCancelInvoice();

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(null);
  const [detailOpen, setDetailOpen]           = useState(false);
  const [createOpen, setCreateOpen]           = useState(false);

  const [newPatientId, setNewPatientId] = useState('');
  const [newNotes, setNewNotes]         = useState('');

  // Auto-open create dialog when redirected from patient registration
  useEffect(() => {
    const state = location.state as { newPatientId?: string; newPatientName?: string } | null;
    if (state?.newPatientId) {
      setNewPatientId(state.newPatientId);
      setCreateOpen(true);
      // Clear state so refreshing doesn't re-open
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const handleCreate = async () => {
    if (!newPatientId) { toast.error('Select a patient'); return; }
    try {
      await createInvoice.mutateAsync({
        patientId: Number(newPatientId),
        notes: newNotes,
      });
      toast.success('Invoice created');
      setCreateOpen(false);
      setNewPatientId('');
      setNewNotes('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create invoice');
    }
  };

  const handleCancel = async (inv: InvoiceDto) => {
    try {
      await cancelInvoice.mutateAsync(inv.id);
      toast.info('Invoice cancelled');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to cancel invoice');
    }
  };

  const unpaid = [...pending, ...partial];

  const invoiceCols = [
    { key: 'invoiceNumber', header: 'Invoice #' },
    { key: 'patientName',   header: 'Patient' },
    { key: 'createdAt',     header: 'Date', render: (i: InvoiceDto) => i.createdAt?.split('T')[0] },
    { key: 'totalAmount',   header: 'Total',   render: (i: InvoiceDto) => `$${i.totalAmount?.toFixed(2)}` },
    { key: 'paidAmount',    header: 'Paid',    render: (i: InvoiceDto) => `$${i.paidAmount?.toFixed(2)}` },
    { key: 'balance',       header: 'Balance', render: (i: InvoiceDto) => (
      <span className="font-semibold text-destructive">${i.balance?.toFixed(2)}</span>
    )},
    { key: 'status', header: 'Status', render: (i: InvoiceDto) => (
      <StatusBadge status={i.status?.toLowerCase() as never} />
    )},
    { key: 'actions', header: 'Actions', render: (i: InvoiceDto) => {
      const allInvoices = [...unpaid, ...paid, ...(allPage?.content ?? [])];
      const original = allInvoices.find(x => String(x.id) === String(i.id));
      return (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => {
            if (original) { setSelectedInvoice(original); setDetailOpen(true); }
          }}>
            <Eye className="h-4 w-4" />
          </Button>
          {i.status?.toUpperCase() !== 'PAID' && i.status?.toUpperCase() !== 'CANCELLED' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => { if (original) handleCancel(original); }}
            >
              ✕
            </Button>
          )}
        </div>
      );
    }},
  ];

  return (
    <DashboardLayout navItems={receptionistNavItems} title="Invoices">
      <PageHeader
        title="Invoice Management"
        description="Create and manage patient invoices"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />New Invoice
          </Button>
        }
      />

      {isLoading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      )}

      {!isLoading && (
        <Tabs defaultValue="unpaid">
          <TabsList>
            <TabsTrigger value="unpaid">Unpaid ({unpaid.length})</TabsTrigger>
            <TabsTrigger value="paid">Paid ({paid.length})</TabsTrigger>
            <TabsTrigger value="all">All ({allPage?.totalElements ?? 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="unpaid">
            <Card><CardContent className="pt-6">
              <DataTable
                data={unpaid.map(i => ({ ...i, id: String(i.id) }))}
                columns={invoiceCols as never}
                emptyMessage="No unpaid invoices"
              />
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="paid">
            <Card><CardContent className="pt-6">
              <DataTable
                data={paid.map(i => ({ ...i, id: String(i.id) }))}
                columns={invoiceCols as never}
                emptyMessage="No paid invoices"
              />
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="all">
            <Card><CardContent className="pt-6">
              <DataTable
                data={(allPage?.content ?? []).map(i => ({ ...i, id: String(i.id) }))}
                columns={invoiceCols as never}
                emptyMessage="No invoices"
              />
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      )}

      {/* ── Create Invoice Dialog ─────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Invoice</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Patient *</Label>
              <Select value={newPatientId} onValueChange={setNewPatientId}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name} ({p.nationalId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Optional notes"
              />
            </div>
            <Button onClick={handleCreate} className="w-full" disabled={createInvoice.isPending}>
              {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Invoice Detail Dialog ─────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Invoice {selectedInvoice?.invoiceNumber}</DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg text-sm">
                <div>
                  <p className="text-muted-foreground">Patient</p>
                  <p className="font-medium">{selectedInvoice.patientName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusBadge status={selectedInvoice.status?.toLowerCase() as never} />
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{selectedInvoice.createdAt?.split('T')[0]}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-sm">Items</h4>
                <div className="space-y-2">
                  {selectedInvoice.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 border rounded text-sm">
                      <div>
                        <p>{item.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.itemType} • Qty: {item.quantity} × ${item.unitPrice?.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium">${item.total?.toFixed(2)}</p>
                    </div>
                  ))}
                  {(!selectedInvoice.items || selectedInvoice.items.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-2">No items yet</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-semibold">${selectedInvoice.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid</span>
                  <span className="font-semibold text-primary">${selectedInvoice.paidAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t pt-2">
                  <span>Balance</span>
                  <span className="text-destructive">${selectedInvoice.balance?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
};

export default ReceptionistInvoices;
