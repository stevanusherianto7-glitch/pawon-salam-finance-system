
// FIX: Added EmployeeArea and SHIFT_COLORS to the import from ../types to resolve reference errors.
import { ApiResponse, AttendanceLog, Employee, UserRole, ShiftAssignment, ShiftType, JobdeskSubmission, DailyPerformanceSnapshot, PerformanceReview, Payslip, LeaveRequest, EmployeeArea, SHIFT_COLORS, Message, MessageAudience, Transaction } from "../types";
import { MOCK_EMPLOYEES, MOCK_ATTENDANCE, MOCK_SHIFTS, MOCK_DAILY_SNAPSHOTS, MOCK_PERFORMANCE_REVIEWS, MOCK_PAYSLIPS, MOCK_LEAVE_REQUESTS, MOCK_MESSAGES } from "./mockData";

// --- SIMULATED MOCK API ---
// This file simulates a backend server by returning mock data.
// No actual network requests are made. This ensures the app always works
// without needing a separate backend server or tunnel.

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to wrap mock data in a standard API response format
const createSuccessResponse = <T>(data: T, message: string = "Success"): ApiResponse<T> => ({
    success: true,
    message,
    data,
});

const createErrorResponse = (message: string): ApiResponse<any> => ({
    success: false,
    message,
});

export const authApi = {
    login: async (credentials: { phone: string }): Promise<ApiResponse<Employee>> => {
        await delay(500);
        console.log(`[Mock Login] Attempt for phone: ${credentials.phone}`);

        const user = MOCK_EMPLOYEES.find(emp => emp.phone === credentials.phone);

        if (!user) {
            return createErrorResponse("Nomor HP tidak terdaftar.");
        }

        // PIN check removed for production ease
        console.log(`[Mock Login] Login success for ${user.name}`);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { pin, ...userData } = user;
        return createSuccessResponse(userData, "Login Berhasil!");
    },
    loginSuperAdmin: async (email: string, password: string): Promise<ApiResponse<Employee>> => {
        await delay(500);
        const admin = MOCK_EMPLOYEES.find(e => e.email === email && e.role === UserRole.SUPER_ADMIN);
        if (!admin) return createErrorResponse("Akun Super Admin tidak ditemukan.");
        if (password !== 'admin123') return createErrorResponse("Password salah.");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { pin, ...adminData } = admin;
        return createSuccessResponse(adminData, "Welcome, Super Admin!");
    }
};

