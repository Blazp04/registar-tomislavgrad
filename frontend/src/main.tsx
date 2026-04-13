import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ErrorBoundary } from '@/components/error-boundary'
import { queryClient } from '@/lib/auth-client'
import { Toaster } from '@/components/ui/sonner'
import './index.css'

const HomePage = lazy(() => import('@/pages/home'))
const LoginPage = lazy(() => import('@/pages/login'))
const AdminLayout = lazy(() => import('@/pages/admin-layout'))
const DashboardPage = lazy(() => import('@/pages/dashboard-stats'))
const StudentsPage = lazy(() => import('@/pages/students'))
const CodebooksPage = lazy(() => import('@/pages/codebooks'))

function NotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Stranica nije pronađena</p>
        <a href="/" className="mt-4 inline-block underline underline-offset-4 hover:text-primary">
          Povratak na početnu
        </a>
        <a href="/admin" className="mt-2 inline-block text-sm underline underline-offset-4 hover:text-primary">
          Admin panel
        </a>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <Suspense fallback={
              <div className="flex min-h-svh items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            }>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/admin/login" element={<LoginPage />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="students" element={<StudentsPage />} />
                  <Route path="codebooks" element={<CodebooksPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Toaster />
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
