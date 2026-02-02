import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { AuthProvider, useAuth } from '@/lib/AuthContext'
import { Toaster } from '@/components/ui/toaster'
import { AppLayout } from '@/components/layout/AppLayout'

// Lazy-loaded pages for code splitting
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const ProductsPage = lazy(() => import('@/pages/ProductsPage').then((m) => ({ default: m.ProductsPage })))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })))
const BiofactoryWizardPage = lazy(() => import('@/pages/BiofactoryWizardPage').then((m) => ({ default: m.BiofactoryWizardPage })))
const FieldsPage = lazy(() => import('@/pages/FieldsPage').then((m) => ({ default: m.FieldsPage })))
const FieldActivityPage = lazy(() => import('@/pages/FieldActivityPage').then((m) => ({ default: m.FieldActivityPage })))
const BatchesPage = lazy(() => import('@/pages/BatchesPage').then((m) => ({ default: m.BatchesPage })))
const BatchDetailPage = lazy(() => import('@/pages/BatchDetailPage').then((m) => ({ default: m.BatchDetailPage })))
const TimelinePage = lazy(() => import('@/pages/TimelinePage').then((m) => ({ default: m.TimelinePage })))
const TraceabilityPage = lazy(() => import('@/pages/TraceabilityPage').then((m) => ({ default: m.TraceabilityPage })))
const QRScannerPage = lazy(() => import('@/pages/QRScannerPage').then((m) => ({ default: m.QRScannerPage })))
const TracePublicPage = lazy(() => import('@/pages/TracePublicPage').then((m) => ({ default: m.TracePublicPage })))
const CompliancePage = lazy(() => import('@/pages/CompliancePage').then((m) => ({ default: m.CompliancePage })))
const AuditPage = lazy(() => import('@/pages/AuditPage').then((m) => ({ default: m.AuditPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="fields" element={<FieldsPage />} />
          <Route path="fields/activity/new" element={<FieldActivityPage />} />
          <Route path="batches" element={<BatchesPage />} />
          <Route path="batches/:id" element={<BatchDetailPage />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="traceability" element={<TraceabilityPage />} />
          <Route path="scanner" element={<QRScannerPage />} />
          <Route path="compliance" element={<CompliancePage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="biofactory/new" element={<BiofactoryWizardPage />} />
        </Route>
        {/* Public route — no auth required */}
        <Route path="/trace/:batchNumber" element={<TracePublicPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
