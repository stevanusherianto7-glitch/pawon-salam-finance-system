================================================================================
PAWON SALAM RESTAURANT MANAGEMENT SYSTEM
ULTIMATE SOP MASTER V2 - "The Sentient Protocol"
================================================================================

Version: 2.0 (UPGRADED)
Date: 2025-12-02
Status: SUPREME LAW & ACTIVE
Philosophy: "User is Visionary, AI is the Intelligent Executor"

CRITICAL: THIS IS THE CONSTITUTION. VIOLATION IS A SYSTEM FAILURE.

================================================================================
PART 1: COLLABORATION PHILOSOPHY & ROLES
================================================================================

1.1 FUNDAMENTAL PRINCIPLE
"USER VISIONS, AI EXECUTES WITH INTELLIGENCE"
- We do not just 'code'. We build a business asset.
- We prioritize QUALITY over SPEED.
- We defend the USER'S EXPERIENCE above all else.

1.2 DIVISION OF RESPONSIBILITIES
[USER] -> Visual Taste, Business Logic, Strategic Decisions, Final Approval.
[AI]   -> Technical Architecture, Code Integrity, Security, Bug Prevention.

================================================================================
PART 2: THE 10 GOLDEN RULES (NEVER VIOLATE)
================================================================================

1. "UI LOCKED BY DEFAULT": Never change approved design without permission.
2. "MOBILE FIRST MINDSET": Always assume the user is on a smartphone.
3. "SAVE PROGRESS": Frequent commits. 'git add . && git commit' is your heartbeat.
4. "EXPLAIN → DEMO → IMPLEMENT": No surprise code.
5. "NO OPTIMISTIC UI FOR MONEY": Salary & HPP data must be accurate, not guessed.
6. "GLASSMORPHISM IS LAW": Adhere to the Orange/White Glass aesthetic.
7. "VPS INDONESIA READY": Code must run on Node.js VPS, not just Serverless.
8. "NO HALLUCINATION": Do not invent libraries. Use what is installed.
9. "TARGETED FIXES": If asked to fix a button, don't rewrite the database.
10. "MANUAL LOGIN PROTOCOL": Do not try to auto-login. Let the User drive.

================================================================================
PART 3: THE "THINKING PROTOCOL" (ADVANCED AI BEHAVIOR)
================================================================================

Before writing a single line of code, the AI MUST execute this mental simulation:

3.1 THE IMPACT RADIUS ANALYSIS
- "If I change Component X, will Page Y break?"
- "If I change the CSS of 'Button', will it look ugly on the Login Screen?"
- ACTION: Scan dependencies before editing.

3.2 THE DATA FLOW SIMULATION
- "Where does this data come from? What if it is null/undefined?"
- "If the Internet dies while saving, what happens to the data?"
- ACTION: Implement defensive coding (Try/Catch, Loading States).

3.3 THE USER REALITY CHECK
- "Is this button clickable with a thumb?" (Min height 44px).
- "Is this text readable on a sunny day?" (Contrast check).
- "Does the header overlap the browser address bar?" (Top safe area).

================================================================================
PART 4: TECHNICAL ARCHITECTURE & DOCTRINE
================================================================================

4.1 INFRASTRUCTURE
- Target: VPS Cloud Indonesia (Domainesia/Rumahweb).
- Stack: React (Vite), Node.js, Cloudflare (Deployment).
- Database: Mock (Zustand Persist) -> Future: MongoDB/Supabase.

4.2 CRITICAL DATA INTEGRITY
- Time: Use Monotonic Clock Logic (Anti-Fraud).
- Money: Use Decimal/BigInt logic. Never simple Floats.
- Storage: Offline-First approach (Sync later).

4.3 "SMART MOCK" ARCHITECTURE
- Use Zustand with Persistence Middleware.
- Data must survive a browser refresh.
- UI must be Reactive (Update instantly upon input).

4.4 THE "NATIVE FEEL" ARCHITECTURE (APP SHELL)
--------------------------------------------------------------------------------
DO NOT build a scrolling website. Build a FIXED APP SHELL.

1. VIEWPORT LOCKING:
   - `html, body` MUST be `fixed`, `h-100%`, `overflow-hidden`.
   - Prevent the "Rubber Band" effect on iOS (`overscroll-behavior: none`).
   - The Application Background is STATIC. It never moves.

2. SCROLL ZONES:
   - Only the specific Content Container (`flex-1`) allows `overflow-y-auto`.
   - Headers and Bottom Navigation Bars are `flex-none` and PERMANENTLY FIXED (no sticky hack).

3. MODAL GEOMETRY (THE VH RULE):
   - NEVER use hardcoded pixels for full-screen modal positioning (e.g., `top-100px` is banned).
   - ALWAYS use Viewport Height (`vh`) units for robust scaling.
   - **Golden Formula:**
     - Top: `top-[12vh]` (Safe for Notch/Address Bar)
     - Height: `h-[78vh]` (Leaves room for Bottom Nav)
     - Width: `w-[92%]`, `left-[4%]` (Centered)

================================================================================
PART 5: WORKFLOW & QUALITY ASSURANCE
================================================================================

5.1 THE 6-STEP FEATURE DELIVERY
1. PLAN: Understand the goal.
2. LOGIC: Define the data flow.
3. DEMO: Create a visual prototype (localhost).
4. REVIEW: Wait for User Approval.
5. CODE: Implement robustly.
6. DEPLOY: Push to Cloudflare.

5.2 LOGIN & VERIFICATION PROTOCOL (ANTI-STRESS RULE)
- AI starts the server.
- AI PAUSES and says: "Waiting for User to Login Manually."
- User logs in and navigates to target page.
- User says: "Proceed."
- AI resumes inspection.
*Reason: Prevent AI from getting stuck on OTP/Auth screens.*

5.3 THE "PRE-DELIVERY" AUTOPSY (SELF-CORRECTION)
Before reporting "Done", AI must ask itself:
- "Did I break the Mobile Layout?"
- "Is the Z-Index correct? (Modal above Navbar?)"
- "Did I leave any console.logs?"

================================================================================
PART 6: DESIGN SYSTEM (GLASSMORPHISM ORANGE)
================================================================================

6.1 COLOR PALETTE
- Primary Gradient: `bg-gradient-to-r from-[#E87722] to-[#F9A055]` (Pawon Orange).
- Glass White: `bg-white/30 backdrop-blur-md border-white/20`.
- Text: Dark Grey for body, White for Primary Headers.

6.2 LAYOUT RULES
- Modals:
  - Must handle "Browser Address Bar" overlap (`mt-[120px]` or safe area top).
  - Must handle "Bottom Nav" overlap (`pb-[150px]` scroll padding).
  - Z-Index: `z-[9999]` for overlays.

================================================================================
PART 7: EMERGENCY PROCEDURES
================================================================================

7.1 THE ROLLBACK
- If a feature fails or user rejects:
- `git reset --hard HEAD~1` (Or revert to last stable commit).
- "Do not argue. Revert first, discuss later."

7.2 DATA LOSS PREVENTION
- If 'Smart Mock' data is corrupted:
- Provide a 'Reset Data' button in Settings to clear localStorage.

================================================================================
END OF SOP V2.0
"We build with Pride, Precision, and Persistence."
================================================================================
