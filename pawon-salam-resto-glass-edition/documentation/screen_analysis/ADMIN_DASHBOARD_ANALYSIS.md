# 🖥️ SUPER DETAIL SCREEN ANALYSIS: ADMIN DASHBOARD

**Screen Name:** Admin Dashboard
**File Source:** `screens/admin/AdminDashboardScreen.tsx`
**Role Access:** Super Admin, Business Owner, HR Manager, Resto Manager, Finance Manager, Marketing Manager.

---

## 🎨 VISUAL SPECIFICATIONS (SUPER DETAIL)

### 1. **Header Area**
*   **Background:** Gradient Orange (`colors.gradientMain`)
    *   *Implementation:* `style={{ background: colors.gradientMain }}`
    *   *Texture:* `url("https://www.transparenttextures.com/patterns/food.png")` (Opacity 30%)
*   **Font Family:** Inter (Default)
*   **Text Elements:**
    *   **"Admin Panel" Badge:**
        *   Size: `text-[9px]` (Ultra Small)
        *   Weight: `font-bold`
        *   Color: `text-orange-100`
        *   Style: Uppercase, Tracking Widest
    *   **User Name:**
        *   Size: `text-lg` (Large)
        *   Weight: `font-bold`
        *   Color: `text-white`
    *   **Role Display:**
        *   Size: `text-[9px]`
        *   Weight: `font-medium`
        *   Color: `text-white`
        *   Background: `bg-white/20` (Pill shape)

### 2. **Super Admin Specifics**
*   **Impersonate Box:**
    *   **Container:** `bg-white/10`, `backdrop-blur-xl`, `border-white/20`
    *   **Title:** "Impersonate User" (`font-bold text-xs text-white`)
    *   **Status Badge:** "Active" (`bg-green-500/20`, `text-green-300`, `text-[9px]`)
    *   **Input Field:**
        *   Background: `bg-black/20`
        *   Text: `text-xs text-white`
        *   Placeholder: `placeholder-white/30`
    *   **Action Button:**
        *   Background: `bg-orange-500` (Hover: `bg-orange-600`)
        *   Text: `text-white font-bold text-xs`
        *   Shadow: `shadow-lg`

### 3. **System Tools (Menu Grid)**
*   **Card Component:** `PremiumGlassCard`
*   **Layout:** Grid 2 Columns (`grid-cols-2 gap-3`)
*   **Card Style:**
    *   Background: `bg-white`
    *   Border: `border-gray-100`
    *   Shadow: `shadow-sm`
    *   Corner Radius: `rounded-2xl`
*   **Typography:**
    *   **Title:** `font-bold text-gray-800` (Size inherited from component)
    *   **Subtitle:** `text-xs text-gray-500`

---

## 🔄 ROUTING LOGIC MAPPING

**Trigger:** User clicks a menu button.
**Action:** `onNavigate(screenName)` is called.
**Handler:** `App.tsx` switches `currentScreen` state.

| Button Title | Icon | Theme Color | Target Screen ID | Destination File (`src/screens/...`) |
| :--- | :--- | :--- | :--- | :--- |
| **Kelola User** | Users | Purple | `'adminEmployees'` | `admin/AdminEmployeeListScreen.tsx` |
| **System** | Settings | Teal | `'systemSettings'` | `admin/SystemSettingsScreen.tsx` |
| **Audit Logs** | ClipboardList | Blue | `'auditLogs'` | `admin/AuditLogScreen.tsx` |

---

## ⚠️ CRITICAL OBSERVATIONS

1.  **Asset Dependency:** Background texture depends on `transparenttextures.com`. **Risk:** Offline/Downtime.
2.  **Hardcoded Styles:** Many styles are inline Tailwind classes rather than reusable components.
3.  **Monolithic File:** This screen handles 6 roles. Super Admin logic is nested deep in ternary operators.

---

## 📝 RECOMMENDATIONS

1.  **Localize Assets:** Download `food.png` and `cubes.png` to `src/assets/images`.
2.  **Extract Component:** Move Super Admin view to `components/dashboards/SuperAdminView.tsx`.
3.  **Standardize Typography:** Create a typography system (e.g., `text-h1`, `text-caption`) instead of arbitrary pixel sizes (`text-[9px]`).
