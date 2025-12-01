# 🗄️ DATABASE SCHEMA BLUEPRINT

**Project:** Pawon Salam Restaurant Management System
**Status:** Draft (Based on Frontend Types)
**Recommended DB:** PostgreSQL 15+

---

## 1. 👥 USER MANAGEMENT

### `employees`
Stores all user data (Staff, Managers, Owners, Admins).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Default: uuid_generate_v4() | Unique ID |
| `name` | VARCHAR(100) | NOT NULL | Full Name |
| `email` | VARCHAR(100) | UNIQUE, NULLABLE | Required for Managers/Admins |
| `phone` | VARCHAR(20) | UNIQUE, NOT NULL | Login Identifier |
| `pin` | VARCHAR(60) | NULLABLE | Hashed PIN for quick login |
| `password` | VARCHAR(255) | NULLABLE | Hashed Password (for Super Admin) |
| `role` | ENUM | NOT NULL | `EMPLOYEE`, `ADMIN`, `RESTAURANT_MANAGER`, etc. |
| `department` | VARCHAR(50) | NOT NULL | e.g., "Kitchen", "Service" |
| `area` | ENUM | NOT NULL | `FOH`, `BOH` |
| `avatar_url` | TEXT | NULLABLE | Profile Picture URL |
| `birth_date` | DATE | NULLABLE | For birthday notifications |
| `address` | TEXT | NULLABLE | Residential address |
| `join_date` | DATE | DEFAULT: CURRENT_DATE | Employment start date |
| `is_active` | BOOLEAN | DEFAULT: TRUE | Soft delete flag |
| `created_at` | TIMESTAMP | DEFAULT: NOW() | |
| `updated_at` | TIMESTAMP | DEFAULT: NOW() | |

---

## 2. 📅 ATTENDANCE & SHIFTS

### `attendance_logs`
Daily check-in/check-out records.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `employee_id` | UUID | FK -> employees.id | |
| `date` | DATE | NOT NULL | YYYY-MM-DD |
| `check_in_time` | TIMESTAMP | NOT NULL | |
| `check_out_time` | TIMESTAMP | NULLABLE | |
| `status` | ENUM | NOT NULL | `PRESENT`, `LATE`, `ABSENT`, `LEFT_EARLY` |
| `latitude` | DECIMAL(10,8) | NOT NULL | GPS Lat |
| `longitude` | DECIMAL(11,8) | NOT NULL | GPS Long |
| `photo_in_url` | TEXT | NULLABLE | Selfie URL |
| `notes` | TEXT | NULLABLE | Employee notes |
| `correction_note` | TEXT | NULLABLE | Manager correction reason |

### `shifts`
Daily shift assignments.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `employee_id` | UUID | FK -> employees.id | |
| `date` | DATE | NOT NULL | |
| `type` | ENUM | NOT NULL | `OFF`, `MORNING`, `MIDDLE` |
| `start_time` | TIME | NOT NULL | HH:mm |
| `end_time` | TIME | NOT NULL | HH:mm |
| `color` | VARCHAR(7) | NOT NULL | Hex Color Code |
| `is_published` | BOOLEAN | DEFAULT: FALSE | Visible to employee? |
| `created_by` | UUID | FK -> employees.id | Manager who created |

### `leave_requests`
Time off applications.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `employee_id` | UUID | FK -> employees.id | |
| `type` | ENUM | NOT NULL | `SICK`, `ANNUAL`, `OTHER` |
| `start_date` | DATE | NOT NULL | |
| `end_date` | DATE | NOT NULL | |
| `reason` | TEXT | NOT NULL | |
| `status` | ENUM | DEFAULT: 'PENDING' | `PENDING`, `APPROVED`, `REJECTED` |
| `approved_by` | UUID | FK -> employees.id, NULLABLE | |
| `rejection_reason` | TEXT | NULLABLE | |

---

## 3. 📊 PERFORMANCE & TASKS

### `daily_performance_snapshots`
Aggregated daily score for gamification.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `employee_id` | UUID | FK -> employees.id | |
| `attendance_log_id` | UUID | FK -> attendance_logs.id | Link to attendance |
| `date` | DATE | NOT NULL | |
| `area` | ENUM | NOT NULL | FOH/BOH |
| `punctuality_score` | DECIMAL(3,2) | DEFAULT: 0.00 | 0.00 - 5.00 |
| `checklist_score_avg` | DECIMAL(3,2) | DEFAULT: 0.00 | From jobdesk/checklist |
| `status` | ENUM | DEFAULT: 'AUTO' | `AUTO_GENERATED`, `REVIEWED`, `FINALIZED` |
| `summary_comment` | TEXT | NULLABLE | Auto-generated summary |

### `jobdesk_submissions`
Daily task completion records.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `employee_id` | UUID | FK -> employees.id | |
| `date` | DATE | NOT NULL | |
| `area` | ENUM | NOT NULL | |
| `completed_task_ids` | JSONB | DEFAULT: [] | Array of Task IDs |
| `manager_note` | TEXT | NULLABLE | Feedback from manager |
| `last_updated` | TIMESTAMP | DEFAULT: NOW() | |

