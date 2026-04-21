import { lazy, Suspense } from 'react'
import { createBrowserRouter, Link } from 'react-router'

const HomePage = lazy(() => import('@/pages/home'))
const LoginPage = lazy(() => import('@/pages/login'))
const AdminLayout = lazy(() => import('@/pages/admin-layout'))
const DashboardPage = lazy(() => import('@/pages/dashboard-stats'))
const StudentsPage = lazy(() => import('@/pages/students'))
const StudentDetailPage = lazy(() => import('@/pages/student-detail'))
const CodebooksPage = lazy(() => import('@/pages/codebooks'))

const spinner = (
  <div className="flex min-h-svh items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
)

function s(el: React.ReactNode) {
  return <Suspense fallback={spinner}>{el}</Suspense>
}

function NotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Stranica nije pronađena</p>
        <Link to="/" className="mt-4 inline-block underline underline-offset-4 hover:text-primary">
          Povratak na početnu
        </Link>
        <Link to="/admin" className="mt-2 inline-block text-sm underline underline-offset-4 hover:text-primary">
          Admin panel
        </Link>
      </div>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: s(<HomePage />),
  },
  {
    path: '/admin/login',
    element: s(<LoginPage />),
  },
  {
    path: '/admin',
    element: s(<AdminLayout />),
    children: [
      { index: true, element: s(<DashboardPage />) },
      { path: 'students', element: s(<StudentsPage />) },
      { path: 'students/:id', element: s(<StudentDetailPage />) },
      { path: 'codebooks', element: s(<CodebooksPage />) },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])
