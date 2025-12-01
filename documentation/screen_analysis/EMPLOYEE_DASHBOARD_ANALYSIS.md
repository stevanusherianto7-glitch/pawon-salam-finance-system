# 📱 SUPER DETAIL SCREEN ANALYSIS: EMPLOYEE DASHBOARD

**Screen Name:** Employee Dashboard
**File Source:** `screens/employee/EmployeeDashboardScreen.tsx`
**Role Access:** Employee (Staff)

---

## 🎨 VISUAL SPECIFICATIONS (SUPER DETAIL)

### 1. **Header Area (Compact Luxury)**
*   **Background:** Gradient Orange (`colors.gradientMain`)
    *   *Implementation:* `style={{ background: colors.gradientMain }}`
    *   *Texture:* `url("https://www.transparenttextures.com/patterns/food.png")` (Opacity 20%)
*   **Font Family:** Inter (Default)
*   **Text Elements:**
    *   **"Welcome back,"**:
        *   Size: `text-[10px]`
        *   Weight: `font-medium`
        *   Color: `text-orange-100`
        *   Style: Uppercase, Tracking Wide
    *   **User Name:**
        *   Size: `text-lg`
        *   Weight: `font-bold`
        *   Color: `text-white`
    *   **Department Badge:**
        *   Size: `text-[10px]`
        *   Color: `text-orange-100/80`
        *   Background: `bg-white/10` (Backdrop Blur)

### 2. **Score Strip (Sticky Top)**
*   **Container:** `bg-white/90`, `backdrop-blur-md`, `border-white/50`, `rounded-xl`
*   **Label:** "Skor Harian" (`text-xs font-bold text-gray-700`)
*   **Value:**
    *   Size: `text-lg font-bold`
    *   Color: Dynamic (Green/Orange/Red based on score)
    *   Font: `font-heading` (Custom)

### 3. **Action Menu (Bento Grid)**
*   **Card Component:** `PremiumGlassCard`
*   **Layout:** Grid 2 Columns (`grid-cols-2 gap-3`)
*   **Card Style:**
    *   Background: `bg-white` (Glass effect via component)
    *   Theme Colors: Blue, Purple, Green, Orange
*   **Typography:**
    *   **Title:** `font-bold text-gray-800`
    *   **Subtitle:** `text-xs text-gray-500`

---

## 🔄 ROUTING LOGIC MAPPING

**Trigger:** User clicks a menu button.
**Action:** `onNavigate(screenName)` is called.
**Handler:** `App.tsx` switches `currentScreen` state.

| Button Title | Icon | Theme Color | Target Screen ID | Destination File (`src/screens/...`) |
| :--- | :--- | :--- | :--- | :--- |
| **Daily Jobdesk** | ListTodo | Blue | `'dailyJobdesk'` | `employee/DailyJobdeskScreen.tsx` |
| **Cuti & Izin** | FileText | Purple | `'leaveRequest'` | `employee/LeaveRequestScreen.tsx` |
| **Slip Gaji** | Banknote | Green | `'employeePayslips'` | `employee/EmployeePayslipListScreen.tsx` |
| **Lihat Leaderboard** | Trophy | Orange | `'hrTopPerformance'` | `admin/HRTopPerformanceScreen.tsx` |
| **Skor Harian** | TrendingUp | Orange | `'performanceDetail'` | `admin/PerformanceDetailScreen.tsx` |

---

## ⚠️ CRITICAL OBSERVATIONS

1.  **Logic Heavy:** This screen contains complex logic for **Geolocation** and **Camera** access within the UI component itself.
2.  **Hardcoded Assets:** Background texture depends on `transparenttextures.com`.
3.  **Inline Styles:** Extensive use of arbitrary Tailwind values (e.g., `rounded-b-[2.5rem]`).

---

## 📝 RECOMMENDATIONS

1.  **Refactor Logic:** Move GPS/Camera logic to a custom hook `useAttendanceCheckIn`.
2.  **Localize Assets:** Download `food.png` to `src/assets/images`.
3.  **Standardize Header:** The header design is slightly different from the Admin Dashboard (different padding/rounding). Should be standardized into a `DashboardHeader` component.
