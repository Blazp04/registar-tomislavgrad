import { lazy, Suspense } from "react";
import { createBrowserRouter, Link, Navigate } from "react-router";

const PublicLayout = lazy(() => import("@/components/public-layout"));
const HomePage = lazy(() => import("@/pages/home"));
const LoginPage = lazy(() => import("@/pages/login"));
const RegisterPage = lazy(() => import("@/pages/register"));
const ForgotPasswordPage = lazy(() => import("@/pages/password").then((module) => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("@/pages/password").then((module) => ({ default: module.ResetPasswordPage })));
const PrivacyPage = lazy(() => import("@/pages/legal").then((module) => ({ default: module.PrivacyPage })));
const TermsPage = lazy(() => import("@/pages/legal").then((module) => ({ default: module.TermsPage })));
const ContactPage = lazy(() => import("@/pages/legal").then((module) => ({ default: module.ContactPage })));
const StudentLayout = lazy(() => import("@/pages/student-layout"));
const StudentDashboardPage = lazy(() => import("@/pages/student-dashboard"));
const ProfileEditorPage = lazy(() => import("@/pages/profile-editor"));
const StudentScholarshipsPage = lazy(() => import("@/pages/student-scholarships"));
const PrivacyCenterPage = lazy(() => import("@/pages/privacy-center"));
const AdminLayout = lazy(() => import("@/pages/admin-layout"));
const DashboardPage = lazy(() => import("@/pages/dashboard-stats"));
const StudentsPage = lazy(() => import("@/pages/students"));
const StudentDetailPage = lazy(() => import("@/pages/student-detail"));
const CodebooksPage = lazy(() => import("@/pages/codebooks"));
const DataRequestsPage = lazy(() => import("@/pages/data-requests"));
const AuditLogsPage = lazy(() => import("@/pages/audit-logs"));

const spinner = <div className="grid min-h-[60vh] place-items-center"><div className="size-7 animate-spin rounded-full border-2 border-foreground/10 border-t-primary" /></div>;
const suspense = (element: React.ReactNode) => <Suspense fallback={spinner}>{element}</Suspense>;

function NotFound() {
  return <div className="relative isolate grid min-h-svh place-items-center overflow-hidden bg-navy-deep px-5 text-white">
    <div className="topo absolute inset-0 -z-10 text-white/[0.08]" aria-hidden="true" />
    <div className="max-w-md text-center">
      <img src="/grb-mark.png" alt="" className="mx-auto h-14 w-auto" />
      <p className="mt-10 font-mono text-sm text-white/45">404</p>
      <h1 className="mt-3 text-5xl leading-none font-semibold tracking-[-0.04em]">Stranica nije pronađena</h1>
      <p className="mt-5 text-white/65">Provjerite adresu ili se vratite na početnu stranicu.</p>
      <Link to="/" className="mt-9 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-brand-deep">Povratak na početnu</Link>
    </div>
  </div>;
}

export const router = createBrowserRouter([
  { element: suspense(<PublicLayout />), children: [
    { path: "/", element: suspense(<HomePage />) },
    { path: "/login", element: suspense(<LoginPage />) },
    { path: "/register", element: suspense(<RegisterPage />) },
    { path: "/forgot-password", element: suspense(<ForgotPasswordPage />) },
    { path: "/reset-password", element: suspense(<ResetPasswordPage />) },
    { path: "/privacy", element: suspense(<PrivacyPage />) },
    { path: "/terms", element: suspense(<TermsPage />) },
    { path: "/contact", element: suspense(<ContactPage />) },
  ] },
  { path: "/app", element: suspense(<StudentLayout />), children: [
    { index: true, element: suspense(<StudentDashboardPage />) },
    { path: "profile", element: suspense(<ProfileEditorPage />) },
    { path: "scholarships", element: suspense(<StudentScholarshipsPage />) },
    { path: "privacy", element: suspense(<PrivacyCenterPage />) },
  ] },
  { path: "/admin/login", element: <Navigate to="/login" replace /> },
  { path: "/admin", element: suspense(<AdminLayout />), children: [
    { index: true, element: suspense(<DashboardPage />) },
    { path: "students", element: suspense(<StudentsPage />) },
    { path: "students/:id", element: suspense(<StudentDetailPage />) },
    { path: "codebooks", element: suspense(<CodebooksPage />) },
    { path: "data-requests", element: suspense(<DataRequestsPage />) },
    { path: "audit-logs", element: suspense(<AuditLogsPage />) },
  ] },
  { path: "*", element: <NotFound /> },
]);
