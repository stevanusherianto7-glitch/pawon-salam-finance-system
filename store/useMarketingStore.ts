import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MarketingExpense {
    id: string;
    channel: string;
    amount: number;
    evidence?: string; // URL or base64
    campaign: string;
    date: string;
}

interface MarketingState {
    budget: number;
    expenses: MarketingExpense[];
    revenue: number; // Mock daily revenue for ROI

    setBudget: (amount: number) => void;
    addExpense: (expense: Omit<MarketingExpense, 'id' | 'date'>) => void;
    removeExpense: (id: string) => void;
    getRemainingBudget: () => number;
    getTotalSpend: () => number;
    getROAS: () => number;
}

export const useMarketingStore = create<MarketingState>()(
    persist(
        (set, get) => ({
            budget: 5000000, // Default budget
            expenses: [
                {
                    id: 'mock-1',
                    channel: 'FB Ads',
                    amount: 500000,
                    campaign: 'Promo Merdeka',
                    date: new Date().toISOString(),
                    evidence: ''
                },
                {
                    id: 'mock-2',
                    channel: 'Influencer',
                    amount: 750000,
                    campaign: 'Endorsement Selebgram',
                    date: new Date(Date.now() - 86400000).toISOString(),
                    evidence: ''
                },
                {
                    id: 'mock-3',
                    channel: 'Cetak',
                    amount: 200000,
                    campaign: 'Brosur Weekend',
                    date: new Date(Date.now() - 172800000).toISOString(),
                    evidence: ''
                }
            ],
            revenue: 15000000, // Mock revenue

            setBudget: (amount) => set({ budget: amount }),

            addExpense: (expense) =>
                set((state) => ({
                    expenses: [
                        {
                            ...expense,
                            id: `exp-${Date.now()}`,
                            date: new Date().toISOString(),
                        },
                        ...state.expenses,
                    ],
                })),

            removeExpense: (id) =>
                set((state) => ({
                    expenses: state.expenses.filter((e) => e.id !== id),
                })),

            getRemainingBudget: () => {
                const state = get();
                const totalSpend = state.expenses.reduce((sum, e) => sum + e.amount, 0);
                return state.budget - totalSpend;
            },

            getTotalSpend: () => {
                const state = get();
                return state.expenses.reduce((sum, e) => sum + e.amount, 0);
            },

            getROAS: () => {
                const state = get();
                const totalSpend = state.expenses.reduce((sum, e) => sum + e.amount, 0);
                if (totalSpend === 0) return 0;
                return state.revenue / totalSpend;
            },
        }),
        {
            name: 'marketing-storage',
        }
    )
);
