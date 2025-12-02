
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import type {
    LoginRequest,
    AdminLoginRequest,
    CreateEmployeeRequest,
    UpdateEmployeeRequest,
    CheckInRequest,
    CheckOutRequest
} from './types/apiTypes';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Local Enum Definition for ShiftType to avoid import issues
enum ShiftType {
    OFF = 'OFF',
    MORNING = 'MORNING',
    MIDDLE = 'MIDDLE'
}

// --- MIDDLEWARE ---

// 1. Logging Middleware (CCTV)
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// 2. CORS (Gerbang Bebas & Aman)
// Updated for Production Hardening
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:5173', // Vite Dev
            'http://localhost:4173', // Vite Preview
            'https://pawonsalam.my.id', // Production Domain
            'https://www.pawonsalam.my.id'
        ];

        // Allow requests with no origin (like mobile apps or curl requests) or if origin is in allowed list
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.pages.dev')) {
            return callback(null, true);
        }

        console.warn(`Blocked CORS request from: ${origin}`);
        return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Bypass-Tunnel-Reminder'],
    credentials: true
}));

// 3. JSON Parser
app.use(express.json());

// --- HELPERS ---
const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const SHIFT_COLORS: Record<string, string> = {
    'OFF': '#EF4444',
    'MORNING': '#3B82F6',
    'MIDDLE': '#22C55E'
};

const getShiftTimes = (type: string) => {
    if (type === 'OFF') return { start: '', end: '' };
    if (type === 'MORNING') return { start: '10:00', end: '20:00' };
    if (type === 'MIDDLE') return { start: '11:00', end: '21:00' };
    return { start: '09:00', end: '18:00' };
};

// Helper for Decimal conversion
const parsePayslip = (p: any) => ({
    ...p,
    basicSalary: Number(p.basicSalary),
    allowanceMeal: Number(p.allowanceMeal),
    allowanceTransport: Number(p.allowanceTransport),
    allowanceOther: Number(p.allowanceOther),
    overtimeAmount: Number(p.overtimeAmount),
    bonus: Number(p.bonus),
    commission: Number(p.commission),
    bpjsKesehatan: Number(p.bpjsKesehatan),
    bpjsKetenagakerjaan: Number(p.bpjsKetenagakerjaan),
    taxPPh21: Number(p.taxPPh21),
    otherDeductions: Number(p.otherDeductions),
    totalEarnings: Number(p.totalEarnings),
    totalDeductions: Number(p.totalDeductions),
    netSalary: Number(p.netSalary)
});

// --- ROUTES ---

// Endpoint Pintu Depan & Health Check
app.get('/', async (req: Request, res: Response) => {
    try {
        // await prisma.$connect(); // Optional check
        res.status(200).json({ status: 'OK', message: '✅ PAWON SALAM BACKEND IS ONLINE & SECURE' });
    } catch (error) {
        console.error("Connection error:", error);
        res.status(500).json({ status: 'ERROR', message: '❌ Database Error' });
    }
});

// --- AUTHENTICATION ROUTES ---

app.post('/api/auth/login', async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    const { phone } = req.body; // Removed PIN from request

    if (!phone) {
        res.status(400).json({ success: false, message: "Nomor HP wajib diisi." });
        return;
    }

    try {
        console.log(`Login attempt for phone: ${phone}`);
        const employee = await prisma.employee.findFirst({
            where: { phone: phone },
        });

        if (!employee) {
            console.log("User not found");
            res.status(404).json({ success: false, message: "Nomor HP tidak terdaftar." });
            return;
        }

        // --- PIN SECURITY COMPLETELY REMOVED ---
        console.log(`[AUTH] Login success for ${employee.name} (Phone Only)`);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { pin: _, ...employeeData } = employee;

        res.status(200).json({
            success: true,
            message: "Login Berhasil!",
            data: employeeData,
        });

    } catch (error) {
        console.error("Login endpoint error:", error);
        res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
    }
});

