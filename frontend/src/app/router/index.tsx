import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider } from '@/features/auth-session'
import { OrganizationProvider } from '@/features/organization-setup'
import { AuthErrorBridge } from '@/features/error-handling'
import { AppLayout } from '@/widgets/app-layout'
import { AuthLayout } from '@/widgets/auth-layout'
import { OnboardingLayout } from '@/widgets/onboarding-layout'

import { GuestRoute } from './GuestRoute'
import {
  ActivitiesPage,
  ActivityNewPage,
  ContactDetailPage,
  ContactEditPage,
  ContactNewPage,
  ContactsPage,
  DashboardPage,
  DealDetailPage,
  DealEditPage,
  DealNewPage,
  DealsPage,
  ForgotPasswordPage,
  LoginPage,
  OrganizationOnboardingPage,
  RegisterPage,
  SettingsOrganizationPage,
  SettingsProfilePage,
} from './lazyPages'
import { OrganizationOnboardingRoute } from './OrganizationOnboardingRoute'
import { OrganizationRequiredRoute } from './OrganizationRequiredRoute'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OrganizationProvider>
          <AuthErrorBridge />
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route element={<OrganizationOnboardingRoute />}>
                <Route element={<OnboardingLayout />}>
                  <Route path="/onboarding/organization" element={<OrganizationOnboardingPage />} />
                </Route>
              </Route>

              <Route element={<OrganizationRequiredRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />

                  <Route path="/contacts" element={<ContactsPage />} />
                  <Route path="/contacts/new" element={<ContactNewPage />} />
                  <Route path="/contacts/:contactId" element={<ContactDetailPage />} />
                  <Route path="/contacts/:contactId/edit" element={<ContactEditPage />} />

                  <Route path="/deals" element={<DealsPage />} />
                  <Route path="/deals/new" element={<DealNewPage />} />
                  <Route path="/deals/:dealId/edit" element={<DealEditPage />} />
                  <Route path="/deals/:dealId" element={<DealDetailPage />} />

                  <Route path="/activities" element={<ActivitiesPage />} />
                  <Route path="/activities/new" element={<ActivityNewPage />} />

                  <Route path="/settings/profile" element={<SettingsProfilePage />} />
                  <Route path="/settings/organization" element={<SettingsOrganizationPage />} />
                </Route>
              </Route>
            </Route>

            <Route element={<GuestRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </OrganizationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
