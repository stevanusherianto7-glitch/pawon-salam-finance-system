# 📱 SUPER DETAIL SCREEN ANALYSIS: LOGIN SCREEN

**Screen Name:** Login Screen
**File Source:** `screens/LoginScreen.tsx`
**Role Access:** Public (Entry Point)

---

## 🎨 VISUAL SPECIFICATIONS (SUPER DETAIL)

### 1. **Background & Theme**
*   **Theme:** "Frosted Dawn" (Light Mode)
*   **Background:** Custom Pattern Component
    *   *Colors:* White/Cream with Orange accents
    *   *Style:* Light glassmorphism (`bg-white/40`)

### 2. **Login Card**
*   **Container:**
    *   Background: `bg-white/40` (Light Glass)
    *   Border: `border-white/20`
    *   Shadow: `shadow-xl`
    *   Corner Radius: `rounded-3xl`
*   **Logo:**
    *   Animation: Slide-in
    *   Icon: Emoji 🍽️ (Currently)
*   **Typography:**
    *   **Title:** "Pawon Salam" (`font-bold text-2xl text-gray-800`)
    *   **Subtitle:** "Sistem Manajemen Karyawan" (`text-sm text-gray-500`)

### 3. **Form Elements**
*   **Input Field:**
    *   Background: `bg-white/50`
    *   Border: `border-gray-200` (Focus: `border-orange-500`)
    *   Text: `text-gray-800`
    *   Placeholder: `text-gray-400`
*   **Primary Button:**
    *   Background: `bg-orange-500` (Gradient `from-orange-500`)
    *   Text: `text-white font-bold`
    *   Shadow: `shadow-lg shadow-orange-500/30`
    *   Hover: `hover:scale-[1.02]`

### 4. **Role Selection (Demo Mode)**
*   **Grid:** 2 Columns (Mobile-first)
*   **Role Button:**
    *   Background: `bg-white/60`
    *   Border: `border-white/40`
    *   Active State: `ring-2 ring-orange-500 bg-orange-50`
    *   **Icon:** Lucide React Icons (Zap, User, etc.)
    *   **Label:** `text-xs font-bold text-gray-700`

---

## 🔄 ROUTING LOGIC MAPPING

**Trigger:** User clicks "MASUK" button.
**Action:** `login(phone, password)` -> `useAuthStore` updates state.
**Handler:** `App.tsx` observes `isAuthenticated` and `user.role`.

| User Role | Target Screen ID | Destination File (`src/screens/...`) |
| :--- | :--- | :--- |
| **Super Admin** | `'adminDashboard'` | `admin/AdminDashboardScreen.tsx` |
| **Business Owner** | `'adminDashboard'` | `admin/AdminDashboardScreen.tsx` (Owner View) |
| **HR Manager** | `'adminDashboard'` | `admin/AdminDashboardScreen.tsx` (Manager View) |
| **Resto Manager** | `'adminDashboard'` | `admin/AdminDashboardScreen.tsx` (Manager View) |
| **Finance Manager** | `'adminDashboard'` | `admin/AdminDashboardScreen.tsx` (Manager View) |
| **Marketing Manager** | `'adminDashboard'` | `admin/AdminDashboardScreen.tsx` (Manager View) |
| **Employee (Staff)** | `'dashboard'` | `employee/EmployeeDashboardScreen.tsx` |

---

## ⚠️ CRITICAL OBSERVATIONS

1.  **Design Mismatch:** Current design is Light/Cream, while the approved design system is Dark/Purple Glassmorphism.
2.  **Hardcoded Data:** `DEMO_ROLES` array is hardcoded in the component.
3.  **Validation:** Phone validation is minimal.

---

## 📝 RECOMMENDATIONS

1.  **Align Design:** Decide whether to keep this Light theme or switch to the approved Dark Glassmorphism.
2.  **Type Safety:** Fix `any` types in role selection.
3.  **Refactor:** Move `DEMO_ROLES` to a config file or constants.
