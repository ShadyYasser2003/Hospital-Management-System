import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { adminNavItems } from '@/constants/adminNavItems';
import { useData } from '@/contexts/DataContext';
import { MedicalReport } from '@/types';

const AdminDiagnosis = () => {
  const { medicalReports } = useData();
  const reports = medicalReports.filter((r) => r.type === 'diagnosis');

  const columns = [
    { key: 'patientName', header: 'Patient' },
    { key: 'doctorName', header: 'Doctor' },
    { key: 'date', header: 'Date' },
    { key: 'findings', header: 'Findings', render: (r: MedicalReport) => <span className="line-clamp-2">{r.findings}</span> },
  ];

  return (
    <DashboardLayout navItems={adminNavItems} title="Diagnosis Reports">
      <PageHeader title="Diagnosis Reports" description="View all diagnosis reports" />
      <DataTable data={reports} columns={columns} emptyMessage="No diagnosis reports available" />
    </DashboardLayout>
  );
};

export default AdminDiagnosis;
