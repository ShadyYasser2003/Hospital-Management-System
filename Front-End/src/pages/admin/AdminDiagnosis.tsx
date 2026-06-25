import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminNavItems } from '@/constants/adminNavItems';
import { useLabTests } from '@/hooks/useLabTests';
import { useRadiologyOrders } from '@/hooks/useRadiologyOrders';
import { LabTestDto } from '@/services/labTestService';
import { RadiologyOrderDto } from '@/services/radiologyService';
import { fmtDate, normStatus, isCompleted, fmtOrderType } from '@/lib/diagnosticUtils';
import CriticalBadge from '@/components/shared/CriticalBadge';
import { TestTube, Radiation } from 'lucide-react';

/**
 * AdminDiagnosis — shows all completed lab tests and radiology orders.
 * Migrated from /api/test-requests to /api/lab-tests + /api/radiology-orders.
 */
const AdminDiagnosis = () => {
  const { data: labTests = [],  isLoading: loadingLab } = useLabTests();
  const { data: radOrders = [], isLoading: loadingRad } = useRadiologyOrders();

  const completedLabs = labTests.filter(isCompleted);
  const completedRad  = radOrders.filter(isCompleted);
  const isLoading     = loadingLab || loadingRad;

  const labColumns = [
    { key: 'patientName',    header: 'Patient' },
    { key: 'doctorName',     header: 'Doctor' },
    { key: 'technicianName', header: 'Technician',  render: (t: LabTestDto) => t.technicianName ?? '—' },
    { key: 'testType',       header: 'Test Type' },
    { key: 'completedAt',    header: 'Date',        render: (t: LabTestDto) => fmtDate(t.completedAt) },
    { key: 'result',         header: 'Result',      render: (t: LabTestDto) => <span className="line-clamp-2 text-sm">{t.result || '—'}</span> },
    { key: 'referenceRange', header: 'Ref. Range',  render: (t: LabTestDto) => t.referenceRange ?? '—' },
    { key: 'isCritical',     header: 'Critical',    render: (t: LabTestDto) => <CriticalBadge isCritical={t.isCritical} showNormal /> },
    { key: 'status',         header: 'Status',      render: (t: LabTestDto) => <StatusBadge status={normStatus(t.status).toLowerCase() as never} /> },
  ];

  const radColumns = [
    { key: 'patientName',    header: 'Patient' },
    { key: 'doctorName',     header: 'Doctor' },
    { key: 'technicianName', header: 'Technician',  render: (r: RadiologyOrderDto) => r.technicianName ?? '—' },
    { key: 'orderType',      header: 'Order Type',  render: (r: RadiologyOrderDto) => fmtOrderType(r.orderType) },
    { key: 'bodyPart',       header: 'Body Part',   render: (r: RadiologyOrderDto) => r.bodyPart ?? '—' },
    { key: 'completedAt',    header: 'Date',        render: (r: RadiologyOrderDto) => fmtDate(r.completedAt) },
    { key: 'reportFindings', header: 'Findings',    render: (r: RadiologyOrderDto) => <span className="line-clamp-2 text-sm">{r.reportFindings || '—'}</span> },
    { key: 'impression',     header: 'Impression',  render: (r: RadiologyOrderDto) => <span className="line-clamp-1 text-sm">{r.impression || '—'}</span> },
    { key: 'isCritical',     header: 'Critical',    render: (r: RadiologyOrderDto) => <CriticalBadge isCritical={r.isCritical} showNormal /> },
    { key: 'status',         header: 'Status',      render: (r: RadiologyOrderDto) => <StatusBadge status={normStatus(r.status).toLowerCase() as never} /> },
  ];

  return (
    <DashboardLayout navItems={adminNavItems} title="Diagnosis Reports">
      <PageHeader
        title="Diagnosis & Lab Reports"
        description="All completed diagnostic test results and radiology findings"
      />
      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (
        <Tabs defaultValue="lab">
          <TabsList>
            <TabsTrigger value="lab" className="gap-2">
              <TestTube className="h-4 w-4" />Lab Results ({completedLabs.length})
            </TabsTrigger>
            <TabsTrigger value="radiology" className="gap-2">
              <Radiation className="h-4 w-4" />Radiology Reports ({completedRad.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="lab">
            <DataTable data={completedLabs} columns={labColumns} emptyMessage="No completed lab results" />
          </TabsContent>
          <TabsContent value="radiology">
            <DataTable data={completedRad} columns={radColumns} emptyMessage="No completed radiology reports" />
          </TabsContent>
        </Tabs>
      )}
    </DashboardLayout>
  );
};

export default AdminDiagnosis;
