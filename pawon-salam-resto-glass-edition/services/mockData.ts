import { AttendanceLog, AttendanceStatus, DailyPerformanceSnapshot, Employee, EmployeeArea, Payslip, PerformanceReview, UserRole, LeaveRequest, LeaveType, LeaveStatus, ShiftAssignment, ShiftType, SHIFT_COLORS, AuditLog, SystemSetting, Message, MessageAudience } from "../types";

// Helper to get dynamic "Today" date for mock purposes
const getTodayStr = () => new Date().toISOString().split('T')[0];
// Helper to get dynamic Birth Date (Same month/day as today)
const getBirthdayToday = (year: number) => {
  const today = new Date();
  return `${year}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

export const MOCK_EMPLOYEES: Employee[] = [
  // --- SUPER ADMIN (DEMO) ---
  {
    id: 'super-admin',
    name: 'Super Admin',
    email: 'admin@pawonsalam.com',
    phone: '08888888888',
    pin: '123456',
    address: 'System',
    role: UserRole.SUPER_ADMIN,
    department: 'IT Support Sistem',
    area: EmployeeArea.FOH,
    avatarUrl: 'https://ui-avatars.com/api/?name=Super+Admin&background=EF4444&color=fff',
    birthDate: '1990-01-01'
  },

  // --- ADMINS & OWNERS ---
  {
    id: 'emp-001',
    name: 'Dr. Veronica Dhian Rusnasari SpPD, M.MRS',
    email: 'veronica@pawonsalam.com',
    phone: '081325736911',
    pin: '123456',
    address: 'Semarang',
    role: UserRole.BUSINESS_OWNER,
    department: 'Business Owner',
    area: EmployeeArea.FOH,
    avatarUrl: 'https://ui-avatars.com/api/?name=Veronica+Dhian&background=E87722&color=fff',
    birthDate: '1980-05-20'
  },
  {
    id: 'emp-003',
    name: 'Ana Jumnanik',
    email: 'ana@pawonsalam.com',
    phone: '085640028589',
    pin: '123456',
    address: 'Semarang',
    role: UserRole.HR_MANAGER,
    department: 'Human Resources Manager',
    area: EmployeeArea.FOH,
    avatarUrl: 'https://ui-avatars.com/api/?name=Ana+Jumnanik&background=E87722&color=fff',
    birthDate: '1985-03-15'
  },

  // --- MANAGERS ---
  {
    id: 'emp-002',
    name: 'Boston Endi Sitompul',
    email: 'boston@pawonsalam.com',
    phone: '082312398289',
    pin: '123456',
    role: UserRole.FINANCE_MANAGER,
    department: 'Finance Manager',
    area: EmployeeArea.FOH,
    avatarUrl: 'https://ui-avatars.com/api/?name=Boston+Endi&background=random',
    birthDate: '1992-08-10'
  },
  {
    id: 'emp-005',
    name: 'Wawan',
    email: 'herwandi@pawonsalam.com',
    phone: '085219481806',
    pin: '123456',
    role: UserRole.RESTAURANT_MANAGER,
    department: 'Resto Manager',
    area: EmployeeArea.FOH,
    avatarUrl: 'https://ui-avatars.com/api/?name=Wawan&background=random',
    birthDate: getBirthdayToday(1990) // SET TO TODAY FOR DEMO
  },
  {
    id: 'emp-mkt',
    name: 'Anto',
    email: 'stepanus@pawonsalam.com',
    phone: '082125265827',
    pin: '123456',
    role: UserRole.MARKETING_MANAGER,
    department: 'Marketing Manager',
    area: EmployeeArea.FOH,
    avatarUrl: 'https://ui-avatars.com/api/?name=Anto&background=random',
    birthDate: '1993-11-22'
  },

  // --- BOH STAFF ---
  {
    id: 'emp-006',
    name: 'Ardian',
    email: 'ardian@pawonsalam.com',
    phone: '081313042461',
    pin: '123456',
    role: UserRole.EMPLOYEE,
    department: 'Assisten Chef',
    area: EmployeeArea.BOH,
    avatarUrl: 'https://ui-avatars.com/api/?name=Ardian&background=random',
    birthDate: '1998-07-12'
  },
  {
    id: 'emp-008',
    name: 'Imam',
    email: 'imam@pawonsalam.com',
    phone: '083872098579',
    pin: '123456',
    role: UserRole.EMPLOYEE,
    department: 'Cook Helper',
    area: EmployeeArea.BOH,
    avatarUrl: 'https://ui-avatars.com/api/?name=Imam&background=random',
    birthDate: '2000-02-28'
  },

  // --- FOH STAFF ---
  {
    id: 'emp-007',
    name: 'Farhan',
    email: 'farhan@pawonsalam.com',
    phone: '082117055306',
    pin: '123456',
    role: UserRole.EMPLOYEE,
    department: 'Waiter',
    area: EmployeeArea.FOH,
    avatarUrl: 'https://ui-avatars.com/api/?name=Farhan&background=random',
    birthDate: getBirthdayToday(1999) // SET TO TODAY FOR DEMO
  },
  {
    id: 'emp-009',
    name: 'Fauzan',
    email: 'fauzan@pawonsalam.com',
    phone: '088802116155',
    pin: '123456',
    role: UserRole.EMPLOYEE,
    department: 'Waiter',
    area: EmployeeArea.FOH,
    avatarUrl: 'https://ui-avatars.com/api/?name=Fauzan&background=random',
    birthDate: '1999-09-09'
  },
  {
    id: 'emp-010',
    name: 'Andi',
    email: 'andi@pawonsalam.com',
    phone: '083116714646',
    pin: '123456',
    role: UserRole.EMPLOYEE,
    department: 'Waiter',
    area: EmployeeArea.FOH,
    avatarUrl: 'https://ui-avatars.com/api/?name=Andi&background=random',
    birthDate: '1996-12-12'
  }
];

export const MOCK_ATTENDANCE: AttendanceLog[] = [
  {
    id: 'att-001',
    employeeId: 'emp-002',
    date: new Date().toISOString().split('T')[0],
    checkInTime: new Date(new Date().setHours(8, 30)).toISOString(),
    status: AttendanceStatus.PRESENT,
    latitude: -6.959023496318285,
    longitude: 107.7013609943469,
  },
  {
    id: 'att-hist-1',
    employeeId: 'emp-002',
    date: '2023-10-25',
    checkInTime: '2023-10-25T08:00:00.000Z',
    checkOutTime: '2023-10-25T17:00:00.000Z',
    status: AttendanceStatus.PRESENT,
    latitude: -6.959023,
    longitude: 107.701360
  }
];

export const MOCK_DAILY_SNAPSHOTS: DailyPerformanceSnapshot[] = [
  {
    id: 'ds-1',
    employeeId: 'emp-006', // Ardian BOH
    attendanceLogId: 'att-prev-1',
    date: new Date().toISOString().split('T')[0],
    area: EmployeeArea.BOH,
    punctualityScore: 5,
    presenceStatus: AttendanceStatus.PRESENT,
    autoGenerated: true,
    status: 'REVIEWED',
    dailyChecklist: {
      items: {
        'gen_attendance': { checked: true, score: 5, notes: 'Very Good' },
        'kit_cleanliness': { checked: true, score: 4, notes: '' }
      },
      summary: {
        totalScoreUmum: 5, avgScoreUmum: 5,
        totalScoreKhusus: 4, avgScoreKhusus: 4,
        totalScoreAll: 9, avgScoreAll: 4.5,
        overallComment: 'Great start!'
      },
      isFinalized: true
    }
  }
];

export const MOCK_PERFORMANCE_REVIEWS: PerformanceReview[] = [
  {
    id: 'pr-1',
    employeeId: 'emp-007', // Farhan FOH
    reviewerId: 'emp-005', // Manager
    periodMonth: 10,
    periodYear: 2023,
    area: EmployeeArea.FOH,
    scores: {
      'attitude': 4,
      'service_speed': 3,
      'cleanliness': 5
    },
    notes: {
      'service_speed': 'Perlu ditingkatkan saat jam sibuk'
    },
    overallScore: 4.0,
    overallComment: 'Kinerja bulan ini cukup baik, namun perlu fokus pada kecepatan.',
    isFinalized: true,
    createdAt: '2023-11-01T10:00:00Z',
    updatedAt: '2023-11-01T10:00:00Z'
  }
];

export const MOCK_PAYSLIPS: Payslip[] = [
  {
    id: 'slip-001',
    employeeId: 'emp-006', // Ardian
    periodMonth: 10,
    periodYear: 2023,
    payDate: '2023-11-01',
    basicSalary: 3000000,
    allowanceMeal: 500000,
    allowanceTransport: 300000,
    allowanceOther: 0,
    overtimeHours: 5,
    overtimeAmount: 150000,
    bonus: 200000,
    commission: 0,
    bpjsKesehatan: 50000,
    bpjsKetenagakerjaan: 100000,
    taxPPh21: 0,
    otherDeductions: 0,
    totalEarnings: 4150000,
    totalDeductions: 150000,
    netSalary: 4000000,
    status: 'SENT',
    isVisibleToEmployee: true,
    notesForEmployee: 'Terima kasih atas dedikasi Anda bulan ini!',
    notesInternalHr: 'Bonus performa included based on good checklist scores.',
    createdByHrId: 'emp-003',
    createdAt: '2023-10-31T10:00:00Z',
    updatedAt: '2023-10-31T10:00:00Z'
  },
  {
    id: 'slip-002',
    employeeId: 'emp-007', // Farhan
    periodMonth: 11,
    periodYear: 2023,
    payDate: '2023-12-01',
    basicSalary: 2500000,
    allowanceMeal: 400000,
    allowanceTransport: 200000,
    allowanceOther: 0,
    overtimeHours: 0,
    overtimeAmount: 0,
    bonus: 0,
    commission: 0,
    bpjsKesehatan: 50000,
    bpjsKetenagakerjaan: 100000,
    taxPPh21: 0,
    otherDeductions: 50000, // Kasbon
    totalEarnings: 3100000,
    totalDeductions: 200000,
    netSalary: 2900000,
    status: 'DRAFT',
    isVisibleToEmployee: false,
    notesForEmployee: '',
    notesInternalHr: '',
    createdByHrId: 'emp-003',
    createdAt: '2023-11-25T10:00:00Z',
    updatedAt: '2023-11-25T10:00:00Z'
  }
];

export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'lr-001',
    employeeId: 'emp-007',
    type: LeaveType.ANNUAL,
    startDate: '2023-11-10',
    endDate: '2023-11-12',
    reason: 'Pulang Kampung',
    status: LeaveStatus.APPROVED
  },
  {
    id: 'lr-002',
    employeeId: 'emp-007',
    type: LeaveType.SICK,
    startDate: '2023-12-05',
    endDate: '2023-12-05',
    reason: 'Demam tinggi',
    status: LeaveStatus.REJECTED
  },
  {
    id: 'lr-003',
    employeeId: 'emp-006',
    type: LeaveType.OTHER,
    startDate: '2023-11-20',
    endDate: '2023-11-20',
    reason: 'Mengurus STNK',
    status: LeaveStatus.PENDING
  }
];

// --- AUTO GENERATE SHIFT FOR CURRENT MONTH DEMO ---
const generateMockShifts = () => {
  const shifts: ShiftAssignment[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // Current Month
  const daysInMonth = new Date(year, month, 0).getDate();

  MOCK_EMPLOYEES.forEach(emp => {
    // Skip if owner
    if (emp.role === UserRole.BUSINESS_OWNER) return;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon

      // PATTERN:
      // Monday (1) = OFF
      // Tue-Fri (2-5) = MORNING
      // Sat-Sun (6,0) = MIDDLE

      let type = ShiftType.MORNING;
      if (dayOfWeek === 1) type = ShiftType.OFF;
      else if (dayOfWeek === 0 || dayOfWeek === 6) type = ShiftType.MIDDLE;

      // Set times based on type (Updated hours)
      let start = '10:00', end = '20:00';
      if (type === ShiftType.MIDDLE) { start = '11:00'; end = '21:00'; }
      if (type === ShiftType.OFF) { start = ''; end = ''; }

      shifts.push({
        id: `sh-${emp.id}-${d}`,
        employeeId: emp.id,
        date: dateStr,
        type: type,
        startTime: start,
        endTime: end,
        color: SHIFT_COLORS[type],
        isPublished: true
      });
    }
  });
  return shifts;
};

export const MOCK_SHIFTS: ShiftAssignment[] = generateMockShifts();

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    action: 'LOGIN',
    performedBy: 'super-admin',
    details: 'Super Admin logged in',
    timestamp: new Date().toISOString()
  }
];

export const MOCK_SYSTEM_SETTINGS: SystemSetting[] = [
  {
    key: 'app_version',
    value: '1.0.0',
    label: 'App Version',
    description: 'Current version of the application'
  },
  {
    key: 'maintenance_mode',
    value: false,
    label: 'Maintenance Mode',
    description: 'Enable to prevent user login'
  },
  {
    key: 'allow_gps_mock',
    value: false,
    label: 'Allow GPS Mock',
    description: 'Allow users to use mock location (Dev only)'
  }
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    senderId: 'emp-001', // Veronica
    senderName: 'Dr. Veronica Dhian',
    senderAvatarUrl: 'https://ui-avatars.com/api/?name=Veronica+Dhian&background=E87722&color=fff',
    senderRole: UserRole.BUSINESS_OWNER,
    content: 'Selamat pagi tim! Ingat, besok kita ada event catering outdoor besar di Balai Kota. Mohon semua manajer pastikan staff di bawahnya sudah briefing dan siap tempur. Semangat!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    audience: MessageAudience.ALL_MANAGERS,
    readBy: ['emp-005', 'emp-003'],
    senderArea: EmployeeArea.MANAGEMENT
  },
  {
    id: 'msg-2',
    senderId: 'emp-003', // Ana
    senderName: 'Ana Jumnanik',
    senderAvatarUrl: 'https://ui-avatars.com/api/?name=Ana+Jumnanik&background=E87722&color=fff',
    senderRole: UserRole.HR_MANAGER,
    content: 'Perhatian untuk semua staff. Sehubungan dengan event besok, akan ada penyesuaian jadwal shift sore. Mohon cek jadwal terbaru yang sudah di-publish oleh Manajer Resto. Terima kasih.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    audience: MessageAudience.ALL_STAFF,
    readBy: ['emp-006', 'emp-008', 'emp-009', 'emp-010'],
    senderArea: EmployeeArea.MANAGEMENT
  },
  {
    id: 'msg-3',
    senderId: 'emp-005', // Wawan
    senderName: 'Wawan',
    senderAvatarUrl: 'https://ui-avatars.com/api/?name=Wawan&background=random',
    senderRole: UserRole.RESTAURANT_MANAGER,
    content: 'Koordinasi untuk para manajer: Saya sudah alokasikan 2 staff FOH tambahan untuk membantu loading logistik besok pagi jam 7. Tolong HR dan Finance take note untuk insentif transport mereka.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    audience: MessageAudience.ALL_MANAGERS,
    readBy: [],
    senderArea: EmployeeArea.MANAGEMENT
  }
];
