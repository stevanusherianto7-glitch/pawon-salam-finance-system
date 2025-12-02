// Backend API Request/Response Type Definitions
// This file provides type safety for Express.js routes

import { AttendanceStatus, ShiftType, UserRole } from '../types';

// ============================================
// AUTHENTICATION REQUEST TYPES
// ============================================

export interface LoginRequest {
    phone: string;
}

export interface AdminLoginRequest {
    email: string;
    password: string;
}

// ============================================
// EMPLOYEE MANAGEMENT REQUEST TYPES
// ============================================

export interface CreateEmployeeRequest {
    name: string;
    email: string;
    phone?: string;
    pin?: string;
    role: UserRole;
    department: string;
    area: string;
    address?: string;
    avatarUrl?: string;
}

export interface UpdateEmployeeRequest {
    name?: string;
    email?: string;
    phone?: string;
    pin?: string;
    role?: UserRole;
    department?: string;
    area?: string;
    address?: string;
    avatarUrl?: string;
}

// ============================================
// ATTENDANCE REQUEST TYPES
// ============================================

export interface CheckInRequest {
    employeeId: string;
    latitude: number;
    longitude: number;
    photoInUrl?: string;
    status: AttendanceStatus;
}

export interface CheckOutRequest {
    logId: string;
}

// ============================================
// JOBDESK REQUEST TYPES
// ============================================

export interface SaveJobdeskRequest {
    employeeId: string;
    date: string;
    area: string;
    completedTaskIds: string[];
}

export interface JobdeskFeedbackRequest {
    managerNote: string;
}

// ============================================
// PERFORMANCE REQUEST TYPES
// ============================================

export interface SavePerformanceSnapshotRequest {
    employeeId: string;
    date: string;
    dailyChecklist: any; // JSON type
    punctualityScore?: number;
    status?: string;
    summaryComment?: string;
    area: string;
}

export interface SavePerformanceReviewRequest {
    id?: string;
    employeeId: string;
    reviewerId: string;
    periodMonth: number;
    periodYear: number;
    area: string;
    scores: any; // JSON type
    notes: any; // JSON type
    overallScore: number;
    overallComment: string;
    isFinalized: boolean;
}

// ============================================
// SHIFT MANAGEMENT REQUEST TYPES
// ============================================

export interface GenerateShiftsRequest {
    month: number;
    year: number;
}

export interface UpdateShiftRequest {
    type: ShiftType;
}

export interface PublishShiftsRequest {
    month: number;
    year: number;
}

// ============================================
// PAYROLL REQUEST TYPES
// ============================================

export interface SavePayslipRequest {
    id?: string;
    employeeId: string;
    periodMonth: number;
    periodYear: number;
    payDate: string;
    basicSalary: number;
    allowanceMeal: number;
    allowanceTransport: number;
    allowanceOther: number;
    overtimeHours: number;
    overtimeAmount: number;
    bonus: number;
    commission: number;
    bpjsKesehatan: number;
    bpjsKetenagakerjaan: number;
    taxPPh21: number;
    otherDeductions: number;
    totalEarnings: number;
    totalDeductions: number;
    netSalary: number;
    status: string;
    isVisibleToEmployee: boolean;
    notesForEmployee?: string;
    notesInternalHr?: string;
    createdByHrId: string;
}
