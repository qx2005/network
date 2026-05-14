import { Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from './layout/MainLayout'
import { DashboardPage } from './pages/DashboardPage'
import { SliceEditorPage } from './pages/slices/SliceEditorPage'
import { SlicesListPage } from './pages/slices/SlicesListPage'
import { RedcapDevicesPage } from './pages/redcap/DevicesPage'
import { PowerProfilesPage } from './pages/redcap/PowerProfilesPage'
import { MecNodesPage } from './pages/mec/MecNodesPage'
import { MecRulesPage } from './pages/mec/MecRulesPage'
import { VnPage } from './pages/lan/VnPage'
import { ProvisioningJobsPage } from './pages/system/ProvisioningJobsPage'
import { AuditLogsPage } from './pages/system/AuditLogsPage'
import { RbacMatrixPage } from './pages/system/RbacMatrixPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="slices" element={<SlicesListPage />} />
        <Route path="slices/:id" element={<SliceEditorPage />} />
        <Route path="redcap/devices" element={<RedcapDevicesPage />} />
        <Route path="redcap/profiles" element={<PowerProfilesPage />} />
        <Route path="mec/nodes" element={<MecNodesPage />} />
        <Route path="mec/rules" element={<MecRulesPage />} />
        <Route path="lan/vn" element={<VnPage />} />
        <Route path="system/jobs" element={<ProvisioningJobsPage />} />
        <Route path="system/audit" element={<AuditLogsPage />} />
        <Route path="system/rbac" element={<RbacMatrixPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
