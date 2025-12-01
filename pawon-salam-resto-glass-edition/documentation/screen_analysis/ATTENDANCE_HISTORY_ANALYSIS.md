# 📅 SUPER DETAIL SCREEN ANALYSIS: ATTENDANCE HISTORY

**Screen Name:** Attendance History
**File Source:** `screens/employee/AttendanceHistoryScreen.tsx`
**Role Access:** Employee (Staff)

---

## 🎨 VISUAL SPECIFICATIONS (SUPER DETAIL)

### 1. **Theme & Background**
*   **Style:** "Sultan Mode" (Dark Premium Glassmorphism)
*   **Background:** `BackgroundPattern` Component (Likely dark gradient)
*   **Font Family:** Inter (Default)

### 2. **Header Area**
*   **Title:** "Riwayat Absensi"
    *   Size: `text-xl`
    *   Weight: `font-bold`
    *   Color: `text-white`
*   **Padding:** `p-4 pt-10`

### 3. **Filter Tabs (Sultan Mode)**
*   **Container:**
    *   Background: `bg-black/20`
    *   Blur: `backdrop-blur-xl`
    *   Border: `border-white/10`
    *   Radius: `rounded-2xl`
*   **Tab Button:**
    *   Active Text: `text-orange-900`
    *   Inactive Text: `text-white/60`
    *   Active Background: `bg-white` (Absolute inset)
    *   Shadow: `shadow-lg shadow-black/10`

### 4. **Statistics Card**
*   **Container:**
    *   Background: `bg-black/20`
    *   Blur: `backdrop-blur-2xl`
    *   Border: `border-white/10`
    *   Radius: `rounded-2xl`
*   **Stats Item:**
    *   Background: `bg-white/5`
    *   Border: `border-white/10`
    *   Value Text: `text-lg font-bold text-white`

### 5. **History List Item**
*   **Container:**
    *   Background: `bg-black/20`
    *   Blur: `backdrop-blur-xl`
    *   Border: `border-white/10` (Expanded: `border-orange-400/50`)
    *   Radius: `rounded-2xl`
*   **Date Box:**
    *   Background: `bg-white/5`
    *   Size: `w-12 h-12`
    *   Date Text: `text-lg font-bold text-white`
*   **Status Badge:**
    *   **Hadir:** Green (`#10B981`)
    *   **Terlambat:** Amber (`#F59E0B`)
    *   **Absen:** Red (`#EF4444`)

---

## 🔄 LOGIC & DATA FLOW

**Data Source:** `useAttendanceStore` -> `fetchHistory(user.id)`

**Filter Logic:**
1.  **WEEK:** Last 7 days from today.
2.  **MONTH:** Current month & year only.
3.  **ALL:** No filter.

**Calculated Stats:**
*   **Total Hari:** Count of filtered logs.
*   **Rata-rata Durasi:** Average of `(checkOutTime - checkInTime)` for valid logs.

**Expand Logic:**
*   Clicking a card toggles `expandedId`.
*   Shows: Durasi, Lokasi (Lat/Long + Jarak), Bukti Foto.

---

## ⚠️ CRITICAL OBSERVATIONS

1.  **Inconsistent Design:** This screen uses a **Dark Mode** ("Sultan Mode") design (`bg-black/20`, `text-white`), while the Dashboard and Login are **Light Mode** (`bg-white/80`, `text-gray-800`). This creates a jarring UX transition.
2.  **Hardcoded Colors:** Status colors are hardcoded hex values in the function `getStatusColor`, not using the theme palette.
3.  **Performance:** `filteredHistory` is recalculated on every render. Should be memoized with `useMemo`.

---

## 📝 RECOMMENDATIONS

1.  **Unify Theme:** Decide on Light vs Dark. If the app is Light Mode, this screen should use white glass cards (`bg-white/60`) and dark text. If Dark Mode is chosen, the Dashboard needs to be updated.
2.  **Refactor Colors:** Move status colors to `theme/colors.ts`.
3.  **Optimize:** Wrap filter logic in `useMemo`.
