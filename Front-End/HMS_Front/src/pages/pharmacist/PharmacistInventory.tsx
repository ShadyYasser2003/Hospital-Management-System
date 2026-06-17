import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { LayoutDashboard, Pill, Package, FileText, User, Plus, Edit, Trash2, Search, AlertTriangle, Tag, AlertCircle } from 'lucide-react';
import { useMedicines, useMedicineCategories, MEDICINES_KEY, MEDICINE_CATEGORIES_KEY } from '@/hooks/useMedicines';
import { MedicineDto } from '@/services/medicineService';
import medicineService from '@/services/medicineService';
import { useQueryClient } from '@tanstack/react-query';

const navItems = [
  { label: 'Dashboard', path: '/pharmacist', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Inventory', path: '/pharmacist/inventory', icon: <Package className="h-5 w-5" /> },
  { label: 'Prescriptions', path: '/pharmacist/prescriptions', icon: <FileText className="h-5 w-5" /> },
  { label: 'Dispense', path: '/pharmacist/dispense', icon: <Pill className="h-5 w-5" /> },
  { label: 'Profile', path: '/pharmacist/profile', icon: <User className="h-5 w-5" /> },
];

const PharmacistInventory = () => {
  const { data: medicines = [], isLoading, error } = useMedicines();
  const { data: medicineCategories = [] } = useMedicineCategories();
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [medicineDialog, setMedicineDialog] = useState(false);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<MedicineDto | null>(null);
  const [newMedicine, setNewMedicine] = useState({ name: '', genericName: '', description: '' });
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  const filteredMedicines = medicines.filter(
    (med) =>
      med.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.genericName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const lowStockMedicines = medicines.filter(
    (m) => m.status?.toUpperCase() === 'LOW_STOCK' || m.status?.toUpperCase() === 'OUT_OF_STOCK',
  );

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedicine.name) { toast.error('Medicine name is required'); return; }
    try {
      await medicineService.create(newMedicine);
      qc.invalidateQueries({ queryKey: [MEDICINES_KEY] });
      toast.success('Medicine added successfully');
      setMedicineDialog(false);
      setNewMedicine({ name: '', genericName: '', description: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add medicine');
    }
  };

  const handleUpdateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedicine) return;
    try {
      await medicineService.update(editingMedicine.id, newMedicine);
      qc.invalidateQueries({ queryKey: [MEDICINES_KEY] });
      toast.success('Medicine updated successfully');
      setMedicineDialog(false);
      setEditingMedicine(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update medicine');
    }
  };

  const handleDeleteMedicine = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    try {
      await medicineService.delete(id);
      qc.invalidateQueries({ queryKey: [MEDICINES_KEY] });
      toast.success('Medicine deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete medicine');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) { toast.error('Category name is required'); return; }
    try {
      await medicineService.createCategory(newCategory);
      qc.invalidateQueries({ queryKey: [MEDICINE_CATEGORIES_KEY] });
      toast.success('Category added');
      setCategoryDialog(false);
      setNewCategory({ name: '', description: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await medicineService.deleteCategory(id);
      qc.invalidateQueries({ queryKey: [MEDICINE_CATEGORIES_KEY] });
      toast.success('Category deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  const openEditDialog = (medicine: MedicineDto) => {
    setEditingMedicine(medicine);
    setNewMedicine({ name: medicine.name, genericName: medicine.genericName || '', description: medicine.description || '' });
    setMedicineDialog(true);
  };

  const columns = [
    { key: 'name', header: 'Medicine Name' },
    { key: 'genericName', header: 'Generic Name' },
    { key: 'description', header: 'Description', render: (m: MedicineDto) => m.description?.substring(0, 40) || '—' },
    { key: 'status', header: 'Status', render: (m: MedicineDto) => <StatusBadge status={m.status?.toLowerCase() as never} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (medicine: MedicineDto) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEditDialog(medicine)}><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteMedicine(medicine.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Medicine Inventory">
      <PageHeader
        title="Medicine Inventory"
        description="Manage pharmacy stock and categories"
        action={
          <Dialog open={medicineDialog} onOpenChange={(open) => {
            setMedicineDialog(open);
            if (!open) { setEditingMedicine(null); setNewMedicine({ name: '', genericName: '', description: '' }); }
          }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Medicine</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}</DialogTitle></DialogHeader>
              <form onSubmit={editingMedicine ? handleUpdateMedicine : handleAddMedicine} className="space-y-4">
                <div>
                  <Label>Medicine Name *</Label>
                  <Input value={newMedicine.name} onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })} required />
                </div>
                <div>
                  <Label>Generic Name</Label>
                  <Input value={newMedicine.genericName} onChange={(e) => setNewMedicine({ ...newMedicine, genericName: e.target.value })} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={newMedicine.description} onChange={(e) => setNewMedicine({ ...newMedicine, description: e.target.value })} />
                </div>
                <Button type="submit" className="w-full">{editingMedicine ? 'Update Medicine' : 'Add Medicine'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading && <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error instanceof Error ? error.message : 'Failed to load medicines'}</AlertDescription></Alert>}

      {!isLoading && !error && (
        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="low-stock">
              Low Stock
              {lowStockMedicines.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-destructive text-destructive-foreground rounded-full text-xs">{lowStockMedicines.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search medicines..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
            </div>
            <DataTable data={filteredMedicines} columns={columns} />
          </TabsContent>

          <TabsContent value="low-stock">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" />Low Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {lowStockMedicines.length === 0
                  ? <p className="text-center text-muted-foreground py-8">All medicines are adequately stocked</p>
                  : <DataTable data={lowStockMedicines} columns={columns} />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5" />Medicine Categories</CardTitle>
                <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Category</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
                    <form onSubmit={handleAddCategory} className="space-y-4">
                      <div><Label>Category Name *</Label><Input value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} required /></div>
                      <div><Label>Description</Label><Input value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} /></div>
                      <Button type="submit" className="w-full">Add Category</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {medicineCategories.map((category) => (
                    <div key={category.id} className="p-4 border rounded-lg flex items-start justify-between">
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </DashboardLayout>
  );
};

export default PharmacistInventory;
