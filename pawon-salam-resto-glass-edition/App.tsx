import React, { useState, useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { LoginScreen } from './screens/LoginScreen';

import { EmployeeDashboardScreen } from './screens/employee/EmployeeDashboardScreen';
import { AttendanceHistoryScreen } from './screens/employee/AttendanceHistoryScreen';
import { ProfileScreen } from './screens/employee/ProfileScreen';
import { LeaveRequestScreen } from './screens/employee/LeaveRequestScreen';
import { DailyJobdeskScreen } from './screens/employee/DailyJobdeskScreen';
import { AdminDashboardScreen } from './screens/admin/AdminDashboardScreen';
import { AdminEmployeeListScreen } from './screens/admin/AdminEmployeeListScreen';
import { AdminAttendanceListScreen } from './screens/admin/AdminAttendanceListScreen';
import { PerformanceFormScreen } from './screens/admin/PerformanceFormScreen';
import { PerformanceDetailScreen } from './screens/admin/PerformanceDetailScreen';
import { DailyChecklistListScreen } from './screens/admin/DailyChecklistListScreen';
import { DailyChecklistFormScreen } from './screens/admin/DailyChecklistFormScreen';
import { HRPerformanceDashboardScreen } from './screens/admin/HRPerformanceDashboardScreen';
import { HRSpCoachingFormScreen } from './screens/admin/HRSpCoachingFormScreen';
import { HRTrendReportScreen } from './screens/admin/HRTrendReportScreen';
import { HRTopPerformanceScreen } from './screens/admin/HRTopPerformanceScreen';
import { FinancePanel, MarketingPanel } from './screens/admin/ManagerPanels';
import { PayslipListScreen } from './screens/admin/PayslipListScreen';
import { PayslipFormScreen } from './screens/admin/PayslipFormScreen';
import { EmployeePayslipListScreen } from './screens/employee/EmployeePayslipListScreen';
import { EmployeePayslipDetailScreen } from './screens/employee/EmployeePayslipDetailScreen';
import { ShiftSchedulerScreen } from './screens/admin/ShiftSchedulerScreen';
import { SystemSettingsScreen } from './screens/admin/SystemSettingsScreen';
import { AuditLogScreen } from './screens/admin/AuditLogScreen';
import { CertificateScreen } from './screens/admin/CertificateScreen';
import { AdminLeaveRequestScreen } from './screens/admin/AdminLeaveRequestScreen';
import { BottomTab } from './components/BottomTab';
import { ImpersonationBanner } from './components/ImpersonationBanner';
import { ToastContainer } from './components/Toast';
import { SpecialNotificationBanner } from './components/SpecialNotificationBanner';
import { UserRole } from './types';
import { colors } from './theme/colors';

import { FinanceInputScreen } from './screens/finance/FinanceInputScreen';
import { ReportFinancialScreen } from './screens/admin/ReportFinancialScreen';
import { ReportRevenueCostScreen } from './screens/admin/ReportRevenueCostScreen';
import { ReportOperationalScreen } from './screens/admin/ReportOperationalScreen';
import { ReportHRScreen } from './screens/admin/ReportHRScreen';
import { ReportMarketingScreen } from './screens/admin/ReportMarketingScreen';
import { JobdeskMonitorScreen } from './screens/admin/JobdeskMonitorScreen';
import { BroadcastScreen } from './screens/employee/BroadcastScreen';
import { HRDailyMonitorHubScreen } from './screens/admin/HRDailyMonitorHubScreen';
import { ErrorBoundary } from './components/ErrorBoundary';

const App = () => {
  const { isAuthenticated, user, isImpersonating } = useAuthStore();
  const [currentScreen, setCurrentScreen] = useState('shiftScheduler');
  const [screenParams, setScreenParams] = useState<any>(null);
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);

  const handleNavigate = (screen: string, params?: any) => {
    if (params) setScreenParams(params);
    setCurrentScreen(screen);
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Determine default screen based on EFFECTIVE role (impersonated or real)
      const role = user?.role || UserRole.EMPLOYEE;

      if ([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.RESTAURANT_MANAGER, UserRole.HR_MANAGER, UserRole.BUSINESS_OWNER, UserRole.FINANCE_MANAGER, UserRole.MARKETING_MANAGER].includes(role)) {
        setCurrentScreen('adminDashboard');
      } else {
        setCurrentScreen('dashboard');
      }
    }
  }, [isAuthenticated, user, isImpersonating]);

  const renderScreen = () => {
    if (!isAuthenticated) return <LoginScreen />;

    // --- ADMIN / MANAGER ROUTES ---
    if ([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.RESTAURANT_MANAGER, UserRole.HR_MANAGER, UserRole.BUSINESS_OWNER, UserRole.FINANCE_MANAGER, UserRole.MARKETING_MANAGER].includes(user?.role || UserRole.EMPLOYEE)) {
      switch (currentScreen) {
        case 'adminDashboard': return <AdminDashboardScreen onNavigate={handleNavigate} />;
        case 'adminEmployees': return <AdminEmployeeListScreen />;
        case 'adminAttendance': return <AdminAttendanceListScreen />;
        case 'broadcast': return <BroadcastScreen />;

        // Specialized Panels (Legacy, kept for Finance & Marketing)
        case 'financePanel': return <FinancePanel onBack={() => setCurrentScreen('adminDashboard')} />;
        case 'financeInput': return <FinanceInputScreen onBack={() => setCurrentScreen('adminDashboard')} />; // NEW ROUTE
        case 'marketingPanel': return <MarketingPanel onBack={() => setCurrentScreen('adminDashboard')} />;

        // This screen is now part of AdminDashboard, but we keep the route for modularity if needed
        case 'hrPerformance': return <AdminDashboardScreen onNavigate={handleNavigate} />;

        case 'hrSpCoachingForm': return <HRSpCoachingFormScreen onBack={() => setCurrentScreen('adminDashboard')} />;

        case 'hrTrendReport': return <HRTrendReportScreen onBack={() => setCurrentScreen('adminDashboard')} />;

        case 'hrTopPerformance': return <HRTopPerformanceScreen onBack={() => setCurrentScreen('adminDashboard')} />;

        case 'shiftScheduler':
          return <ShiftSchedulerScreen onBack={() => setCurrentScreen('adminDashboard')} />;

        case 'adminLeaveRequest':
          return <AdminLeaveRequestScreen onBack={() => setCurrentScreen('adminDashboard')} />;

        case 'performanceForm':
          return <PerformanceFormScreen employeeId={selectedEmpId!} onBack={() => setCurrentScreen('adminEmployees')} />;

        case 'performanceDetail':
          return <PerformanceDetailScreen employeeId={selectedEmpId!} onBack={() => setCurrentScreen('adminEmployees')} />;

        case 'dailyChecklistList':
          return <DailyChecklistListScreen onBack={() => setCurrentScreen('adminDashboard')} onNavigate={handleNavigate} />;
        case 'dailyChecklistForm':
          return <DailyChecklistFormScreen
            employeeId={screenParams?.employeeId}
            date={screenParams?.date}
            onBack={() => setCurrentScreen('dailyChecklistList')}
          />;

        // NEW: Jobdesk Monitor for Resto Manager
        case 'jobdeskMonitor':
          return <JobdeskMonitorScreen onBack={() => setCurrentScreen('adminDashboard')} />;

        // NEW: Hub for HR/Owner
        case 'hrDailyMonitorHub':
          return <HRDailyMonitorHubScreen onBack={() => setCurrentScreen('adminDashboard')} onNavigate={handleNavigate} />;

        // Payroll - Admin/HR/Finance
        case 'payslipList':
          return <PayslipListScreen onBack={() => setCurrentScreen('adminDashboard')} onNavigate={handleNavigate} />;
        case 'payslipForm':
          return <PayslipFormScreen
            onBack={() => setCurrentScreen('payslipList')}
            payslipId={screenParams?.payslipId}
            isNew={screenParams?.isNew}
            initialMonth={screenParams?.month}
            initialYear={screenParams?.year}
          />;

        // Super Admin Tools
        case 'systemSettings': return <SystemSettingsScreen onBack={() => setCurrentScreen('adminDashboard')} />;
        case 'auditLogs': return <AuditLogScreen onBack={() => setCurrentScreen('adminDashboard')} />;

        case 'certificate':
          return <CertificateScreen onBack={() => {
            // Determine where to go back based on role
            if (user?.role === UserRole.HR_MANAGER) setCurrentScreen('adminDashboard');
            else setCurrentScreen('dashboard');
          }} />;

        // New Business Owner Reports
        case 'reportFinancial': return <ReportFinancialScreen onBack={() => setCurrentScreen('adminDashboard')} />;
        case 'reportRevenueCost': return <ReportRevenueCostScreen onBack={() => setCurrentScreen('adminDashboard')} />;
        case 'reportOperational': return <ReportOperationalScreen onBack={() => setCurrentScreen('adminDashboard')} />;
        case 'reportMarketing': return <ReportMarketingScreen onBack={() => setCurrentScreen('adminDashboard')} />;
        case 'reportHR': return <ReportHRScreen onBack={() => setCurrentScreen('adminDashboard')} />;

        default: return <AdminDashboardScreen onNavigate={handleNavigate} />;
      }
    }

    // --- EMPLOYEE ROUTES ---
    switch (currentScreen) {
      case 'dashboard': return <EmployeeDashboardScreen onNavigate={handleNavigate} />;
      case 'history': return <AttendanceHistoryScreen />;
      case 'broadcast': return <BroadcastScreen />;
      case 'leaveRequest': return <LeaveRequestScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'profile': return <ProfileScreen />;
      case 'dailyJobdesk': return <DailyJobdeskScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'performanceDetail':
        return <PerformanceDetailScreen employeeId={user!.id} onBack={() => setCurrentScreen('dashboard')} />;

      // Payroll - Employee
      case 'employeePayslips':
        return <EmployeePayslipListScreen onBack={() => setCurrentScreen('dashboard')} onNavigate={handleNavigate} />;
      case 'employeePayslipDetail':
        return <EmployeePayslipDetailScreen payslipId={screenParams?.payslipId} onBack={() => setCurrentScreen('employeePayslips')} />;

      // Shared Reports for Employee (Access from Dashboard)
      case 'hrTrendReport': return <HRTrendReportScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'hrTopPerformance': return <HRTopPerformanceScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'certificate': return <CertificateScreen onBack={() => setCurrentScreen('dashboard')} />;

      default: return <EmployeeDashboardScreen onNavigate={handleNavigate} />;
    }
  };

  const exclusionList = [
    'leaveRequest', 'performanceForm', 'performanceDetail',
    'dailyChecklistList', 'dailyChecklistForm', 'financePanel', 'financeInput',
    'marketingPanel', 'hrPerformance', 'payslipList', 'payslipForm',
    'employeePayslips', 'employeePayslipDetail', 'shiftScheduler',
    'systemSettings', 'auditLogs', 'dailyJobdesk', 'certificate',
    'hrSpCoachingForm', 'hrTrendReport', 'hrTopPerformance',
    'adminLeaveRequest',
    'jobdeskMonitor', // Add here
    'hrDailyMonitorHub', // Add new Hub here
    // New report screens
    'reportFinancial', 'reportRevenueCost', 'reportOperational', 'reportHR', 'reportMarketing'
  ];


  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-200 flex justify-center font-sans" style={{ backgroundColor: '#e5e7eb' }}>
        <div className="w-full max-w-md bg-gray-50 min-h-screen relative overflow-hidden border-x border-gray-200">
          <ImpersonationBanner />
          <ToastContainer />
          <SpecialNotificationBanner />

          <div className={`${isImpersonating ? 'pt-12' : ''} h-full`}>
            {renderScreen()}
          </div>

          {isAuthenticated && user && !exclusionList.includes(currentScreen) && (
            <BottomTab role={user.role} currentScreen={currentScreen} onNavigate={handleNavigate} />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;