### `performance_reviews`
Monthly KPI reviews.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `employee_id` | UUID | FK -> employees.id | |
| `reviewer_id` | UUID | FK -> employees.id | |
| `period_month` | INT | NOT NULL | 1-12 |
| `period_year` | INT | NOT NULL | 2025, etc. |
| `scores` | JSONB | NOT NULL | Key-Value pairs of scores |
| `notes` | JSONB | NULLABLE | Key-Value pairs of notes |
| `overall_score` | DECIMAL(3,2) | NOT NULL | Final calculated score |
| `is_finalized` | BOOLEAN | DEFAULT: FALSE | |

---

## 4. 💰 PAYROLL

### `payslips`
Monthly salary records.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `employee_id` | UUID | FK -> employees.id | |
| `period_month` | INT | NOT NULL | |
| `period_year` | INT | NOT NULL | |
| `pay_date` | DATE | NOT NULL | |
| `basic_salary` | DECIMAL(12,2) | NOT NULL | |
| `allowances` | JSONB | DEFAULT: {} | Meal, Transport, etc. |
| `deductions` | JSONB | DEFAULT: {} | BPJS, Tax, Kasbon |
| `overtime_amount` | DECIMAL(12,2) | DEFAULT: 0 | |
| `bonus` | DECIMAL(12,2) | DEFAULT: 0 | |
| `net_salary` | DECIMAL(12,2) | NOT NULL | Final take home pay |
| `status` | ENUM | DEFAULT: 'DRAFT' | `DRAFT`, `SENT`, `PAID` |
| `is_visible` | BOOLEAN | DEFAULT: FALSE | Visible to employee? |

---

## 5. ⚙️ SYSTEM & UTILS

### `audit_logs`
Security and activity tracking.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `action` | VARCHAR(50) | NOT NULL | e.g., `LOGIN`, `UPDATE_SALARY` |
| `performed_by` | UUID | FK -> employees.id | |
| `impersonating_user` | UUID | NULLABLE | If performed via impersonation |
| `target_entity` | VARCHAR(100) | NULLABLE | ID of object affected |
| `details` | JSONB | NULLABLE | Diff or details |
| `timestamp` | TIMESTAMP | DEFAULT: NOW() | |

### `messages`
Internal announcements/notifications.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `sender_id` | UUID | FK -> employees.id | |
| `content` | TEXT | NOT NULL | |
| `audience` | ENUM | NOT NULL | `ALL_STAFF`, `MANAGERS`, `OWNER` |
| `read_by` | JSONB | DEFAULT: [] | Array of User IDs who read it |
| `created_at` | TIMESTAMP | DEFAULT: NOW() | |

### `system_settings`
Global app configuration.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `key` | VARCHAR(50) | PK | e.g., `office_lat`, `max_distance` |
| `value` | TEXT | NOT NULL | JSON stringified value |
| `label` | VARCHAR(100) | NOT NULL | UI Label |
| `description` | TEXT | NULLABLE | |

---

## 6. 📦 INVENTORY & MENU MANAGEMENT

### `inventory_items`
Raw materials and stock items.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `name` | VARCHAR(100) | NOT NULL | e.g., "Beras", "Ayam Fillet" |
| `unit` | VARCHAR(20) | NOT NULL | e.g., "kg", "liter", "pcs" |
| `current_stock` | DECIMAL(10,2) | DEFAULT: 0 | |
| `min_stock_alert` | DECIMAL(10,2) | DEFAULT: 5 | Low stock threshold |
| `cost_per_unit` | DECIMAL(12,2) | NOT NULL | Last purchase price |
| `updated_at` | TIMESTAMP | DEFAULT: NOW() | |

### `stock_movements`
Track every stock change (In/Out).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `inventory_item_id` | UUID | FK -> inventory_items.id | |
| `type` | ENUM | NOT NULL | `PURCHASE`, `USAGE`, `WASTE`, `ADJUSTMENT` |
| `quantity` | DECIMAL(10,2) | NOT NULL | Positive for IN, Negative for OUT |
| `notes` | TEXT | NULLABLE | Reason/Supplier name |
| `performed_by` | UUID | FK -> employees.id | |
| `created_at` | TIMESTAMP | DEFAULT: NOW() | |

### `menu_categories`
Food/Drink categories.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `name` | VARCHAR(50) | NOT NULL | e.g., "Makanan Utama", "Minuman" |
| `is_active` | BOOLEAN | DEFAULT: TRUE | |

### `menu_items`
Sellable products.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `category_id` | UUID | FK -> menu_categories.id | |
| `name` | VARCHAR(100) | NOT NULL | e.g., "Nasi Goreng Spesial" |
| `price` | DECIMAL(12,2) | NOT NULL | Selling price |
| `description` | TEXT | NULLABLE | |
| `image_url` | TEXT | NULLABLE | |
| `is_available` | BOOLEAN | DEFAULT: TRUE | Toggle for sold out |

---

## 7. 🛒 POS & ORDERS