app.post('/api/auth/admin-login', async (req: Request<{}, {}, AdminLoginRequest>, res: Response) => {
    const { email, password } = req.body;

    try {
        const admin = await prisma.employee.findFirst({
            where: {
                email: email,
                role: 'SUPER_ADMIN',
            },
        });

        if (!admin) {
            res.status(404).json({ success: false, message: "Akun Super Admin tidak ditemukan." });
            return;
        }

        if (password !== 'admin123') {
            res.status(401).json({ success: false, message: "Password salah." });
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { pin: _, ...adminData } = admin;

        res.status(200).json({
            success: true,
            message: "Welcome, Super Admin!",
            data: adminData,
        });

    } catch (error) {
        console.error("Admin login endpoint error:", error);
        res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
    }
});

// --- EMPLOYEE MANAGEMENT ROUTES ---

app.get('/api/employees', async (req: Request, res: Response) => {
    try {
        const employees = await prisma.employee.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const safeEmployees = employees.map((emp: any) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { pin, ...rest } = emp;
            return rest;
        });

        res.json({ success: true, message: "Data karyawan berhasil diambil", data: safeEmployees });
    } catch (error) {
        console.error("Get employees error:", error);
        res.status(500).json({ success: false, message: "Gagal mengambil data karyawan" });
    }
});

app.post('/api/employees', async (req: Request<{}, {}, CreateEmployeeRequest>, res: Response) => {
    try {
        const { name, email, phone, pin, role, department, area, address, avatarUrl } = req.body;

        const newEmployee = await prisma.employee.create({
            data: {
                name,
                email,
                phone: phone || null,
                pin: pin || '123456',
                role,
                department,
                area,
                address: address || null,
                avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            }
        });

        res.status(201).json({ success: true, message: "Karyawan berhasil ditambahkan", data: newEmployee });
    } catch (error: any) {
        console.error("Create employee error:", error);
        if (error.code === 'P2002') {
            res.status(400).json({ success: false, message: "Email atau Nomor HP sudah terdaftar" });
            return;
        }
        res.status(500).json({ success: false, message: "Gagal menambahkan karyawan" });
    }
});

app.put('/api/employees/:id', async (req: Request<{ id: string }, {}, UpdateEmployeeRequest>, res: Response) => {
    const { id } = req.params;
    const { name, email, phone, pin, role, department, area, address, avatarUrl } = req.body;

    try {
        const updateData: any = {
            name, email, phone, role, department, area, address
        };

        if (pin) updateData.pin = pin;
        if (avatarUrl) updateData.avatarUrl = avatarUrl;

        const updatedEmployee = await prisma.employee.update({
            where: { id },
            data: updateData
        });

        res.json({ success: true, message: "Data karyawan berhasil diperbarui", data: updatedEmployee });
    } catch (error: any) {
        console.error("Update employee error:", error);
        res.status(500).json({ success: false, message: "Gagal memperbarui data karyawan" });
    }
});

// --- ATTENDANCE ROUTES ---

app.post('/api/attendance/check-in', async (req: Request<{}, {}, CheckInRequest>, res: Response) => {
    const { employeeId, latitude, longitude, photoInUrl, status } = req.body;

    try {
        const today = getTodayDate();

        const existingLog = await prisma.attendanceLog.findFirst({
            where: { employeeId, date: today }
        });

        if (existingLog) {
            res.status(400).json({ success: false, message: "Anda sudah melakukan check-in hari ini." });
            return;
        }

        const newLog = await prisma.attendanceLog.create({
            data: {
                employeeId,
                date: today,
                checkInTime: new Date(),
                status,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                photoInUrl,
                notes: ''
            }
        });

        res.status(201).json({ success: true, message: "Check-in berhasil!", data: newLog });

    } catch (error) {
        console.error("Check-in error:", error);
        res.status(500).json({ success: false, message: "Gagal melakukan check-in." });
    }
});

app.post('/api/attendance/check-out', async (req: Request<{}, {}, CheckOutRequest>, res: Response) => {
    const { logId } = req.body;

    try {
        const updatedLog = await prisma.attendanceLog.update({
            where: { id: logId },
            data: { checkOutTime: new Date() }
        });

        res.json({ success: true, message: "Check-out berhasil!", data: updatedLog });

    } catch (error: any) {
        console.error("Check-out error:", error);
        res.status(500).json({ success: false, message: "Gagal melakukan check-out." });
    }
});

app.get('/api/attendance/today-log/:employeeId', async (req: any, res: any) => {
    const { employeeId } = req.params;
    const today = getTodayDate();

    try {
        const log = await prisma.attendanceLog.findFirst({
            where: { employeeId, date: today }
        });
        res.json({ success: true, message: "Status hari ini diambil", data: log });
    } catch (error) {
        res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
    }
});