export const employeeApi = {
    getAll: async (): Promise<ApiResponse<Employee[]>> => {
        await delay(300);
        const safeEmployees = MOCK_EMPLOYEES.map(emp => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { pin, ...rest } = emp;
            return rest;
        });
        return createSuccessResponse(safeEmployees);
    },
    addEmployee: async (data: any): Promise<ApiResponse<Employee>> => {
        await delay(400);
        const newEmployee: Employee = {
            id: `emp-${Date.now()}`,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`,
            ...data
        };
        MOCK_EMPLOYEES.push(newEmployee);
        return createSuccessResponse(newEmployee, "Karyawan berhasil ditambahkan");
    },
    updateEmployee: async (id: string, data: any): Promise<ApiResponse<Employee>> => {
        await delay(400);
        const index = MOCK_EMPLOYEES.findIndex(e => e.id === id);
        if (index === -1) return createErrorResponse("Karyawan tidak ditemukan");
        MOCK_EMPLOYEES[index] = { ...MOCK_EMPLOYEES[index], ...data };
        return createSuccessResponse(MOCK_EMPLOYEES[index], "Data berhasil diperbarui");
    },
    getBirthdays: async (): Promise<ApiResponse<Employee[]>> => {
        await delay(200);
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();

        const birthdays = MOCK_EMPLOYEES.filter(e => {
            if (!e.birthDate) return false;
            const bdate = new Date(e.birthDate);
            // Adjust for timezone differences when comparing dates
            const userTimezoneOffset = bdate.getTimezoneOffset() * 60000;
            const adjustedBDate = new Date(bdate.getTime() + userTimezoneOffset);
            return (adjustedBDate.getMonth() + 1) === month && adjustedBDate.getDate() === day;
        });
        return createSuccessResponse(birthdays, "Birthdays fetched");
    }
};

export const attendanceApi = {
    getTodayLog: async (employeeId: string): Promise<ApiResponse<AttendanceLog>> => {
        await delay(400);
        const todayStr = new Date().toISOString().split('T')[0];
        const log = MOCK_ATTENDANCE.find(l => l.employeeId === employeeId && l.date === todayStr);
        return createSuccessResponse(log as AttendanceLog);
    },
    checkIn: async (data: any): Promise<ApiResponse<AttendanceLog>> => {
        await delay(600);
        const todayStr = new Date().toISOString().split('T')[0];
        const newLog: AttendanceLog = {
            id: `att-${Date.now()}`,
            date: todayStr,
            checkInTime: new Date().toISOString(),
            ...data
        };
        MOCK_ATTENDANCE.push(newLog);
        return createSuccessResponse(newLog, "Check-in berhasil!");
    },
    checkOut: async (logId: string): Promise<ApiResponse<AttendanceLog>> => {
        await delay(600);
        const logIndex = MOCK_ATTENDANCE.findIndex(l => l.id === logId);
        if (logIndex > -1) {
            MOCK_ATTENDANCE[logIndex].checkOutTime = new Date().toISOString();
            return createSuccessResponse(MOCK_ATTENDANCE[logIndex], "Check-out berhasil!");
        }
        return createErrorResponse("Log tidak ditemukan");
    },
    getHistory: async (employeeId: string): Promise<ApiResponse<AttendanceLog[]>> => {
        await delay(700);
        const userHistory = MOCK_ATTENDANCE.filter(l => l.employeeId === employeeId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return createSuccessResponse(userHistory);
    },
    getAllToday: async (): Promise<ApiResponse<AttendanceLog[]>> => {
        await delay(500);
        const todayStr = new Date().toISOString().split('T')[0];
        const todayLogs = MOCK_ATTENDANCE.filter(l => l.date === todayStr);
        return createSuccessResponse(todayLogs);
    },
    getTodaySchedule: async (employeeId: string) => {
        await delay(100);
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const shift = MOCK_SHIFTS.find(s => s.employeeId === employeeId && s.date === dateStr);
        if (shift) {
            return createSuccessResponse({
                shiftName: `${shift.type.charAt(0).toUpperCase() + shift.type.slice(1).toLowerCase()} Shift`,
                startTime: shift.startTime,
                endTime: shift.endTime
            });
        }
        return createSuccessResponse({ shiftName: 'Jadwal Reguler', startTime: '10:00', endTime: '21:00' });
    },
    updateLog: async (logId: string, updates: any) => {
        await delay(300);
        const index = MOCK_ATTENDANCE.findIndex(l => l.id === logId);
        if (index > -1) {
            MOCK_ATTENDANCE[index] = { ...MOCK_ATTENDANCE[index], ...updates };
            return createSuccessResponse(MOCK_ATTENDANCE[index], "Updated");
        }
        return createErrorResponse("Not found");
    },
    getTopAttendance: async (): Promise<ApiResponse<any[]>> => {
        await delay(600);
        // Filter only Staff (FOH/BOH), exclude Managers/Owners
        const staff = MOCK_EMPLOYEES.filter(e => e.role === UserRole.EMPLOYEE);

        // In a real app, we would calculate this from MOCK_ATTENDANCE and MOCK_SHIFTS.
        // For this demo, we will simulate that some staff have perfect attendance.
        const topStaff = staff.slice(0, 3).map(e => ({
            id: e.id,
            name: e.name,
            avatarUrl: e.avatarUrl,
            department: e.department,
            attendanceRate: 100, // Perfect attendance
            totalPresent: 22, // Mock days
            totalScheduled: 22
        }));

        return createSuccessResponse(topStaff);
    }
};

export const jobdeskApi = {
    getSubmission: async (employeeId: string, date: string): Promise<ApiResponse<JobdeskSubmission>> => {
        await delay(200);
        // This is a mock; in a real app, you'd fetch from a DB
        // For now, let's check if there's feedback for Ardian (BOH) for demo
        if (employeeId === 'emp-006' && !localStorage.getItem('feedback_dismissed')) {
            return createSuccessResponse({
                id: 'jd-mock-1', employeeId, date, area: EmployeeArea.BOH,
                completedTaskIds: ['Memasak nasi sesuai kebutuhan operasional.'],
                lastUpdated: new Date().toISOString(),
                managerNote: "Kerja bagus hari ini, Ardian! Terus pertahankan kebersihan area kitchen."
            });
        }
        return createSuccessResponse(null as any);
    },
    saveSubmission: async (data: JobdeskSubmission): Promise<ApiResponse<JobdeskSubmission>> => {
        await delay(500);
        console.log("[Mock Save Jobdesk]", data);
        return createSuccessResponse(data, "Jobdesk berhasil disimpan");
    },
    getAllSubmissionsByDate: async (date: string): Promise<ApiResponse<JobdeskSubmission[]>> => {
        await delay(400);
        const fohSub: JobdeskSubmission = { id: 'sub1', employeeId: 'emp-007', date, area: EmployeeArea.FOH, completedTaskIds: Array(5).fill('task'), lastUpdated: new Date().toISOString() };
        const bohSub: JobdeskSubmission = { id: 'sub2', employeeId: 'emp-006', date, area: EmployeeArea.BOH, completedTaskIds: Array(10).fill('task'), lastUpdated: new Date().toISOString(), managerNote: 'Good job!' };
        return createSuccessResponse([fohSub, bohSub]);
    },
    giveFeedback: async (id: string, note: string): Promise<ApiResponse<JobdeskSubmission>> => {
        await delay(400);
        console.log(`[Mock Feedback] for ${id}: ${note}`);
        return createSuccessResponse({ id } as JobdeskSubmission, "Feedback sent");
    }
};

export const performanceApi = {
    getDailySnapshot: async (employeeId: string, date: string): Promise<ApiResponse<DailyPerformanceSnapshot>> => {
        await delay(300);
        const snapshot = MOCK_DAILY_SNAPSHOTS.find(s => s.employeeId === employeeId && s.date === new Date().toISOString().split('T')[0]);
        return createSuccessResponse(snapshot as DailyPerformanceSnapshot);
    },
    getAllSnapshotsByDate: async (date: string): Promise<ApiResponse<DailyPerformanceSnapshot[]>> => {
        await delay(500);
        // In a real app, this would query by date. Mock just returns all.
        return createSuccessResponse(MOCK_DAILY_SNAPSHOTS);
    },
    getSnapshotHistory: async (employeeId: string): Promise<ApiResponse<DailyPerformanceSnapshot[]>> => {
        await delay(400);
        return createSuccessResponse(MOCK_DAILY_SNAPSHOTS.filter(s => s.employeeId === employeeId));
    },
    updateDailySnapshot: async (employeeId: string, date: string, updates: any): Promise<ApiResponse<DailyPerformanceSnapshot>> => {
        await delay(500);
        console.log("[Mock Update Snapshot]", { employeeId, date, updates });
        return createSuccessResponse({ employeeId, date, ...updates } as DailyPerformanceSnapshot);
    },
    getReviews: async (employeeId: string): Promise<ApiResponse<PerformanceReview[]>> => {
        await delay(400);
        return createSuccessResponse(MOCK_PERFORMANCE_REVIEWS.filter(r => r.employeeId === employeeId));
    },
    saveReview: async (review: any): Promise<ApiResponse<PerformanceReview>> => {
        await delay(600);
        console.log("[Mock Save Review]", review);
        return createSuccessResponse(review);
    },
    // Other manager functions can be simple success messages for now
    saveHRRecord: async (data: { type: string, desc: string, empId: string }) => {
        await delay(500);
        const emp = MOCK_EMPLOYEES.find(e => e.id === data.empId);
        if (!emp) return createErrorResponse("Karyawan tidak ditemukan");

        // Logic: Deduct Score based on SP type
        let deduction = 0;
        if (data.type === 'SP1') deduction = 10;
        if (data.type === 'SP2') deduction = 20;

        // Create Performance Review Record
        const newReview: PerformanceReview = {
            id: `pr-${Date.now()}`,
            employeeId: data.empId,
            reviewerId: "hr-manager",
            periodMonth: new Date().getMonth() + 1,
            periodYear: new Date().getFullYear(),
            area: EmployeeArea.MANAGEMENT, // Default for now
            scores: { "Discipline": 1 },
            notes: { hr_note: `[${data.type}] ${data.desc}` },
            overallScore: 1,
            overallComment: "Disciplinary Action",
            isFinalized: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        MOCK_PERFORMANCE_REVIEWS.unshift(newReview);

        return createSuccessResponse(newReview, `HR Record disimpan. Score dikurangi ${deduction} poin.`);
    },
    saveSalarySlip: async (data: Partial<Payslip>) => {
        await delay(500);
        const newSlip: Payslip = {
            id: `slip-${Date.now()}`,
            employeeId: data.employeeId || '',
            periodMonth: data.periodMonth || new Date().getMonth() + 1,
            periodYear: data.periodYear || new Date().getFullYear(),
            payDate: new Date().toISOString(),
            basicSalary: data.basicSalary || 0,
            allowanceMeal: 0,
            allowanceTransport: 0,
            allowanceOther: data.allowanceOther || 0,
            overtimeHours: 0,
            overtimeAmount: 0,
            bonus: 0,
            commission: 0,
            bpjsKesehatan: 0,
            bpjsKetenagakerjaan: 0,
            taxPPh21: 0,
            otherDeductions: data.otherDeductions || 0,
            totalEarnings: (data.basicSalary || 0) + (data.allowanceOther || 0),
            totalDeductions: data.otherDeductions || 0,
            netSalary: (data.basicSalary || 0) + (data.allowanceOther || 0) - (data.otherDeductions || 0),
            status: 'SENT',
            isVisibleToEmployee: true,
            createdByHrId: 'hr-admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        MOCK_PAYSLIPS.unshift(newSlip);
        return createSuccessResponse(newSlip, "Slip Gaji berhasil dibuat & dikirim.");
    },
    saveOperationalReport: async (data: { sales: number, notes: string }) => {
        await delay(500);
        // Auto-Journal Revenue
        const newTrx: Transaction = {
            id: `trx-sales-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            desc: `Omzet Harian: ${data.notes}`,
            amount: data.sales,
            type: 'IN',
            outlet: 'Jakarta'
        };
        MOCK_TRANSACTIONS.unshift(newTrx);
        return createSuccessResponse(newTrx, "Laporan Omzet Tersimpan & Jurnal Masuk.");
    },
    saveIncentive: async (data: { empName: string, amount: number }) => {
        await delay(500);
        // Auto-Journal Expense
        const newTrx: Transaction = {
            id: `trx-inc-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            desc: `Insentif/Lembur: ${data.empName}`,
            amount: data.amount,
            type: 'OUT',
            outlet: 'Jakarta'
        };
        MOCK_TRANSACTIONS.unshift(newTrx);
        return createSuccessResponse(newTrx, "Insentif Tersimpan & Jurnal Keluar.");
    },
    saveCampaign: async (data: { name: string }) => {
        await delay(500);
        // Mock Campaign Logic
        return createSuccessResponse({ id: `cmp-${Date.now()}`, name: data.name, status: 'Active' }, "Campaign Baru Diluncurkan!");
    },
    savePayroll: async (data: any) => { await delay(500); return { success: true, message: "Saved" }; },

    getDashboardStats: async (month: number, year: number): Promise<ApiResponse<any>> => {
        await delay(800);
        return createSuccessResponse({
            topPerformers: MOCK_EMPLOYEES.slice(3, 6).map(e => ({ employeeId: e.id, name: e.name, avatarUrl: e.avatarUrl, avgScore: 4.5 - Math.random() })),
            fohAverage: 4.2,
            bohAverage: 4.5,
            itemTrends: [{ label: 'Kehadiran', value: 95, trend: 'STABLE' }, { label: 'Kebersihan', value: 4.2, trend: 'UP' }]
        });
    },
    getEmployeeOfTheMonth: async (month: number, year: number): Promise<ApiResponse<any>> => {
        await delay(600);
        const topEmployee = MOCK_EMPLOYEES[6];
        return createSuccessResponse({
            employeeId: topEmployee.id,
            name: topEmployee.name,
            department: topEmployee.department,
            avatarUrl: topEmployee.avatarUrl,
            periodMonth: month,
            periodYear: year,
            avgScore: 4.9,
            achievementBadge: "Star Employee",
            description: "Menunjukkan kinerja luar biasa dan dedikasi tinggi sepanjang bulan."
        });
    }
};

export const shiftApi = {
    getMonthlyShifts: async (month: number, year: number): Promise<ApiResponse<ShiftAssignment[]>> => {
        await delay(800);
        return createSuccessResponse(MOCK_SHIFTS);
    },
    generateDefaults: async (month: number, year: number): Promise<ApiResponse<ShiftAssignment[]>> => {
        await delay(1000);
        // In a real app, this would generate and save to DB. Here, we just return the mock.
        return createSuccessResponse(MOCK_SHIFTS, "Draft jadwal berhasil dibuat");
    },
    updateAssignment: async (id: string, type: ShiftType): Promise<ApiResponse<ShiftAssignment>> => {
        await delay(200);
        const index = MOCK_SHIFTS.findIndex(s => s.id === id);
        if (index > -1) {
            const shift = MOCK_SHIFTS[index];
            shift.type = type;
            shift.color = SHIFT_COLORS[type];
            // Update times accordingly
            const times = getShiftTimes(type, shift.date);
            shift.startTime = times.start;
            shift.endTime = times.end;
            return createSuccessResponse(shift, "Shift diupdate");
        }
        return createErrorResponse("Shift tidak ditemukan");
    },
    publishShifts: async (month: number, year: number): Promise<ApiResponse<boolean>> => {
        await delay(500);
        MOCK_SHIFTS.forEach(s => s.isPublished = true);
        return createSuccessResponse(true, "Jadwal berhasil dipublikasikan");
    }
};

export const payrollApi = {
    getPayslips: async (role: any, userId: any): Promise<ApiResponse<Payslip[]>> => {
        await delay(700);
        if (role === UserRole.EMPLOYEE) {
            return createSuccessResponse(MOCK_PAYSLIPS.filter(p => p.employeeId === userId && p.isVisibleToEmployee));
        }
        return createSuccessResponse(MOCK_PAYSLIPS);
    },
    getPayslipDetail: async (id: string): Promise<ApiResponse<Payslip>> => {
        await delay(400);
        const slip = MOCK_PAYSLIPS.find(p => p.id === id);
        return slip ? createSuccessResponse(slip) : createErrorResponse("Not found");
    },
    savePayslip: async (payslip: Payslip): Promise<ApiResponse<Payslip>> => {
        await delay(600);
        const index = MOCK_PAYSLIPS.findIndex(p => p.id === payslip.id);
        if (index > -1) MOCK_PAYSLIPS[index] = payslip;
        else MOCK_PAYSLIPS.unshift(payslip);
        return createSuccessResponse(payslip, "Slip gaji disimpan");
    },
    sendPayslip: async (id: string): Promise<ApiResponse<Payslip>> => {
        await delay(500);
        const index = MOCK_PAYSLIPS.findIndex(p => p.id === id);
        if (index > -1) {
            MOCK_PAYSLIPS[index].status = 'SENT';
            MOCK_PAYSLIPS[index].isVisibleToEmployee = true;
            return createSuccessResponse(MOCK_PAYSLIPS[index], "Slip gaji terkirim");
        }
        return createErrorResponse("Not found");
    }
};

export const leaveApi = {
    getHistory: async (id: string) => {
        await delay(500);
        return createSuccessResponse(MOCK_LEAVE_REQUESTS.filter(r => r.employeeId === id));
    },
    submitRequest: async (data: any) => {
        await delay(500);
        const newRequest: LeaveRequest = { ...data, id: `lr-${Date.now()}`, status: 'PENDING' };
        MOCK_LEAVE_REQUESTS.unshift(newRequest);
        return createSuccessResponse(newRequest, "Submitted");
    }
};

export const messageApi = {
    getMessages: async (userId: string, userRole: UserRole): Promise<ApiResponse<Message[]>> => {
        await delay(400);

        // Find user to get area (Mock only)
        const user = MOCK_EMPLOYEES.find(e => e.id === userId);
        const userArea = user?.area;

        // Filter messages based on user's role and audience
        const relevantMessages = MOCK_MESSAGES.filter(msg => {
            if (userRole === UserRole.BUSINESS_OWNER || userRole === UserRole.SUPER_ADMIN) return true; // Owner/Admin sees all
            if (msg.senderId === userId) return true; // Sender always sees their own message

            if (msg.audience === MessageAudience.ALL_STAFF) return true; // All staff see this

            if (msg.audience === MessageAudience.FOH_ONLY) {
                return userArea === EmployeeArea.FOH || [UserRole.RESTAURANT_MANAGER, UserRole.HR_MANAGER].includes(userRole);
            }

            if (msg.audience === MessageAudience.BOH_ONLY) {
                return userArea === EmployeeArea.BOH || [UserRole.RESTAURANT_MANAGER, UserRole.HR_MANAGER].includes(userRole);
            }

            if (msg.audience === MessageAudience.ALL_MANAGERS) {
                return [
                    UserRole.RESTAURANT_MANAGER,
                    UserRole.HR_MANAGER,
                    UserRole.FINANCE_MANAGER,
                    UserRole.MARKETING_MANAGER,
                ].includes(userRole);
            }

            if (msg.audience === MessageAudience.BUSINESS_OWNER) {
                // Owner/Admin already handled at top, so only sender can see if not them
                return msg.senderId === userId;
            }
            return false;
        }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return createSuccessResponse(relevantMessages);
    },

    sendMessage: async (sender: Employee, content: string, audience: MessageAudience): Promise<ApiResponse<Message>> => {
        await delay(500);
        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            senderId: sender.id,
            senderName: sender.name,
            senderAvatarUrl: sender.avatarUrl,
            senderRole: sender.role,
            content,
            timestamp: new Date().toISOString(),
            audience,
            readBy: [sender.id], // Sender automatically reads it
            senderArea: sender.area
        };
        MOCK_MESSAGES.unshift(newMessage); // Add to the top of the list
        return createSuccessResponse(newMessage, "Pesan terkirim!");
    },

    markAsRead: async (messageId: string, userId: string): Promise<ApiResponse<boolean>> => {
        await delay(100);
        const msgIndex = MOCK_MESSAGES.findIndex(m => m.id === messageId);
        if (msgIndex > -1) {
            const msg = MOCK_MESSAGES[msgIndex];
            if (!msg.readBy.includes(userId)) {
                msg.readBy.push(userId);
            }
        }
        return createSuccessResponse(true);
    },
};


// These are not fully implemented in mock but exist for type-safety
// Global Mutable Mock Data for Financial Transactions
let MOCK_TRANSACTIONS = [
    { id: 'trx-1', date: `2025-12-01`, desc: 'Penjualan Harian', amount: 5000000, type: 'IN', outlet: 'Jakarta' },
    { id: 'trx-2', date: `2025-12-02`, desc: 'Belanja Bahan Baku', amount: 2000000, type: 'OUT', outlet: 'Jakarta' },
    { id: 'trx-3', date: `2025-12-03`, desc: 'Penjualan Harian', amount: 4500000, type: 'IN', outlet: 'Bandung' },
    { id: 'trx-4', date: `2025-12-04`, desc: 'Biaya Operasional', amount: 1000000, type: 'OUT', outlet: 'Semarang' },
    { id: 'trx-5', date: `2025-12-05`, desc: 'Penjualan Harian', amount: 6000000, type: 'IN', outlet: 'Jakarta' },
];

export const financeApi = {
    addTransaction: async (transaction: any): Promise<ApiResponse<any>> => {
        await delay(500);
        const newTrx = { ...transaction, id: `trx-${Date.now()}` };
        MOCK_TRANSACTIONS.unshift(newTrx); // Add to top
        return createSuccessResponse(newTrx);
    },
    getTransactions: async (): Promise<ApiResponse<any[]>> => {
        await delay(500);
        return createSuccessResponse(MOCK_TRANSACTIONS);
    }
};

export const ownerApi = {
    getDashboardKPIs: async (month: number, year: number, location?: string): Promise<ApiResponse<any>> => {
        await delay(800);

        // Calculate Dynamic Revenue & Profit from MOCK_TRANSACTIONS
        let filteredTrx = MOCK_TRANSACTIONS;

        // Filter by Location
        if (location && location !== 'ALL') {
            filteredTrx = filteredTrx.filter(t => t.outlet === location);
        }

        // Filter by Month/Year (Simple string match for YYYY-MM)
        const targetPrefix = `${year}-${String(month).padStart(2, '0')}`;

        // Calculate Totals
        const totalRevenue = filteredTrx
            .filter(t => t.type === 'IN')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = filteredTrx
            .filter(t => t.type === 'OUT')
            .reduce((sum, t) => sum + t.amount, 0);

        const netProfit = totalRevenue - totalExpense;

        // Fallback if no data (to avoid showing 0 in demo if user selects wrong date)
        const displayRevenue = totalRevenue > 0 ? totalRevenue : 150000000;
        const displayProfit = totalRevenue > 0 ? netProfit : 37500000;

        return {
            success: true,
            message: "KPIs",
            data: {
                financial: {
                    totalRevenue: { value: displayRevenue, percentageChange: 5.4, trend: 'UP' },
                    netProfit: { value: displayProfit, percentageChange: 2.1, trend: 'UP' },
                    foodCostPercentage: { value: 32.5, percentageChange: -1.2, trend: 'DOWN' },
                    laborCostPercentage: { value: 22.0, percentageChange: 0.5, trend: 'UP' },
                    chartData: [{ label: 'W1', revenue: displayRevenue * 0.22, cost: displayRevenue * 0.18 }, { label: 'W2', revenue: displayRevenue * 0.26, cost: displayRevenue * 0.20 }, { label: 'W3', revenue: displayRevenue * 0.24, cost: displayRevenue * 0.19 }, { label: 'W4', revenue: displayRevenue * 0.28, cost: displayRevenue * 0.21 }]
                },
                operational: { tableTurnoverRate: { value: 3.5, percentageChange: 0.2, trend: 'UP' }, avgOrderValue: { value: 125000, percentageChange: 3.5, trend: 'UP' }, alerts: [] },
                hr: {
                    employeeTurnoverRate: { value: 2.5, percentageChange: 0, trend: 'STABLE' },
                    attendanceCompliance: 96.5,
                    topEmployees: MOCK_EMPLOYEES
                        .filter(e => e.role === UserRole.EMPLOYEE && (e.area === EmployeeArea.FOH || e.area === EmployeeArea.BOH))
                        .slice(0, 3)
                        .map(e => ({ employeeId: e.id, name: e.name, avatarUrl: e.avatarUrl, avgScore: 4.9 - Math.random() }))
                },
                customer: { csatScore: { value: 4.7, percentageChange: 0.1, trend: 'UP' }, reviewCount: 45 },
                marketing: { marketingRoi: { value: 450, percentageChange: 12.5, trend: 'UP' }, socialEngagement: { value: 2400, percentageChange: -5.0, trend: 'DOWN' } }
            }
        };
    },
    getFinancialTransactions: async (month: number, year: number, location?: string): Promise<ApiResponse<any[]>> => {
        await delay(800);
        let filtered = MOCK_TRANSACTIONS;

        if (location && location !== 'ALL') {
            filtered = filtered.filter(t => t.outlet === location);
        }

        // Filter by Month/Year if needed, or return all for demo
        return createSuccessResponse(filtered);
    }
};

export const adminApi = {
    getAuditLogs: async () => { await delay(500); return createSuccessResponse([]); },
    getSystemSettings: async () => { await delay(500); return createSuccessResponse([]); },
    updateSystemSetting: async (key: string, value: any) => { await delay(500); return createSuccessResponse({ key, value }); },
    impersonateByPhone: async (phone: string, reqId: string) => {
        await delay(400);
        const target = MOCK_EMPLOYEES.find(e => e.phone === phone);
        return target ? createSuccessResponse(target) : createErrorResponse("User not found");
    },
    logImpersonationStart: async (adminId?: string, targetId?: string) => { await delay(100); return createSuccessResponse(true); }
};

export const mockExportApi = {
    exportPDF: async (reportTitle: string): Promise<ApiResponse<boolean>> => {
        await delay(1500); // Simulate generation time
        console.log(`[Mock Export] Generating PDF for: ${reportTitle}`);
        return createSuccessResponse(true, `Laporan "${reportTitle}" berhasil diexport ke PDF!`);
    },
    exportExcel: async (reportTitle: string): Promise<ApiResponse<boolean>> => {
        await delay(1000);
        console.log(`[Mock Export] Generating Excel for: ${reportTitle}`);
        return createSuccessResponse(true, `Data "${reportTitle}" berhasil diexport ke Excel!`);
    }
};

// --- LEGACY MOCK FUNCTIONS ---
// These are kept to avoid breaking changes but should be phased out.

// This is no longer needed as the logic is inside api objects.
// Kept for any old imports that might exist.
export const getShiftTimes = (type: ShiftType, date: string) => {
    if (type === ShiftType.OFF) return { start: '', end: '' };
    if (type === ShiftType.MORNING) return { start: '10:00', end: '20:00' };
    if (type === ShiftType.MIDDLE) return { start: '11:00', end: '21:00' };
    return { start: '09:00', end: '18:00' };
};

// These are no longer needed as they are replaced by the mock api service
export const checkConnection = async (): Promise<boolean> => {
    await delay(100);
    return true; // Always connected in mock mode
};

export const getStoredBaseUrl = () => "mock_mode";
export const saveBaseUrl = (url: string) => { /* Does nothing in mock mode */ };

// --- INVENTORY & STOCK OPNAME LOGIC ---

export interface StockItem {
    id: string;
    name: string;
    unit: string;
    category: 'FOH' | 'BOH'; // Added category
    systemStock: number;
    physicalStock: number | '';
    lastOpname: string;
    pricePerUnit: number;
}

let MOCK_INVENTORY: StockItem[] = [
    // BOH Items (Kitchen Ingredients)
    { id: 'inv-1', name: 'Beras Premium', unit: 'kg', category: 'BOH', systemStock: 50, physicalStock: '', lastOpname: '2025-11-25', pricePerUnit: 15000 },
    { id: 'inv-2', name: 'Minyak Goreng', unit: 'liter', category: 'BOH', systemStock: 25, physicalStock: '', lastOpname: '2025-11-25', pricePerUnit: 14000 },
    { id: 'inv-3', name: 'Ayam Potong', unit: 'ekor', category: 'BOH', systemStock: 120, physicalStock: '', lastOpname: '2025-11-30', pricePerUnit: 35000 },
    { id: 'inv-4', name: 'Telur Ayam', unit: 'kg', category: 'BOH', systemStock: 15.5, physicalStock: '', lastOpname: '2025-11-28', pricePerUnit: 28000 },
    { id: 'inv-5', name: 'Tepung Terigu', unit: 'kg', category: 'BOH', systemStock: 30, physicalStock: '', lastOpname: '2025-11-20', pricePerUnit: 12000 },
    { id: 'inv-6', name: 'Bawang Merah', unit: 'kg', category: 'BOH', systemStock: 8, physicalStock: '', lastOpname: '2025-11-29', pricePerUnit: 45000 },
    { id: 'inv-7', name: 'Bawang Putih', unit: 'kg', category: 'BOH', systemStock: 5, physicalStock: '', lastOpname: '2025-11-29', pricePerUnit: 40000 },
    { id: 'inv-8', name: 'Cabai Rawit', unit: 'kg', category: 'BOH', systemStock: 3.5, physicalStock: '', lastOpname: '2025-11-30', pricePerUnit: 80000 },

    // FOH Items (Service Supplies)
    { id: 'inv-foh-1', name: 'Cup 16oz (Es)', unit: 'pcs', category: 'FOH', systemStock: 500, physicalStock: '', lastOpname: '2025-11-30', pricePerUnit: 800 },
    { id: 'inv-foh-2', name: 'Cup 12oz (Panas)', unit: 'pcs', category: 'FOH', systemStock: 300, physicalStock: '', lastOpname: '2025-11-30', pricePerUnit: 600 },
    { id: 'inv-foh-3', name: 'Sedotan Steril', unit: 'pack', category: 'FOH', systemStock: 20, physicalStock: '', lastOpname: '2025-11-28', pricePerUnit: 5000 },
    { id: 'inv-foh-4', name: 'Tisu Makan', unit: 'pack', category: 'FOH', systemStock: 45, physicalStock: '', lastOpname: '2025-11-29', pricePerUnit: 3500 },
    { id: 'inv-foh-5', name: 'Kantong Plastik Takeaway', unit: 'pack', category: 'FOH', systemStock: 15, physicalStock: '', lastOpname: '2025-11-25', pricePerUnit: 8000 },
    { id: 'inv-foh-6', name: 'Kertas Nasi', unit: 'pack', category: 'FOH', systemStock: 25, physicalStock: '', lastOpname: '2025-11-25', pricePerUnit: 12000 },
];

export const inventoryApi = {
    getStock: async (): Promise<ApiResponse<StockItem[]>> => {
        await delay(500);
        return createSuccessResponse(MOCK_INVENTORY);
    },
    submitOpname: async (items: StockItem[]): Promise<ApiResponse<any>> => {
        await delay(1500); // Simulate processing

        let totalVarianceValue = 0;
        const todayStr = new Date().toISOString().split('T')[0];
        let generatedTransaction = null;

        // 1. Update Inventory & Calculate Variance Value
        items.forEach(submittedItem => {
            const idx = MOCK_INVENTORY.findIndex(i => i.id === submittedItem.id);
            if (idx > -1) {
                const currentSystem = MOCK_INVENTORY[idx].systemStock;
                // If physical is empty, assume it matches system (no variance) OR skip? 
                // Let's assume if empty, we ignore it for variance but don't update system stock?
                // Or better: treat empty as "not counted" -> ignore.
                if (submittedItem.physicalStock !== '') {
                    const physical = submittedItem.physicalStock as number;
                    const varianceQty = physical - currentSystem;
                    const varianceRupiah = varianceQty * MOCK_INVENTORY[idx].pricePerUnit;

                    totalVarianceValue += varianceRupiah;

                    // Update Mock DB
                    MOCK_INVENTORY[idx].physicalStock = physical;
                    MOCK_INVENTORY[idx].lastOpname = todayStr;
                    MOCK_INVENTORY[idx].systemStock = physical; // Sync system to physical
                }
            }
        });

        // 2. Auto-Generate Financial Transaction
        if (totalVarianceValue !== 0) {
            const isLoss = totalVarianceValue < 0;
            const absValue = Math.abs(totalVarianceValue);

            generatedTransaction = {
                id: `trx-auto-${Date.now()}`,
                date: todayStr,
                desc: isLoss ? 'Biaya Selisih Stok (Shrinkage)' : 'Penyesuaian Stok (Surplus)',
                amount: absValue,
                type: isLoss ? 'OUT' : 'IN', // Loss = Expense (OUT), Surplus = Income (IN)
                outlet: 'Jakarta' // Default for demo
            };

            MOCK_TRANSACTIONS.unshift(generatedTransaction);
            console.log("[AUTO-FINANCE] Generated Transaction:", generatedTransaction);
        }

        return createSuccessResponse({
            totalVariance: totalVarianceValue,
            transaction: generatedTransaction
        }, "Laporan Stok Opname Berhasil & Jurnal Keuangan Diupdate");
    }
};
