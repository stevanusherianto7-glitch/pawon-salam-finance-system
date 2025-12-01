
// FIX: Added EmployeeArea and SHIFT_COLORS to the import from ../types to resolve reference errors.
import { ApiResponse, AttendanceLog, Employee, UserRole, ShiftAssignment, ShiftType, JobdeskSubmission, DailyPerformanceSnapshot, PerformanceReview, Payslip, LeaveRequest, EmployeeArea, SHIFT_COLORS, Message, MessageAudience } from "../types";
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
                                      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
    saveHRRecord: async (data: any) => { await delay(500); return { success: true, message: "Saved" }; },
    saveSalarySlip: async (data: any) => { await delay(500); return { success: true, message: "Saved" }; },
    saveOperationalReport: async (data: any) => { await delay(500); return { success: true, message: "Saved" }; },
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
    // Filter messages based on user's role and audience
    const relevantMessages = MOCK_MESSAGES.filter(msg => {
      if (userRole === UserRole.BUSINESS_OWNER || userRole === UserRole.SUPER_ADMIN) return true; // Owner/Admin sees all
      if (msg.audience === MessageAudience.ALL_STAFF) return true; // All staff see this
      if (msg.audience === MessageAudience.ALL_MANAGERS) {
        return [
          UserRole.RESTAURANT_MANAGER,
          UserRole.HR_MANAGER,
          UserRole.FINANCE_MANAGER,
          UserRole.MARKETING_MANAGER,
        ].includes(userRole);
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
export const ownerApi = {
    getDashboardKPIs: async (month: number, year: number, location?: string): Promise<ApiResponse<any>> => {
        await delay(1200);
        const revenue = 150000000;
        return { 
            success: true, 
            message: "KPIs", 
            data: { 
                financial: { 
                    totalRevenue: { value: revenue, percentageChange: 5.4, trend: 'UP' }, 
                    netProfit: { value: revenue * 0.25, percentageChange: 2.1, trend: 'UP' }, 
                    foodCostPercentage: { value: 32.5, percentageChange: -1.2, trend: 'DOWN' }, 
                    laborCostPercentage: { value: 22.0, percentageChange: 0.5, trend: 'UP' }, 
                    chartData: [{ label: 'W1', revenue: revenue*0.22, cost: revenue*0.18 }, { label: 'W2', revenue: revenue*0.26, cost: revenue*0.20 }, { label: 'W3', revenue: revenue*0.24, cost: revenue*0.19 }, { label: 'W4', revenue: revenue*0.28, cost: revenue*0.21 }] 
                }, 
                operational: { tableTurnoverRate: { value: 3.5, percentageChange: 0.2, trend: 'UP' }, avgOrderValue: { value: 125000, percentageChange: 3.5, trend: 'UP' }, alerts: [] }, 
                hr: { employeeTurnoverRate: { value: 2.5, percentageChange: 0, trend: 'STABLE' }, attendanceCompliance: 96.5, topEmployees: MOCK_EMPLOYEES.slice(2,5).map(e=>({employeeId: e.id, name: e.name, avatarUrl: e.avatarUrl, avgScore: 4.9 - Math.random()}))}, 
                customer: { csatScore: { value: 4.7, percentageChange: 0.1, trend: 'UP' }, reviewCount: 45 }, 
                marketing: { marketingRoi: { value: 450, percentageChange: 12.5, trend: 'UP' }, socialEngagement: { value: 2400, percentageChange: -5.0, trend: 'DOWN' } } 
            }
        };
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