app.get('/api/attendance/history/:employeeId', async (req: any, res: any) => {
    const { employeeId } = req.params;
    try {
        const history = await prisma.attendanceLog.findMany({
            where: { employeeId },
            orderBy: { date: 'desc' },
            take: 31
        });
        res.json({ success: true, message: "Riwayat berhasil diambil", data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal mengambil riwayat." });
    }
});

app.get('/api/attendance/today', async (req: any, res: any) => {
    const today = getTodayDate();
    try {
        const logs = await prisma.attendanceLog.findMany({
            where: { date: today },
            include: { employee: { select: { name: true, avatarUrl: true, department: true } } },
            orderBy: { checkInTime: 'desc' }
        });
        res.json({ success: true, message: "Data absensi hari ini berhasil diambil", data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal mengambil data absensi." });
    }
});

// --- JOBDESK & PERFORMANCE ROUTES ---

app.post('/api/jobdesk', async (req: any, res: any) => {
    const { employeeId, date, area, completedTaskIds } = req.body;
    try {
        const submissionDate = new Date(date);
        const existing = await prisma.jobdeskSubmission.findFirst({
            where: { employeeId, date: submissionDate }
        });

        let result;
        if (existing) {
            result = await prisma.jobdeskSubmission.update({
                where: { id: existing.id },
                data: { completedTaskIds, lastUpdated: new Date() }
            });
        } else {
            result = await prisma.jobdeskSubmission.create({
                data: {
                    employeeId, date: submissionDate, area,
                    completedTaskIds, lastUpdated: new Date()
                }
            });
        }
        res.json({ success: true, message: "Jobdesk berhasil disimpan", data: result });
    } catch (error) {
        console.error("Save jobdesk error:", error);
        res.status(500).json({ success: false, message: "Gagal menyimpan jobdesk." });
    }
});

app.put('/api/jobdesk/:id/feedback', async (req: any, res: any) => {
    const { id } = req.params;
    const { managerNote } = req.body;
    try {
        const result = await prisma.jobdeskSubmission.update({
            where: { id },
            data: { managerNote }
        });
        res.json({ success: true, message: "Feedback saved", data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to save feedback" });
    }
});

app.get('/api/jobdesk/:employeeId/:date', async (req: any, res: any) => {
    const { employeeId, date } = req.params;
    try {
        const submissionDate = new Date(date);
        const submission = await prisma.jobdeskSubmission.findFirst({
            where: { employeeId, date: submissionDate }
        });
        res.json({ success: true, message: "Jobdesk fetched", data: submission });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal mengambil data jobdesk." });
    }
});

app.get('/api/jobdesk/date/:date', async (req: any, res: any) => {
    const { date } = req.params;
    try {
        const submissionDate = new Date(date);
        const submissions = await prisma.jobdeskSubmission.findMany({
            where: { date: submissionDate }
        });
        res.json({ success: true, message: "All jobdesks fetched", data: submissions });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching jobdesks." });
    }
});

app.post('/api/performance/snapshot', async (req: any, res: any) => {
    const { employeeId, date, dailyChecklist, punctualityScore, status, summaryComment, area } = req.body;
    try {
        const snapshotDate = new Date(date);
        const attendanceLog = await prisma.attendanceLog.findFirst({
            where: { employeeId, date: snapshotDate }
        });

        if (!attendanceLog) {
            res.status(400).json({ success: false, message: "Karyawan belum absen hari ini." });
            return;
        }

        const existing = await prisma.dailyPerformanceSnapshot.findFirst({
            where: { employeeId, date: snapshotDate }
        });

        let snapshot;
        if (existing) {
            snapshot = await prisma.dailyPerformanceSnapshot.update({
                where: { id: existing.id },
                data: { dailyChecklist, punctualityScore, status, summaryComment, updatedAt: new Date() }
            });
        } else {
            snapshot = await prisma.dailyPerformanceSnapshot.create({
                data: {
                    employeeId, attendanceLogId: attendanceLog.id, date: snapshotDate, area,
                    punctualityScore: punctualityScore || 0, presenceStatus: attendanceLog.status,
                    dailyChecklist, status: status || 'DRAFT', summaryComment, autoGenerated: false
                }
            });
        }
        res.json({ success: true, message: "Snapshot saved", data: snapshot });
    } catch (error) {
        console.error("Save snapshot error:", error);
        res.status(500).json({ success: false, message: "Gagal menyimpan penilaian." });
    }
});

app.get('/api/performance/snapshot/:employeeId/:date', async (req: any, res: any) => {
    const { employeeId, date } = req.params;
    try {
        const snapshotDate = new Date(date);
        const snapshot = await prisma.dailyPerformanceSnapshot.findFirst({
            where: { employeeId, date: snapshotDate }
        });
        res.json({ success: true, message: "Snapshot fetched", data: snapshot });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching snapshot." });
    }
});

app.get('/api/performance/history/:employeeId', async (req: any, res: any) => {
    const { employeeId } = req.params;
    try {
        const history = await prisma.dailyPerformanceSnapshot.findMany({
            where: { employeeId },
            orderBy: { date: 'desc' },
            take: 31
        });
        res.json({ success: true, message: "History fetched", data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching history." });
    }
});

app.post('/api/performance/review', async (req: any, res: any) => {
    const { id, employeeId, reviewerId, periodMonth, periodYear, area, scores, notes, overallScore, overallComment, isFinalized } = req.body;
    try {
        let result;
        try {
            result = await prisma.performanceReview.update({
                where: { id: id },
                data: {
                    employeeId, reviewerId, periodMonth, periodYear, area,
                    scores, notes, overallScore, overallComment, isFinalized,
                    updatedAt: new Date()
                }
            });
        } catch (e: any) {
            result = await prisma.performanceReview.create({
                data: {
                    employeeId, reviewerId, periodMonth, periodYear, area,
                    scores, notes, overallScore, overallComment, isFinalized
                }
            });
        }
        res.json({ success: true, message: "Review saved", data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal menyimpan review." });
    }
});

app.get('/api/performance/reviews/:employeeId', async (req: any, res: any) => {
    const { employeeId } = req.params;
    try {
        const reviews = await prisma.performanceReview.findMany({
            where: { employeeId },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, message: "Reviews fetched", data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal mengambil data review." });
    }
});

// --- SHIFT MANAGEMENT ROUTES ---

app.get('/api/shifts', async (req: any, res: any) => {
    const { month, year } = req.query;
    if (!month || !year) { return res.status(400).json({ success: false }); }

    try {
        const m = parseInt(month as string);
        const y = parseInt(year as string);
        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 0);

        const shifts = await prisma.shiftAssignment.findMany({
            where: { date: { gte: startDate, lte: endDate } }
        });

        const formattedShifts = shifts.map((s: any) => ({
            ...s, date: s.date.toISOString().split('T')[0]
        }));
        res.json({ success: true, message: "Shifts fetched", data: formattedShifts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch shifts" });
    }
});

app.post('/api/shifts/generate', async (req: any, res: any) => {
    const { month, year } = req.body;
    try {
        const employees = await prisma.employee.findMany({
            where: { role: { notIn: ['SUPER_ADMIN', 'BUSINESS_OWNER'] } }
        });

        const daysInMonth = new Date(year, month, 0).getDate();
        const shiftsToCreate = [];

        for (const emp of employees) {
            for (let d = 1; d <= daysInMonth; d++) {
                const date = new Date(year, month - 1, d);
                const dayOfWeek = date.getDay();

                // --- FIX: Use local enum for ShiftType ---
                let type: ShiftType = ShiftType.MORNING;
                if (dayOfWeek === 1) type = ShiftType.OFF;
                else if (dayOfWeek === 0 || dayOfWeek === 6) type = ShiftType.MIDDLE;

                const times = getShiftTimes(type);
                shiftsToCreate.push({
                    employeeId: emp.id, date: date, type: type,
                    startTime: times.start, endTime: times.end,
                    color: SHIFT_COLORS[type] || '#000000', isPublished: false
                });
            }
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        await prisma.$transaction([
            prisma.shiftAssignment.deleteMany({ where: { date: { gte: startDate, lte: endDate } } }),
            prisma.shiftAssignment.createMany({ data: shiftsToCreate })
        ]);

        const newShifts = await prisma.shiftAssignment.findMany({
            where: { date: { gte: startDate, lte: endDate } }
        });

        const formattedShifts = newShifts.map((s: any) => ({
            ...s, date: s.date.toISOString().split('T')[0]
        }));
        res.json({ success: true, message: "Jadwal berhasil digenerate", data: formattedShifts });
    } catch (error) {
        console.error("Generate shift error: ", error);
        res.status(500).json({ success: false, message: "Gagal generate jadwal." });
    }
});

app.put('/api/shifts/:id', async (req: any, res: any) => {
    const { id } = req.params;
    const { type } = req.body;
    try {
        const times = getShiftTimes(type);
        const updatedShift = await prisma.shiftAssignment.update({
            where: { id },
            data: { type, startTime: times.start, endTime: times.end, color: SHIFT_COLORS[type] || '#000' }
        });
        const formatted = {
            ...updatedShift, date: updatedShift.date.toISOString().split('T')[0]
        };
        res.json({ success: true, message: "Shift updated", data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal update shift" });
    }
});

app.post('/api/shifts/publish', async (req: any, res: any) => {
    const { month, year } = req.body;
    try {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        await prisma.shiftAssignment.updateMany({
            where: { date: { gte: startDate, lte: endDate } },
            data: { isPublished: true }
        });
        res.json({ success: true, message: "Jadwal dipublikasikan", data: true });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal mempublikasikan jadwal." });
    }
});

// --- PAYROLL ROUTES ---

app.get('/api/payroll', async (req: any, res: any) => {
    const { role, userId } = req.query;
    try {
        let whereClause: any = {};
        if (role === 'EMPLOYEE') {
            whereClause = { employeeId: userId, status: 'SENT', isVisibleToEmployee: true };
        }
        const payslips = await prisma.payslip.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, message: "Payslips fetched", data: payslips.map(parsePayslip) });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal mengambil data payroll." });
    }
});

app.get('/api/payroll/:id', async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const payslip = await prisma.payslip.findUnique({ where: { id } });
        if (!payslip) return res.status(404).json({ success: false });
        res.json({ success: true, message: "Fetched", data: parsePayslip(payslip) });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching payslip" });
    }
});

app.post('/api/payroll', async (req: any, res: any) => {
    const data = req.body;
    try {
        const payload = {
            employeeId: data.employeeId,
            periodMonth: data.periodMonth,
            periodYear: data.periodYear,
            payDate: new Date(data.payDate),
            basicSalary: data.basicSalary,
            allowanceMeal: data.allowanceMeal,
            allowanceTransport: data.allowanceTransport,
            allowanceOther: data.allowanceOther,
            overtimeHours: data.overtimeHours,
            overtimeAmount: data.overtimeAmount,
            bonus: data.bonus,
            commission: data.commission,
            bpjsKesehatan: data.bpjsKesehatan,
            bpjsKetenagakerjaan: data.bpjsKetenagakerjaan,
            taxPPh21: data.taxPPh21,
            otherDeductions: data.otherDeductions,
            totalEarnings: data.totalEarnings,
            totalDeductions: data.totalDeductions,
            netSalary: data.netSalary,
            status: data.status,
            isVisibleToEmployee: data.isVisibleToEmployee,
            notesForEmployee: data.notesForEmployee,
            notesInternalHr: data.notesInternalHr,
            createdByHrId: data.createdByHrId,
            createdAt: data.id && !data.id.startsWith('slip-') ? undefined : new Date(),
            updatedAt: new Date()
        };

        if (data.id && !data.id.startsWith('slip-')) {
            const existing = await prisma.payslip.findUnique({ where: { id: data.id } });
            if (existing) {
                const result = await prisma.payslip.update({ where: { id: data.id }, data: payload });
                res.json({ success: true, message: "Payslip updated", data: parsePayslip(result) });
                return;
            }
        }

        if (payload.createdAt === undefined) delete (payload as any).createdAt;
        const result = await prisma.payslip.create({ data: payload });
        res.json({ success: true, message: "Payslip created", data: parsePayslip(result) });
    } catch (error) {
        console.error("Payroll save error:", error);
        res.status(500).json({ success: false, message: "Gagal menyimpan slip gaji." });
    }
});

app.post('/api/payroll/:id/send', async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const result = await prisma.payslip.update({
            where: { id },
            data: { status: 'SENT', isVisibleToEmployee: true }
        });
        res.json({ success: true, message: "Payslip sent", data: parsePayslip(result) });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error sending payslip" });
    }
});

// --- ANALYTICS ---

app.get('/api/analytics/dashboard', async (req: any, res: any) => {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ success: false });

    try {
        const m = parseInt(month as string);
        const y = parseInt(year as string);

        const reviews = await prisma.performanceReview.findMany({
            where: { periodMonth: m, periodYear: y, isFinalized: true },
            include: { employee: true }
        });

        const fohReviews = reviews.filter((r: any) => r.area === 'FOH');
        const bohReviews = reviews.filter((r: any) => r.area === 'BOH');

        const fohAvg = fohReviews.length > 0 ? fohReviews.reduce((sum: number, r: any) => sum + r.overallScore, 0) / fohReviews.length : 0;
        const bohAvg = bohReviews.length > 0 ? bohReviews.reduce((sum: number, r: any) => sum + r.overallScore, 0) / bohReviews.length : 0;

        const topPerformers = reviews.sort((a: any, b: any) => b.overallScore - a.overallScore).slice(0, 3)
            .map((r: any) => ({ employeeId: r.employeeId, name: r.employee.name, avatarUrl: r.employee.avatarUrl, avgScore: r.overallScore }));

        const data = {
            topPerformers,
            fohAverage: parseFloat(fohAvg.toFixed(1)),
            bohAverage: parseFloat(bohAvg.toFixed(1)),
            itemTrends: [{ label: 'Kehadiran', value: 95, trend: 'STABLE' }, { label: 'Kebersihan', value: 4.2, trend: 'UP' }]
        };
        res.json({ success: true, message: "Stats fetched", data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch stats" });
    }
});

app.get('/api/analytics/eotm', async (req: any, res: any) => {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ success: false });

    try {
        const m = parseInt(month as string);
        const y = parseInt(year as string);

        const topReview = await prisma.performanceReview.findFirst({
            where: { periodMonth: m, periodYear: y, isFinalized: true },
            orderBy: { overallScore: 'desc' },
            include: { employee: true }
        });

        if (!topReview) return res.json({ success: false, message: "No data yet" });

        const eotm = {
            employeeId: topReview.employeeId,
            name: topReview.employee.name,
            department: topReview.employee.department,
            avatarUrl: topReview.employee.avatarUrl,
            periodMonth: m, periodYear: y,
            avgScore: topReview.overallScore,
            achievementBadge: "Star Employee",
            description: topReview.overallComment
        };
        res.json({ success: true, message: "EOTM fetched", data: eotm });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching EOTM" });
    }
});

// --- SEEDER ENDPOINT (FOR DEMO ONLY) ---
app.get('/api/seed', async (req: any, res: any) => {
    try {
        // 1. Clean up
        await prisma.attendanceLog.deleteMany({});
        await prisma.shiftAssignment.deleteMany({});
        await prisma.employee.deleteMany({});

        // 2. Create Employees
        const employeesData = [
            { name: 'Super Admin', email: 'admin@pawonsalam.com', phone: '08888888888', pin: '123456', role: 'SUPER_ADMIN', department: 'IT', area: 'FOH' },
            { name: 'Veronica Dhian', email: 'veronica@pawonsalam.com', phone: '081325736911', pin: '123456', role: 'BUSINESS_OWNER', department: 'Owner', area: 'FOH' },
            { name: 'Wawan', email: 'wawan@pawonsalam.com', phone: '085219481806', pin: '123456', role: 'RESTAURANT_MANAGER', department: 'Manager', area: 'FOH' },
            { name: 'Ana Jumnanik', email: 'ana@pawonsalam.com', phone: '085640028589', pin: '123456', role: 'HR_MANAGER', department: 'HR', area: 'FOH' },
            { name: 'Farhan', email: 'farhan@pawonsalam.com', phone: '082117055306', pin: '123456', role: 'EMPLOYEE', department: 'Waiter', area: 'FOH' },
            { name: 'Ardian', email: 'ardian@pawonsalam.com', phone: '081313042461', pin: '123456', role: 'EMPLOYEE', department: 'Kitchen', area: 'BOH' }
        ];

        for (const emp of employeesData) {
            await prisma.employee.create({
                data: {
                    ...emp,
                    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random`,
                    role: emp.role as any,
                    area: emp.area as any
                }
            });
        }

        res.send('🌱 Database seeded successfully! Ready to rock! 🚀');
    } catch (error) {
        console.error("Seeding error:", error);
        res.status(500).send('Seeding failed.');
    }
});

// --- BOOTSTRAP ---
// Listen on 0.0.0.0 to be accessible from outside localhost (e.g. from frontend running on host)
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`◈ Server menyala di http://localhost:${PORT}`);
});