### `tables`
Restaurant tables.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `number` | VARCHAR(10) | NOT NULL | e.g., "T1", "T2", "VIP1" |
| `capacity` | INT | DEFAULT: 4 | |
| `status` | ENUM | DEFAULT: 'AVAILABLE' | `AVAILABLE`, `OCCUPIED`, `RESERVED` |

### `orders`
Customer orders.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `table_id` | UUID | FK -> tables.id, NULLABLE | Nullable for Take Away |
| `waiter_id` | UUID | FK -> employees.id | Who took the order |
| `customer_name` | VARCHAR(50) | NULLABLE | |
| `status` | ENUM | DEFAULT: 'PENDING' | `PENDING`, `COOKING`, `SERVED`, `PAID`, `CANCELLED` |
| `total_amount` | DECIMAL(12,2) | DEFAULT: 0 | |
| `payment_method` | ENUM | NULLABLE | `CASH`, `QRIS`, `DEBIT` |
| `created_at` | TIMESTAMP | DEFAULT: NOW() | |

### `order_items`
Items within an order.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `order_id` | UUID | FK -> orders.id | |
| `menu_item_id` | UUID | FK -> menu_items.id | |
| `quantity` | INT | DEFAULT: 1 | |
| `price_at_time` | DECIMAL(12,2) | NOT NULL | Price when ordered |
| `notes` | VARCHAR(100) | NULLABLE | e.g., "Pedas", "Tanpa Bawang" |
| `status` | ENUM | DEFAULT: 'QUEUED' | `QUEUED`, `COOKING`, `DONE` |

---

## 8. 📅 RESERVATIONS

### `reservations`
Table bookings.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `customer_name` | VARCHAR(100) | NOT NULL | |
| `customer_phone` | VARCHAR(20) | NOT NULL | |
| `table_id` | UUID | FK -> tables.id, NULLABLE | Assigned table |
| `reservation_time` | TIMESTAMP | NOT NULL | |
| `pax` | INT | NOT NULL | Number of people |
| `status` | ENUM | DEFAULT: 'PENDING' | `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED` |
| `notes` | TEXT | NULLABLE | Special requests |
| `created_at` | TIMESTAMP | DEFAULT: NOW() | |

---

## 9. 💎 LOYALTY PROGRAM

### `loyalty_members`
Registered customers.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `phone` | VARCHAR(20) | UNIQUE, NOT NULL | Primary ID |
| `name` | VARCHAR(100) | NOT NULL | |
| `current_points` | INT | DEFAULT: 0 | |
| `tier` | ENUM | DEFAULT: 'SILVER' | `SILVER`, `GOLD`, `PLATINUM` |
| `join_date` | DATE | DEFAULT: CURRENT_DATE | |

### `loyalty_transactions`
Points history.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `member_id` | UUID | FK -> loyalty_members.id | |
| `type` | ENUM | NOT NULL | `EARN`, `REDEEM` |
| `points` | INT | NOT NULL | Positive value |
| `order_id` | UUID | FK -> orders.id, NULLABLE | Source of points |
| `description` | VARCHAR(255) | NOT NULL | e.g., "Order #123", "Redeem Voucher" |
| `created_at` | TIMESTAMP | DEFAULT: NOW() | |

### `loyalty_rewards`
Redeemable items.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `name` | VARCHAR(100) | NOT NULL | e.g., "Free Ice Tea" |
| `points_cost` | INT | NOT NULL | |
| `description` | TEXT | NULLABLE | |
| `is_active` | BOOLEAN | DEFAULT: TRUE | |

---

## 10. 🍳 KITCHEN DISPLAY SYSTEM (KDS)

### `kitchen_stations`
Preparation areas (e.g., Bar, Grill, Salad).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `name` | VARCHAR(50) | NOT NULL | |
| `printer_ip` | VARCHAR(20) | NULLABLE | For physical tickets |

*(Note: Add `station_id` FK to `menu_items` table to route orders correctly)*

### `kds_logs`
Tracking cooking times.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `order_item_id` | UUID | FK -> order_items.id | |
| `station_id` | UUID | FK -> kitchen_stations.id | |
| `started_at` | TIMESTAMP | NULLABLE | When cook started |
| `completed_at` | TIMESTAMP | NULLABLE | When bumped/done |
| `duration_seconds` | INT | NULLABLE | Auto-calculated |

---

## 11. 📱 QR MENU & SELF ORDER

### `qr_sessions`
Active customer sessions.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK | |
| `table_id` | UUID | FK -> tables.id | |
| `token` | VARCHAR(100) | UNIQUE, NOT NULL | Session token |
| `start_time` | TIMESTAMP | DEFAULT: NOW() | |
| `end_time` | TIMESTAMP | NULLABLE | |
| `status` | ENUM | DEFAULT: 'ACTIVE' | `ACTIVE`, `CLOSED` |

---

## 🔗 RELATIONSHIPS SUMMARY

*   **One-to-Many:** Employee -> AttendanceLogs
*   **One-to-Many:** Employee -> Shifts
*   **One-to-Many:** Employee -> Payslips
*   **One-to-Many:** Employee -> LeaveRequests
*   **One-to-One:** AttendanceLog -> DailyPerformanceSnapshot (Ideally)
