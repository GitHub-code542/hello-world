import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { IncomeExpenses } from '@/pages/IncomeExpenses';
import { BalanceSheet } from '@/pages/BalanceSheet';
import { Timeline } from '@/pages/Timeline';
import { useAuthStore } from '@/stores/authStore';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* Protected routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route path="income-expenses" element={<IncomeExpenses />} />
                <Route path="balance-sheet" element={<BalanceSheet />} />
                <Route path="timeline" element={<Timeline />} />
                <Route path="/" element={<Navigate to="income-expenses" replace />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
