import { useState, useEffect } from 'react';

export interface PayslipData {
    id: string;
    employeeId: string;
    employeeName: string;
    period: string;
    earnings: { id: number | string; label: string; amount: number }[];
    deductions: { id: number | string; label: string; amount: number }[];
    takeHomePay: number;
    sentAt: number;
    isRead: boolean;
    pdfBlob?: string; // Flag: 'GENERATE_ON_CLIENT'
}

const STORAGE_KEY = 'payslip_storage_v2';

// FUNCTION: Send Payslip (With Error Handling)
export const sendPayslip = (data: Omit<PayslipData, 'id' | 'sentAt' | 'isRead'>): boolean => {
    try {
        // 1. Get existing data
        const existingDataStr = localStorage.getItem(STORAGE_KEY);
        const existingData: PayslipData[] = existingDataStr ? JSON.parse(existingDataStr) : [];

        // 2. Create new object
        const newPayslip: PayslipData = {
            ...data,
            id: Date.now().toString(),
            sentAt: Date.now(),
            isRead: false
        };

        // 3. Push & Save
        existingData.push(newPayslip);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));

        return true;
    } catch (error) {
        // Handle localStorage errors (quota exceeded, blocked, etc.)
        console.error('localStorage error in sendPayslip:', error);
        throw error; // Re-throw to be caught by caller
    }
};

// HOOK: Read Payslips
export const usePayslipStorage = (employeeId?: string) => {
    const [payslips, setPayslips] = useState<PayslipData[]>([]);

    useEffect(() => {
        if (!employeeId) return;

        const loadData = () => {
            const existingDataStr = localStorage.getItem(STORAGE_KEY);
            if (existingDataStr) {
                const allPayslips: PayslipData[] = JSON.parse(existingDataStr);
                // Filter by employee & Sort by Newest
                const employeePayslips = allPayslips
                    .filter(p => p.employeeId === employeeId)
                    .sort((a, b) => b.sentAt - a.sentAt);

                setPayslips(employeePayslips);
            }
        };

        loadData();

        // Listen for storage events (if multiple tabs) or custom events
        window.addEventListener('storage', loadData);
        return () => window.removeEventListener('storage', loadData);
    }, [employeeId]);

    return { payslips };
};
