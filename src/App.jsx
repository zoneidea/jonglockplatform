import { Navigate, Route, Routes } from 'react-router-dom';
import PlatformLayout from './layouts/PlatformLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import OrganizationsPage from './pages/OrganizationsPage.jsx';
import OrganizationDetailPage from './pages/OrganizationDetailPage.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import SubscriptionDetailPage from './pages/SubscriptionDetailPage.jsx';
import SubscriptionsPage from './pages/SubscriptionsPage.jsx';
import AppSettingsPage from './pages/AppSettingsPage.jsx';
import NotificationTestPage from './pages/NotificationTestPage.jsx';
import ProtectedRoute from './router/ProtectedRoute.jsx';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={(
          <ProtectedRoute>
            <PlatformLayout />
          </ProtectedRoute>
        )}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="organizations" element={<OrganizationsPage />} />
        <Route path="organizations/:organizationId" element={<OrganizationDetailPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="subscriptions/:subscriptionId" element={<SubscriptionDetailPage />} />
        <Route path="billing" element={<PlaceholderPage title="การเงินแพลตฟอร์ม" description="ส่วนจัดการใบแจ้งหนี้ การชำระเงิน และภาพรวมรายได้ของแพลตฟอร์ม จะพัฒนาต่อในขั้นถัดไป" />} />
        <Route path="support" element={<PlaceholderPage title="ศูนย์ช่วยเหลือ" description="ส่วนดูแล ticket และการประสานงานข้ามทุกองค์กร จะพัฒนาต่อในขั้นถัดไป" />} />
        <Route path="monitoring" element={<PlaceholderPage title="ติดตามระบบ" description="ส่วนติดตามสุขภาพระบบ งานเบื้องหลัง และเหตุการณ์สำคัญของแพลตฟอร์ม จะพัฒนาต่อในขั้นถัดไป" />} />
        <Route path="notification-test" element={<NotificationTestPage />} />
        <Route path="settings" element={<AppSettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
