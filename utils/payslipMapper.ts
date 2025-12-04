import { Employee, UserRole } from '../types';

export interface PayslipEmployeeDetails {
    role: string;       // Formal Job Title
    department: string;
    status: string;     // Karyawan Tetap, Kontrak, Harian Lepas
    grade: string;      // Grade A, B, C, D
}

export const mapRoleToDetails = (employee: Employee): PayslipEmployeeDetails => {
    const { role, department: existingDept } = employee;

    let formalRole = '';
    let formalDept = '';
    let status = '';
    let grade = '';

    switch (role) {
        case UserRole.SUPER_ADMIN:
            formalRole = 'IT Support System';
            formalDept = 'IT Engineer';
            status = 'Karyawan Tetap';
            grade = 'Grade A';
            break;

        case UserRole.BUSINESS_OWNER:
            formalRole = 'CEO / Owner';
            formalDept = 'Executive';
            status = 'Karyawan Tetap';
            grade = 'Grade A';
            break;

        case UserRole.HR_MANAGER:
            formalRole = 'HR Manager';
            formalDept = 'Human Resources';
            status = 'Karyawan Tetap';
            grade = 'Grade A';
            break;

        case UserRole.FINANCE_MANAGER:
            formalRole = 'Finance Manager';
            formalDept = 'Finance & Accounting';
            status = 'Karyawan Tetap';
            grade = 'Grade A';
            break;

        case UserRole.RESTAURANT_MANAGER:
            formalRole = 'Restaurant Manager';
            formalDept = 'Operational';
            status = 'Karyawan Tetap';
            grade = 'Grade B';
            break;

        case UserRole.MARKETING_MANAGER:
            formalRole = 'Marketing Manager';
            formalDept = 'Marketing & Sales';
            status = 'Karyawan Tetap';
            grade = 'Grade B';
            break;

        case UserRole.ADMIN:
            formalRole = 'Admin Staff';
            formalDept = existingDept || 'Administration';
            status = 'Karyawan Kontrak';
            grade = 'Grade C';
            break;

        case UserRole.EMPLOYEE:
        default:
            // Fallback for generic employees
            formalRole = 'Staff';
            formalDept = existingDept || 'General';
            status = 'Harian Lepas';
            grade = 'Grade D';
            break;
    }

    return {
        role: formalRole,
        department: formalDept,
        status,
        grade
    };
};
