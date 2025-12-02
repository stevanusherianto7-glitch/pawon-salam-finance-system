import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OpexLog {
    id: string;
    type: 'petty' | 'waste';
    name: string;
    reason: string;
    price: number;
    qty?: number;
    category?: string;
    date: string;
}

interface OpexState {
    utilities: {
        gas: number;
        listrik: number;
        air: number;
        internet: number;
    };
    logs: OpexLog[];

    setUtility: (key: keyof OpexState['utilities'], value: number) => void;
    addLog: (log: Omit<OpexLog, 'id' | 'date'>) => void;
    removeLog: (id: string) => void;
    getTotalExpense: () => number;
}

export const useOpexStore = create<OpexState>()(
    persist(
        (set, get) => ({
            utilities: {
                gas: 0,
                listrik: 0,
                air: 0,
                internet: 0,
            },
            logs: [],

            setUtility: (key, value) =>
                set((state) => ({
                    utilities: { ...state.utilities, [key]: value }
                })),

            addLog: (log) =>
                set((state) => ({
                    logs: [
                        {
                            ...log,
                            id: `log-${Date.now()}`,
                            date: new Date().toISOString()
                        },
                        ...state.logs
                    ]
                })),

            removeLog: (id) =>
                set((state) => ({
                    logs: state.logs.filter(l => l.id !== id)
                })),

            getTotalExpense: () => {
                const state = get();
                const utilitiesTotal = Object.values(state.utilities).reduce((a, b) => a + b, 0);
                const logsTotal = state.logs.reduce((sum, log) => sum + log.price, 0);
                return utilitiesTotal + logsTotal;
            }
        }),
        {
            name: 'opex-storage',
        }
    )
);
