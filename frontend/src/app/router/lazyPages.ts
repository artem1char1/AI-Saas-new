import { lazy } from 'react'

export const DashboardPage = lazy(() =>
  import('@/pages/dashboard').then((module) => ({ default: module.DashboardPage })),
)
export const ContactsPage = lazy(() =>
  import('@/pages/contacts').then((module) => ({ default: module.ContactsPage })),
)
export const ContactNewPage = lazy(() =>
  import('@/pages/contact-new').then((module) => ({ default: module.ContactNewPage })),
)
export const ContactDetailPage = lazy(() =>
  import('@/pages/contact-detail').then((module) => ({ default: module.ContactDetailPage })),
)
export const ContactEditPage = lazy(() =>
  import('@/pages/contact-edit').then((module) => ({ default: module.ContactEditPage })),
)
export const DealsPage = lazy(() =>
  import('@/pages/deals').then((module) => ({ default: module.DealsPage })),
)
export const DealNewPage = lazy(() =>
  import('@/pages/deal-new').then((module) => ({ default: module.DealNewPage })),
)
export const DealDetailPage = lazy(() =>
  import('@/pages/deal-detail').then((module) => ({ default: module.DealDetailPage })),
)
export const DealEditPage = lazy(() =>
  import('@/pages/deal-edit').then((module) => ({ default: module.DealEditPage })),
)
export const ActivitiesPage = lazy(() =>
  import('@/pages/activities').then((module) => ({ default: module.ActivitiesPage })),
)
export const ActivityNewPage = lazy(() =>
  import('@/pages/activity-new').then((module) => ({ default: module.ActivityNewPage })),
)
export const SettingsProfilePage = lazy(() =>
  import('@/pages/settings-profile').then((module) => ({ default: module.SettingsProfilePage })),
)
export const SettingsOrganizationPage = lazy(() =>
  import('@/pages/settings-organization').then((module) => ({
    default: module.SettingsOrganizationPage,
  })),
)
export const OrganizationOnboardingPage = lazy(() =>
  import('@/pages/organization-onboarding').then((module) => ({
    default: module.OrganizationOnboardingPage,
  })),
)
export const LoginPage = lazy(() =>
  import('@/pages/login').then((module) => ({ default: module.LoginPage })),
)
export const RegisterPage = lazy(() =>
  import('@/pages/register').then((module) => ({ default: module.RegisterPage })),
)
export const ForgotPasswordPage = lazy(() =>
  import('@/pages/forgot-password').then((module) => ({ default: module.ForgotPasswordPage })),
)
