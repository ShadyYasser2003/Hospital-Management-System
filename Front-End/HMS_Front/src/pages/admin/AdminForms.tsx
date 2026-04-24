import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useData } from '@/contexts/DataContext';
import { FormField, FormFieldType, MedicalForm } from '@/types';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, GripVertical, X, FileText } from 'lucide-react';
import { adminNavItems } from '@/constants/adminNavItems';

const fieldTypes: { value: FormFieldType; label: string }[] = [
  { value: 'text', label: 'Text Input' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'select', label: 'Dropdown Select' },
];

interface FormEditorProps {
  initialForm?: MedicalForm;
  onSave: (form: Omit<MedicalForm, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const FormEditor: React.FC<FormEditorProps> = ({ initialForm, onSave, onClose }) => {
  const [name, setName] = useState(initialForm?.name || '');
  const [description, setDescription] = useState(initialForm?.description || '');
  const [fields, setFields] = useState<FormField[]>(initialForm?.fields || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addField = () => {
    const newField: FormField = {
      id: String(Date.now()),
      label: '',
      type: 'text',
      required: false,
      options: [],
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleOptionChange = (fieldId: string, optionIndex: number, value: string) => {
    setFields(fields.map(f => {
      if (f.id === fieldId && f.options) {
        const newOptions = [...f.options];
        newOptions[optionIndex] = value;
        return { ...f, options: newOptions };
      }
      return f;
    }));
  };

  const addOption = (fieldId: string) => {
    setFields(fields.map(f => {
      if (f.id === fieldId) {
        return { ...f, options: [...(f.options || []), ''] };
      }
      return f;
    }));
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    setFields(fields.map(f => {
      if (f.id === fieldId && f.options) {
        return { ...f, options: f.options.filter((_, i) => i !== optionIndex) };
      }
      return f;
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Form name is required';
    }
    
    if (fields.length === 0) {
      newErrors.fields = 'At least one field is required';
    }

    fields.forEach((field, index) => {
      if (!field.label.trim()) {
        newErrors[`field_${index}_label`] = 'Field label is required';
      }
      if ((field.type === 'radio' || field.type === 'select') && (!field.options || field.options.length < 2)) {
        newErrors[`field_${index}_options`] = 'At least 2 options required';
      }
      if (field.options) {
        field.options.forEach((opt, optIdx) => {
          if (!opt.trim()) {
            newErrors[`field_${index}_option_${optIdx}`] = 'Option cannot be empty';
          }
        });
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      toast.error('Please fix the validation errors');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      fields,
      updatedAt: new Date().toISOString(),
      status: initialForm?.status || 'active',
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Form Name *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Patient Allergy Form"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
        </div>
        
        <div>
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the purpose of this form"
            rows={2}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Form Fields</Label>
          <Button onClick={addField} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </div>
        
        {errors.fields && <p className="text-sm text-destructive">{errors.fields}</p>}

        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id} className="relative">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-move" />
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Field Label *</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          placeholder="Enter field label"
                          className={errors[`field_${index}_label`] ? 'border-destructive' : ''}
                        />
                        {errors[`field_${index}_label`] && (
                          <p className="text-sm text-destructive mt-1">{errors[`field_${index}_label`]}</p>
                        )}
                      </div>
                      <div>
                        <Label>Field Type</Label>
                        <Select
                          value={field.type}
                          onValueChange={(value: FormFieldType) => updateField(field.id, { 
                            type: value, 
                            options: (value === 'radio' || value === 'select') ? ['', ''] : undefined 
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {(field.type === 'radio' || field.type === 'select') && (
                      <div className="space-y-2">
                        <Label>Options</Label>
                        {errors[`field_${index}_options`] && (
                          <p className="text-sm text-destructive">{errors[`field_${index}_options`]}</p>
                        )}
                        {field.options?.map((option, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <Input
                              value={option}
                              onChange={(e) => handleOptionChange(field.id, optIdx, e.target.value)}
                              placeholder={`Option ${optIdx + 1}`}
                              className={errors[`field_${index}_option_${optIdx}`] ? 'border-destructive' : ''}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeOption(field.id, optIdx)}
                              disabled={(field.options?.length || 0) <= 2}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(field.id)}
                        >
                          Add Option
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={field.required}
                          onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                        />
                        <Label>Required</Label>
                      </div>
                      <Input
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                        placeholder="Placeholder text (optional)"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => removeField(field.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>
          {initialForm ? 'Update Form' : 'Create Form'}
        </Button>
      </DialogFooter>
    </div>
  );
};

const AdminForms = () => {
  const { medicalForms, addMedicalForm, updateMedicalForm, deleteMedicalForm } = useData();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<MedicalForm | null>(null);

  const handleCreateForm = (form: Omit<MedicalForm, 'id' | 'createdAt'>) => {
    addMedicalForm(form);
    setCreateDialogOpen(false);
    toast.success('Form created successfully');
  };

  const handleUpdateForm = (form: Omit<MedicalForm, 'id' | 'createdAt'>) => {
    if (editingForm) {
      updateMedicalForm(editingForm.id, form);
      setEditingForm(null);
      toast.success('Form updated successfully');
    }
  };

  const handleDeleteForm = (id: string) => {
    deleteMedicalForm(id);
    toast.success('Form deleted successfully');
  };

  const handleToggleStatus = (form: MedicalForm) => {
    updateMedicalForm(form.id, { status: form.status === 'active' ? 'inactive' : 'active' });
    toast.success(`Form ${form.status === 'active' ? 'deactivated' : 'activated'}`);
  };

  return (
    <DashboardLayout navItems={adminNavItems} title="Custom Forms">
      <PageHeader 
        title="Custom Medical Forms" 
        description="Create and manage custom medical forms for patient data collection"
        action={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Form
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Medical Form</DialogTitle>
              </DialogHeader>
              <FormEditor
                onSave={handleCreateForm}
                onClose={() => setCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        }
      />

      {medicalForms.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Forms Created</h3>
            <p className="text-muted-foreground mb-4">
              Create your first custom medical form to start collecting patient data.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Form
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {medicalForms.map((form) => (
            <Card key={form.id} className={form.status === 'inactive' ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    {form.name}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Dialog open={editingForm?.id === form.id} onOpenChange={(open) => !open && setEditingForm(null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setEditingForm(form)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Medical Form</DialogTitle>
                        </DialogHeader>
                        {editingForm && (
                          <FormEditor
                            initialForm={editingForm}
                            onSave={handleUpdateForm}
                            onClose={() => setEditingForm(null)}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Form?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the form "{form.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteForm(form.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {form.description || 'No description'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {form.fields.length} field{form.fields.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {form.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    <Switch
                      checked={form.status === 'active'}
                      onCheckedChange={() => handleToggleStatus(form)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminForms;