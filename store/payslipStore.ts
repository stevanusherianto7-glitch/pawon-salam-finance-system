import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FinancialItem {
    id: number;
    label: string;
    amount: number;
}

export interface PayslipData {
    id: string;
    employeeId: string;
    employeeName: string;
    period: string;
    pdfBlob: string; // base64 encoded PDF data URL
    sentAt: number; // timestamp
    earnings: FinancialItem[];
    deductions: FinancialItem[];
    takeHomePay: number;
    isRead: boolean;
}

interface PayslipStore {
    payslips: PayslipData[];
    addPayslip: (payslip: Omit<PayslipData, 'isRead'>) => void;
    getPayslipsByEmployee: (employeeId: string) => PayslipData[];
    getUnreadCount: (employeeId: string) => number;
    markAsRead: (payslipId: string) => void;
}

export const usePayslipStore = create<PayslipStore>()(
    persist(
        (set, get) => ({
            payslips: [],

            addPayslip: (payslip) => {
                set((state) => ({
                    payslips: [
                        ...state.payslips,
                        { ...payslip, isRead: false }
                    ]
                }));
            },

            getPayslipsByEmployee: (employeeId) => {
                return get().payslips
                    .filter(p => p.employeeId === employeeId)
                    .sort((a, b) => b.sentAt - a.sentAt); // newest first
            },

            getUnreadCount: (employeeId) => {
                return get().payslips
                    .filter(p => p.employeeId === employeeId && !p.isRead)
                    .length;
            },

            markAsRead: (payslipId) => {
                set((state) => ({
                    payslips: state.payslips.map(p =>
                        p.id === payslipId ? { ...p, isRead: true } : p
                    )
                }));
            }
        }),
        {
            name: 'payslip-storage'
        }
    )
);
