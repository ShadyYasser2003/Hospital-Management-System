import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Prescription } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { LayoutDashboard, Pill, Package, FileText, User, CheckCircle, AlertTriangle, ShoppingCart } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/pharmacist', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Inventory', path: '/pharmacist/inventory', icon: <Package className="h-5 w-5" /> },
  { label: 'Prescriptions', path: '/pharmacist/prescriptions', icon: <FileText className="h-5 w-5" /> },
  { label: 'Dispense', path: '/pharmacist/dispense', icon: <Pill className="h-5 w-5" /> },
  { label: 'Profile', path: '/pharmacist/profile', icon: <User className="h-5 w-5" /> },
];

const PharmacistDispense = () => {
  const { user } = useAuth();
  const { 
    prescriptions, updatePrescription, 
    medicines, updateMedicine, 
    addPharmacyCharge, addNotification 
  } = useData();
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending');

  const checkStockAvailability = (prescription: Prescription) => {
    const issues: string[] = [];
    
    prescription.medications.forEach(med => {
      const medicine = medicines.find(m => 
        m.name.toLowerCase().includes(med.name.toLowerCase()) ||
        med.name.toLowerCase().includes(m.name.toLowerCase())
      );
      
      if (!medicine) {
        issues.push(`${med.name}: Not found in inventory`);
      } else if (medicine.stock < med.quantity) {
        issues.push(`${med.name}: Insufficient stock (need ${med.quantity}, have ${medicine.stock})`);
      }
    });
    
    return issues;
  };

  const calculateTotal = (prescription: Prescription) => {
    let total = 0;
    prescription.medications.forEach(med => {
      const medicine = medicines.find(m => 
        m.name.toLowerCase().includes(med.name.toLowerCase()) ||
        med.name.toLowerCase().includes(m.name.toLowerCase())
      );
      if (medicine) {
        total += medicine.price * med.quantity;
      }
    });
    return total;
  };

  const handleDispense = () => {
    if (!selectedPrescription) return;

    const stockIssues = checkStockAvailability(selectedPrescription);
    if (stockIssues.length > 0) {
      toast.error('Cannot dispense: ' + stockIssues.join(', '));
      return;
    }

    // Reduce stock for each medication
    const chargeItems: { name: string; quantity: number; unitPrice: number; total: number }[] = [];
    
    selectedPrescription.medications.forEach(med => {
      const medicine = medicines.find(m => 
        m.name.toLowerCase().includes(med.name.toLowerCase()) ||
        med.name.toLowerCase().includes(m.name.toLowerCase())
      );
      
      if (medicine) {
        updateMedicine(medicine.id, {
          stock: medicine.stock - med.quantity,
        });
        
        chargeItems.push({
          name: med.name,
          quantity: med.quantity,
          unitPrice: medicine.price,
          total: medicine.price * med.quantity,
        });
      }
    });

    // Mark prescription as dispensed
    updatePrescription(selectedPrescription.id, { status: 'dispensed' });

    // Send charge to accountant
    const totalAmount = chargeItems.reduce((sum, item) => sum + item.total, 0);
    
    addPharmacyCharge({
      prescriptionId: selectedPrescription.id,
      patientId: selectedPrescription.patientId,
      patientName: selectedPrescription.patientName,
      items: chargeItems,
      totalAmount,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    });

    // Notify Doctor
    addNotification({
      userId: selectedPrescription.doctorId,
      role: 'doctor',
      title: 'Prescription Dispensed',
      message: `Prescription for ${selectedPrescription.patientName} has been dispensed`,
      type: 'success',
      read: false,
    });

    // Notify Accountant
    addNotification({
      userId: '',
      role: 'accountant',
      title: 'New Pharmacy Charge',
      message: `Pharmacy charge of $${totalAmount.toFixed(2)} for ${selectedPrescription.patientName}`,
      type: 'info',
      read: false,
    });

    // Notify Patient
    addNotification({
      userId: selectedPrescription.patientId,
      role: 'patient',
      title: 'Prescription Ready',
      message: 'Your prescription is ready for pickup at the pharmacy',
      type: 'success',
      read: false,
    });

    toast.success('Prescription dispensed successfully');
    setDialogOpen(false);
    setSelectedPrescription(null);
  };

  const openDispenseDialog = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setDialogOpen(true);
  };

  return (
    <DashboardLayout navItems={navItems} title="Dispense Medications">
      <PageHeader
        title="Dispense Medications"
        description="Dispense prescribed medications and manage stock"
      />

      {pendingPrescriptions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pending prescriptions to dispense</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingPrescriptions.map((prescription) => {
            const stockIssues = checkStockAvailability(prescription);
            const total = calculateTotal(prescription);
            
            return (
              <Card key={prescription.id} className={stockIssues.length > 0 ? 'border-destructive/50' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{prescription.patientName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{prescription.doctorName}</p>
                    </div>
                    <StatusBadge status={prescription.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {prescription.medications.map((med, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{med.name}</span>
                        <span className="text-muted-foreground">x{med.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {stockIssues.length > 0 && (
                    <div className="p-2 bg-destructive/10 rounded-lg mb-3">
                      <div className="flex items-center gap-1 text-destructive text-xs">
                        <AlertTriangle className="h-3 w-3" />
                        Stock issues detected
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-semibold">${total.toFixed(2)}</span>
                    <Button 
                      size="sm" 
                      onClick={() => openDispenseDialog(prescription)}
                      disabled={stockIssues.length > 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Dispense
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dispense Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Dispensing</DialogTitle>
          </DialogHeader>
          {selectedPrescription && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium">{selectedPrescription.patientName}</p>
                <p className="text-sm text-muted-foreground">
                  Prescribed by {selectedPrescription.doctorName}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Medications to Dispense:</h4>
                {selectedPrescription.medications.map((med, idx) => {
                  const medicine = medicines.find(m => 
                    m.name.toLowerCase().includes(med.name.toLowerCase()) ||
                    med.name.toLowerCase().includes(m.name.toLowerCase())
                  );
                  return (
                    <div key={idx} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="text-sm font-medium">{med.name}</p>
                        <p className="text-xs text-muted-foreground">{med.dosage} • {med.frequency}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">x{med.quantity}</p>
                        <p className="text-xs text-muted-foreground">
                          ${medicine ? (medicine.price * med.quantity).toFixed(2) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-lg font-bold">${calculateTotal(selectedPrescription).toFixed(2)}</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleDispense} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Dispense
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PharmacistDispense;
