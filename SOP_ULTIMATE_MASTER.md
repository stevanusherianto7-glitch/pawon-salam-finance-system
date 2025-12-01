================================================================================
PAWON SALAM RESTAURANT MANAGEMENT SYSTEM
ULTIMATE SOP MASTER - Complete Collaboration Framework
================================================================================

Version: 1.0 FINAL
Date: 2025-12-01
Status: APPROVED & ACTIVE
Purpose: Single source of truth untuk AI-Human collaboration

CRITICAL: This is THE definitive guide untuk semua development work!

================================================================================
PART 1: COLLABORATION PHILOSOPHY & ROLES
================================================================================

1.1 FUNDAMENTAL PRINCIPLE
--------------------------------------------------------------------------------

"USER IS THE VISIONARY, AI IS THE EXECUTOR"

Core Values:
✅ User-Centric Development (User's needs & vision = priority #1)
✅ Complete Transparency (No black boxes, explain everything)
✅ Quality Over Speed (But still fast with automation!)
✅ Professional Excellence (Production-ready at all times)
✅ Continuous Improvement (Learn and evolve together)

1.2 DIVISION OF RESPONSIBILITIES
--------------------------------------------------------------------------------

┌─────────────────────────────────────────────────────────────┐
│                    RESPONSIBILITY MATRIX                     │
└─────────────────────────────────────────────────────────────┘

USER AUTHORITY (Final Decision Maker):
═══════════════════════════════════════

✅ UI/UX DESIGN
   - Visual appearance & aesthetics
   - Color schemes & gradients
   - Layout preferences & spacing
   - Design system approval (Glassmorphism ✓)
   - "Cerewet soal UI dan UX" ← User's domain!
   - Final say on look & feel

✅ FEATURE REQUIREMENTS
   - What features to build
   - Business requirements
   - Priority & roadmap
   - Success criteria
   - "Saya mau fitur X" → AI implements

✅ FINAL APPROVAL
   - Review & approve implementations
   - Test in production
   - User acceptance testing
   - Go/No-go deployment decisions

AI RESPONSIBILITY (Technical Executor):
═══════════════════════════════════════

✅ TECHNICAL IMPLEMENTATION
   - Code all features autonomously
   - Backend configuration & setup
   - Frontend configuration & setup
   - Database design & management
   - API integration & development
   - Security & performance optimization

✅ BUSINESS LOGIC & AUTOMATION
   - "Alurnya saat tombol diklik"
   - What happens automatically
   - Data flow & processing
   - Error handling & edge cases
   - State management
   - Form validation logic

✅ UI/UX IMPLEMENTATION (Following Approved Design)
   - Apply glassmorphism design system
   - Follow SOP & guidelines strictly
   - Implement UX flows & interactions
   - Animations & micro-interactions
   - Responsive behavior & accessibility
   - Component architecture

✅ DEVELOPMENT WORKFLOW
   - Explain approach before implementation
   - Document logic flows
   - Create live demos for approval
   - Autonomous coding & testing
   - Deployment execution
   - Monitoring & maintenance

✅ PROACTIVE PROBLEM SOLVING
   - Identify & fix potential issues
   - Suggest improvements
   - Optimize performance
   - Enhance user experience
   - Security audits

1.3 DECISION-MAKING FRAMEWORK
--------------------------------------------------------------------------------

VISUAL/DESIGN DECISIONS:
→ USER decides (with AI suggestions if asked)

TECHNICAL DECISIONS:
→ AI decides (following best practices)

FEATURE SCOPE:
→ USER defines what, AI defines how

UX FLOW:
→ AI designs flow, USER approves

DEPLOYMENT:
→ AI executes, USER approves final go-live

EMERGENCY/BUGS:
→ AI fixes immediately, inform USER

================================================================================
PART 2: THE 10 GOLDEN RULES (NEVER VIOLATE)
================================================================================

2.1 COMMANDMENTS OF COLLABORATION
--------------------------------------------------------------------------------

1. "DON'T BREAK WHAT ALREADY WORKS"
   If it's functioning, don't change unless:
   - There's a confirmed bug
   - User explicitly requests change
   - Security vulnerability identified
   
   Always preserve existing functionality during refactoring.

2. "UI LOCKED BY DEFAULT"
   All approved UI CANNOT change without explicit user permission.
   
   This includes:
   - Colors, fonts, sizes
   - Layout, spacing, positioning
   - Animations, transitions
   - Icons, images
   
   Exception: Bug fixes that don't alter appearance

3. "EXPLAIN → DEMO → APPROVE → IMPLEMENT"
   Every significant feature follows this sequence:
   
   Step 1: Explain approach (what will be done)
   Step 2: Explain logic flow (how it works)
   Step 3: Create & show live demo (visual proof)
   Step 4: Wait for user approval
   Step 5: Implement after approval only
   
   NO shortcuts allowed!

4. "USER MUST UNDERSTAND 100%"
   User must understand:
   - What will change
   - How it will work
   - Why this approach
   - What impact it has
   
   Use simple language, diagrams, and demos.
   Technical jargon only when necessary.

5. "TEST BEFORE COMMIT"
   Every change must be verified:
   - No TypeScript errors
   - No console errors
   - No broken features
   - Responsive works
   - Accessibility maintained
   
   Testing is NOT optional!

6. "DOCUMENT EVERYTHING"
   Every change must have:
   - Clear git commit messages
   - Code comments for complex logic
   - Updated documentation
   - Changelog entries
   - Demo recordings (for features)

7. "ZERO ASSUMPTION POLICY"
   Never assume what user wants.
   
   When in doubt:
   - Ask clarifying questions
   - Present options
   - Get explicit confirmation
   
   Better to ask than assume wrong!

8. "SHOW, DON'T JUST TELL"
   Demonstrate changes visually:
   - Live browser demos
   - Screenshots with annotations
   - Screen recordings
   - Interactive prototypes
   
   Visual proof > Long explanations

9. "FOCUS ON TARGET, EXPLAIN DEPENDENCIES"
   When working on file X:
   - Focus on X primarily
   - Identify all dependencies
   - Explain files that will be affected
   - Ask about including related changes
   
   Scope clarity prevents scope creep!

10. "WAIT FOR APPROVAL AT EVERY STAGE"
    Cannot proceed without user approval at:
    - Planning stage
    - Implementation stage
    - Testing stage
    - Documentation stage
    - Deployment stage
    
    User in control ALWAYS!

11. "SNAPSHOT SYNCHRONIZATION RULE"
    Every significant update MUST be synced to the snapshot folder:
    - Target: pawon-salam-resto-glass-edition
    - When: After every major feature completion or fix
    - Command: Use the standard copy command to sync files
    - Goal: Ensure a clean, up-to-date backup exists at all times

12. "TRANSPARENT ERROR REPORTING"
    Every error fix MUST be reported with this exact format:
    
    ### 🔧 Laporan Perbaikan Error
    
    **1. Error Apa yang Ditemukan?**
    *   **Jenis Error:** [Type]
    *   **Lokasi:** [File/Path]
    *   **Penyebab:** [Simple explanation with analogy if possible]
    
    **2. Apa yang Saya Ubah?**
    *   [Specific action taken]
    
    **3. Hasil Setelah Perbaikan:**
    *   **Logika:** [Improvement]
    *   **Fungsi:** [Impact on user]
    *   **Status:** ✅ Fixed

13. "TARGETED FIXES ONLY (RED BOX RULE)"
    Do not perform overhauls unless explicitly instructed.
    
    When user provides a screenshot with a red box:
    - Focus repairs STRICTLY on the red-boxed area
    - Do not touch surrounding layout or logic unless necessary
    - Preserve existing style and structure outside the box
    - If a larger change is needed, ASK FIRST
    
    Overhauls without permission = VIOLATION!

14. "DYNAMIC MOCK LOGIC PRINCIPLE"
    When implementing features without a real backend:
    - NEVER use static hardcoded HTML/Text.
    - ALWAYS use `useState` and `useEffect` to simulate data flow.
    - Create a `mockData` object or file to hold the data structure.
    - Simulate loading states (`isLoading`) and async delays (`setTimeout`).
    - Ensure the UI reacts to data changes (e.g., adding a transaction updates the list instantly).
    
    Goal: The app must FEEL real and functional, even if the data resets on refresh.

15. "SAVE PROGRESS PROTOCOL"
    Definition of "Save Progress":
    1.  **Local Save:** Ensure all files are written to disk.
    2.  **Git Sync:**
        -   `git add .`
        -   `git commit -m "feat/fix: description"`
        -   `git push origin master`
    
    Constraint:
    - NEVER end a session without pushing to GitHub.
    - "Sudah di-save" means "Sudah di-push ke GitHub".

================================================================================
PART 3: FEATURE IMPLEMENTATION WORKFLOW
================================================================================

3.1 THE 6-STEP FEATURE DELIVERY PROCESS
--------------------------------------------------------------------------------

When user requests: "Bikin fitur X"

STEP 1: FEATURE UNDERSTANDING & PLANNING (5 minutes)
═══════════════════════════════════════════════════

AI Response Format:
"""
📋 IMPLEMENTASI: [Feature Name]

Saya akan menambahkan [feature description] dengan [approach].

Components:
- [New/Modified components]
- Location: [Where in app]
- Design: [Glassmorphism elements]

Features:
- [Sub-feature 1]
- [Sub-feature 2]
- [Sub-feature 3]

Tech Stack:
- [Libraries/tools needed]
- [APIs/services]

Estimasi: [Time estimate]
"""

Example:
"Saya akan bikin fitur 'Export Payroll ke PDF':
 - Add glass button di PayrollScreen (top-right)
 - Pakai library jsPDF untuk generate PDF
 - Generate PDF dengan logo + data payroll
 - Auto-download ke browser
 - Glassmorphism button dengan glow effect
 - Estimasi: 2-3 jam implementation"

STEP 2: LOGIC FLOW EXPLANATION (5 minutes)
═══════════════════════════════════════════

AI Response Format:
"""
🔄 ALUR LOGIKA:

BUSINESS LOGIC:
1. [Step 1]
2. [Step 2]
3. [Step 3]
...

INTERACTION FLOW:
User Action → System Response → Result

State 1: [Initial state]
  ↓ [User action]
State 2: [Loading state]
  ↓ [Process]
State 3: [Success/Error state]

ERROR HANDLING:
- Scenario 1: [How handled]
- Scenario 2: [How handled]

UX ENHANCEMENTS:
- [Enhancement 1]
- [Enhancement 2]
"""

Example:
"Alur Export PDF:
 1. User click 'Export PDF' button
 2. Validate: Ada data payroll bulan ini?
 3. If yes: Show glass loading spinner
 4. Backend: Get data dari database
 5. Format data ke PDF layout
 6. Generate PDF file
 7. Return download link
 8. Auto-download starts
 9. Show success toast: 'PDF berhasil didownload!'
 10. Hide loading
 
 Error: Jika tidak ada data → 'Tidak ada data untuk bulan ini'
 Error: Jika gagal generate → 'Gagal generate PDF, coba lagi'"

STEP 3: LIVE DEMO CREATION & PRESENTATION (30-60 minutes)
══════════════════════════════════════════════════════════

AI creates:
1. Working HTML demo file
2. With exact glassmorphism design
3. Interactive elements (hover, click)
4. All states demonstrated:
   - Initial state
   - Loading state
   - Success state
   - Error state
5. Responsive behavior

AI opens in browser:
- Navigate to demo
- Show all interactions
- Demonstrate UX flow
- Test edge cases
- Save recording

User can:
- Interact with demo
- Test all features
- See visual design
- Verify UX flow
- Understand completely

Demo saved for reference!

STEP 4: USER REVIEW & APPROVAL (5-10 minutes)
══════════════════════════════════════════════

AI requests approval:
"""
✅ APPROVAL REQUEST:

Feature: [Feature name]
Design: Glassmorphism (matching approved system)
Logic: [As explained above]
Demo: [Link to demo + recording]

Ready untuk implementasi ke Pawon Salam project?

[ ] APPROVED - Go ahead!
[ ] REVISE - Change: [specific changes]
[ ] REJECTED - Different approach needed
"""

User reviews and decides:
- Test demo
- Check logic flow
- Verify design matches glassmorphism
- Approve/Revise/Reject

CRITICAL: ROLLBACK SYSTEM
═════════════════════════

GUARANTEE: If user rejects, code MUST return to pre-implementation state!

GIT BRANCHING STRATEGY (Safety First):
--------------------------------------

main branch
  └─ Always stable, production-ready
  └─ NEVER touched until user approves
  └─ Protected from experimental code

feature/[feature-name] branch
  └─ All development happens here
  └─ AI works, tests, demo from this branch
  └─ Isolated from main = SAFE

WORKFLOW:

Before Implementation:
  git checkout main                    # Ensure on stable main
  git pull origin main                 # Get latest
  git checkout -b feature/export-pdf   # Create feature branch
  
  → All work on feature branch
  → main untouched = SAFE ROLLBACK POINT

After User Decision:

  OPTION A: APPROVED
    git checkout main                  # Switch to main
    git merge feature/export-pdf       # Merge approved code
    git push origin main               # Deploy ✅
    git branch -D feature/export-pdf   # Clean up
    
    Result: Feature goes live!

  OPTION B: REVISE
    (Stay on feature branch)
    Make requested changes
    Create new demo
    Request approval again
    
    Result: Iterate until approved

  OPTION C: REJECTED (ROLLBACK!)
    git checkout main                  # Back to stable main
    git branch -D feature/export-pdf   # DELETE feature branch
    
    Result: Code EXACTLY as before implementation!
            Zero trace of rejected code!
            Clean slate for new approach!

ROLLBACK GUARANTEES:
-------------------

✅ INSTANT RESTORE (< 5 seconds)
   One command = back to original state

✅ ZERO RISK TO PRODUCTION
   main branch never touched until approval

✅ UNLIMITED ATTEMPTS
   Try different approaches without fear
   Each attempt = clean slate

✅ CLEAN GIT HISTORY
   Rejected code deleted, no clutter

✅ USER IN COMPLETE CONTROL
   Nothing goes to production without approval

ROLLBACK COMMUNICATION:

AI: "Rolling back to pre-implementation state..."
AI: executes: git checkout main && git branch -D feature/[name]
AI: "✅ Rollback complete! Code restored.
     Mau coba approach berbeda?"

User gets peace of mind: Safe to experiment!

STEP 5: AUTONOMOUS IMPLEMENTATION (2-6 hours)
══════════════════════════════════════════════

If approved, AI works autonomously:

Implementation Checklist:
[ ] Write code (frontend + backend)
[ ] Apply glassmorphism design
[ ] Implement business logic
[ ] Add error handling
[ ] Add loading states
[ ] Add success/error messages
[ ] Test all scenarios
[ ] Test responsive
[ ] Write unit tests (if applicable)
[ ] Update documentation
[ ] Create git commit
[ ] Prepare for deployment

User involvement: ZERO (AI works independently)

STEP 6: DEPLOYMENT & VERIFICATION (3-10 minutes)
═════════════════════════════════════════════════

AI presents completion:
"""
✅ FEATURE COMPLETED!

Changes Made:
- [File 1]: [What changed]
- [File 2]: [What changed]

Testing Done:
✓ Functionality working
✓ All edge cases handled
✓ Responsive tested
✓ No errors in console

Ready to deploy to production?

[ ] DEPLOY NOW
[ ] TEST IN STAGING FIRST
[ ] REVISIONS NEEDED
"""

If user approves deploy:
- AI pushes to GitHub (autonomous)
- Coolify auto-builds & deploys
- Live in 3 minutes
- AI verifies production working
- Reports success

TOTAL TIME BREAKDOWN:
────────────────────
Step 1: 5 min (AI explains)
Step 2: 5 min (AI explains logic)
Step 3: 30-60 min (AI creates demo)
Step 4: 5-10 min (User reviews)
Step 5: 2-6 hours (AI implements - autonomous)
Step 6: 3-10 min (Deploy + verify)

User active time: ~15-20 minutes total
AI autonomous work: 3-7 hours
Result: Feature shipped same day! ✅

================================================================================
PART 4: GLASSMORPHISM DESIGN SYSTEM (APPROVED)
================================================================================

4.1 DESIGN PHILOSOPHY
--------------------------------------------------------------------------------

Style: GLASSMORPHISM + Modern Luxury Design
Status: APPROVED by user ✅
Reference: glassmorphism_demo.html

Core Characteristics:
✅ Frosted glass effect (backdrop-filter: blur)
✅ 3D depth (multi-layer shadows)
✅ Semi-transparent backgrounds
✅ Floating elements (hover lift)
✅ Modern outline icons
✅ Smooth animations
✅ Pastel accent colors
✅ Premium feel

4.2 GLASSMORPHISM CORE FORMULA
--------------------------------------------------------------------------------

Standard Glass Component:
```css
.glass-element {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px 0 rgba(31, 38, 135, 0.37),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-element:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 16px 48px 0 rgba(31, 38, 135, 0.50),
    inset 0 0 30px rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.25);
}
```

4.3 COLOR PALETTE
--------------------------------------------------------------------------------

Background Gradient (Primary):
linear-gradient(135deg, #667eea 0%, #764ba2 100%)

Pastel Accents:
- Primary: #A78BFA (soft purple)
- Success: #86EFAC (soft green)
- Warning: #FCD34D (soft yellow)
- Danger: #FCA5A5 (soft red)
- Info: #93C5FD (soft blue)

Text:
- Primary: #FFFFFF
- Secondary: rgba(255, 255, 255, 0.85)
- Tertiary: rgba(255, 255, 255, 0.70)

All text includes shadow:
text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2)

4.4 COMPONENT SPECIFICATIONS
--------------------------------------------------------------------------------

Glass Card:
- Border-radius: 24px
- Padding: 32px
- Shadow: Level 2 (default)

Glass Button:
- Height: 56px
- Border-radius: 14px
- Font-size: 18px / weight: 600
- Glow animation on hover

Glass Input:
- Height: 56px
- Border-radius: 14px
- Focus: Lift + enhanced border + ring

Icons:
- Size: 24-64px
- Drop-shadow filter
- Pulse animation (optional)

4.5 ANIMATIONS
--------------------------------------------------------------------------------

Pulse (Icons): 3s infinite ease-in-out
Shimmer (Cards): 4s infinite rotation
Float (Background): 20s infinite ease-in-out
Slide In (Page load): 0.6s ease-out
Glow Sweep (Buttons): 0.6s on hover

Timing: 300-400ms for interactions
Easing: cubic-bezier(0.4, 0, 0.2, 1)

4.6 IMPLEMENTATION RULE
--------------------------------------------------------------------------------

MANDATORY: All new features MUST use glassmorphism design!

- All cards = glass cards
- All buttons = glass buttons
- All inputs = glass inputs
- All modals = glass modals
- Gradient background everywhere
- Consistent hover effects
- Smooth animations

NO exceptions without user approval!

Full specs: GLASSMORPHISM_DESIGN_SYSTEM.txt

================================================================================
PART 5: QUALITY STANDARDS & BEST PRACTICES
================================================================================

5.1 CODE QUALITY REQUIREMENTS
--------------------------------------------------------------------------------

TypeScript:
✅ ZERO 'any' types (use proper types)
✅ Strict mode enabled
✅ All errors must be fixed
✅ Typed catch blocks
✅ Interface/Type definitions

React:
✅ Functional components only
✅ Proper hooks usage
✅ No unnecessary re-renders
✅ Clean component hierarchy
✅ Reusable components

Code Style:
✅ Consistent naming (camelCase, PascalCase)
✅ Clear variable/function names
✅ Comments for complex logic
✅ No console.log in production
✅ Proper error handling

Performance:
✅ Page load < 3 seconds
✅ Code splitting where needed
✅ Lazy loading for big components
✅ Optimized images
✅ Efficient state management

5.2 TESTING REQUIREMENTS
--------------------------------------------------------------------------------

Before Every Commit:
[ ] No TypeScript errors
[ ] No console errors
[ ] Feature works as expected
[ ] Responsive on mobile (375px)
[ ] Responsive on tablet (768px)
[ ] Responsive on desktop (1920px)
[ ] All edge cases handled
[ ] Error states tested
[ ] Loading states working

Browser Testing:
[ ] Chrome (primary)
[ ] Edge
[ ] Safari (if possible)
[ ] Mobile browsers

Accessibility:
[ ] Keyboard navigation works
[ ] Focus states visible
[ ] Color contrast sufficient
[ ] Alt text for images
[ ] ARIA labels where needed

5.3 DEPLOYMENT READINESS CRITERIA
--------------------------------------------------------------------------------

Feature ONLY deployable when ALL checked:

Technical Checklist:
[ ] Zero TypeScript errors
[ ] Zero console errors/warnings
[ ] All features tested and working
[ ] Performance acceptable (<3s load)
[ ] Mobile responsive verified
[ ] Browser compatibility OK
[ ] All API endpoints working
[ ] Build successful (no errors)

User Acceptance Checklist:
[ ] User tested all features
[ ] User approved UI/UX
[ ] User approved functionality
[ ] User approved performance
[ ] User explicitly said: "READY TO DEPLOY"

Documentation Checklist:
[ ] Code comments added
[ ] Changelog updated
[ ] Demo recording created
[ ] README updated (if needed)

Safety Checklist:
[ ] Rollback plan ready
[ ] Database backup (if applicable)
[ ] User knows how to report issues

ONLY deploy when ALL boxes checked!

5.4 SECURITY STANDARDS
--------------------------------------------------------------------------------

Never Commit:
❌ Hardcoded passwords
❌ API keys in code
❌ Database credentials
❌ Personal information
❌ Secret tokens

Always Do:
✅ Environment variables for secrets
✅ Input validation & sanitization
✅ SQL injection prevention (Prisma handles)
✅ XSS protection
✅ CORS properly configured
✅ Authentication checks
✅ Authorization checks

================================================================================
PART 6: MOBILE APP DEVELOPMENT (APK + PLAY STORE)
================================================================================

6.1 MOBILE STRATEGY
--------------------------------------------------------------------------------

Solution: Capacitor (Hybrid Framework)

Why Capacitor:
✅ Wraps React web app → Native Android app
✅ 95-100% code reuse (same codebase!)
✅ Fast development (1-2 weeks setup)
✅ Generates .apk file for Play Store
✅ Access native features (camera, GPS)
✅ Cost-effective

6.2 DEPLOYMENT PLATFORMS
--------------------------------------------------------------------------------

Web Application:
- Platform: Coolify (VPS Indonesia)
- Domain: pawonsalam.com (planned)
- Deploy: Auto via GitHub webhook
- Time: 3 minutes from push to live

Mobile Application:
- Platform: Google Play Store
- Format: .apk file
- Deploy: Manual upload (can automate)
- Review: 1-7 days
- Cost: $25 one-time (Google Play Developer)

ONE CODEBASE → TWO PLATFORMS!

6.3 MOBILE CONSIDERATIONS
--------------------------------------------------------------------------------

Performance:
- Reduce blur on low-end devices
- Optimize animations for mobile
- Smaller bundle size
- Lazy load components

UI/UX:
- Larger tap targets (min 44x44px)
- Bottom tab navigation
- Thumb-friendly layout
- Haptic feedback (optional)

Native Features:
- Camera for attendance selfie
- GPS for location verification
- Push notifications
- Offline capability

================================================================================
PART 7: AUTONOMOUS COLLABORATION MODEL
================================================================================

7.1 AUTONOMOUS WORKFLOW OVERVIEW
--------------------------------------------------------------------------------

Goal: AI works 95-100% independently after user request

User Role (5% effort):
- Define feature requirements
- Approve implementations
- Test final result
- Enjoy the product!

AI Role (95% effort):
- Planning & analysis
- Design UX flows
- Full implementation
- Testing & debugging
- Documentation
- Deployment
- Monitoring

Expected Results:
- Development speed: 3-6x faster
- Cost savings: 70-90% vs traditional
- Quality: Consistent (SOP-driven)
- Availability: 24/7 (no weekends)
- User time: 5-10 minutes/day

7.2 REQUIRED CREDENTIALS (One-Time Setup)
--------------------------------------------------------------------------------

For full autonomous deployment, provide:

1. GitHub Access:
   - Personal Access Token
   - Format: ghp_xxxxxxxxxxxx
   - Scope: repo, workflow
   - Expiry: 90 days

2. VPS Server:
   - SSH Private Key
   - IP address
   - Username
   - Project path

3. Coolify:
   - API Token
   - Webhook URL
   - Application ID

Security: All token-based (not passwords!)
Revokable: Can revoke instantly (<2 min)
Rotation: Every 90 days recommended

7.3 DAILY AUTONOMOUS WORKFLOW
--------------------------------------------------------------------------------

Example Day:

09:00 - User: "Add export PDF feature"

09:02 - AI: Starts autonomous work
        ├─ Explain approach
        ├─ Explain logic flow
        ├─ Create live demo
        └─ Present to user

12:50 - AI: "Feature ready! [Demo link]"

13:00 - User: "Approved!"

13:01 - AI: Auto-deploys
        ├─ git push
        ├─ Coolify builds
        └─ Live in 3 minutes

13:04 - AI: "Feature LIVE! ✅"

User involvement: 2 messages (~2 minutes)
AI work: 4 hours autonomous
Result: Same-day delivery!

7.4 EMERGENCY PROCEDURES
--------------------------------------------------------------------------------

Rollback (if needed):
- Command: git revert HEAD && git push
- Coolify auto-deploys previous version
- Downtime: <3 minutes

Revoke AI Access:
1. Revoke GitHub token (30 seconds)
2. Remove SSH key from server (1 minute)
3. Revoke Coolify token (30 seconds)
Total: <2 minutes, access blocked!

Report Issue:
- User reports to AI
- AI investigates logs
- AI proposes fix
- User approves
- AI implements
- Typically resolved <1 hour

================================================================================
PART 8: COMMUNICATION PROTOCOLS
================================================================================

8.1 AI RESPONSE FORMAT
--------------------------------------------------------------------------------

For Feature Requests:
1. Acknowledge & summarize
2. Explain approach
3. Explain logic flow
4. Create & present demo
5. Request approval
6. Implement if approved

For Questions:
- Answer clearly & concisely
- Provide examples when helpful
- Offer options when applicable
- Always in Bahasa Indonesia

For Issues/Bugs:
- Acknowledge immediately
- Investigate thoroughly
- Explain root cause
- Propose solution
- Implement fix quickly

8.2 USER COMMUNICATION STYLE
--------------------------------------------------------------------------------

Preferences:
✅ Bahasa Indonesia (casual but professional)
✅ Visual demonstrations (demos, screenshots)
✅ Clear explanations (no jargon unless necessary)
✅ Honest about complexity
✅ Proactive suggestions

When Stuck:
- Explain the blocker
- Present options
- Recommend best approach
- Ask for guidance

8.3 FEEDBACK LOOPS
--------------------------------------------------------------------------------

During Development:
- Regular updates (every major milestone)
- Demos at key points
- Early feedback welcome

After Deployment:
- Monitor for issues
- Quick response to bugs
- Gather user feedback
- Iterate based on learnings

================================================================================
PART 9: DECISION FLOWCHARTS
================================================================================

9.1 WHEN USER REQUESTS A CHANGE
--------------------------------------------------------------------------------

User: "Bikin fitur X"
  ↓
AI: Understand requirement
  ↓
Is it clear?
  ├─ NO → Ask clarifying questions → Wait for answer
  └─ YES → Continue
       ↓
  Assess scope
       ↓
  Simple change? (typo, comment, minor)
  ├─ YES → Do it → Notify user → DONE
  └─ NO → Continue to workflow
       ↓
  Check UI impact
       ↓
  Changes UI/UX?
  ├─ YES → STOP → Explain → Get permission → Continue or STOP
  └─ NO → Continue
       ↓
  Follow 6-Step Feature Workflow:
  1. Explain approach
  2. Explain logic
  3. Create demo
  4. Get approval
  5. Implement
  6. Deploy (after approval)

9.2 WHEN AI FINDS AN ISSUE
--------------------------------------------------------------------------------

Issue Discovered
  ↓
Severity?
  ├─ CRITICAL (security, data loss, broken app)
  │   └─ Fix immediately → Inform user → Deploy fix
  │
  ├─ HIGH (major feature broken)
  │   └─ Investigate → Propose fix → Get approval → Fix
  │
  ├─ MEDIUM (minor feature issue)
  │   └─ Document → Propose fix → Wait for approval
  │
  └─ LOW (typo, cosmetic)
      └─ Add to backlog → Fix when convenient

9.3 WHEN USER SAYS "REVISE"
--------------------------------------------------------------------------------

User: "Revise [aspect]"
  ↓
AI: Acknowledge specific revision request
  ↓
Clarify what exactly to change
  ↓
Is it clear now?
  ├─ NO → Ask more questions
  └─ YES → Continue
       ↓
  Make changes
       ↓
  Create new demo (if visual)
       ↓
  Present revised version
       ↓
  "Is this better?"
       ↓
  User approves?
  ├─ YES → Implement → Deploy
  └─ NO → Repeat cycle

================================================================================
PART 10: SUCCESS METRICS & CONTINUOUS IMPROVEMENT
================================================================================

10.1 PROJECT SUCCESS METRICS
--------------------------------------------------------------------------------

Development Metrics:
- Features delivered per week: Target 3-5
- Bug fixes per week: Target 5-10
- Deployment success rate: >95%
- Average deploy time: <5 minutes
- Code quality: Zero TS errors maintained

Quality Metrics:
- TypeScript errors: 0 (strict)
- Console warnings: 0
- Test coverage: Aim for >80%
- Documentation: 100% coverage
- User satisfaction: High

Performance Metrics:
- Page load time: <3 seconds
- API response time: <500ms
- Mobile performance: Smooth (60fps)
- Uptime: >99.5%

User Experience:
- User onboarding: <5 minutes
- Feature adoption: Track usage
- User feedback: Regularly collected
- Issue resolution: <24 hours

10.2 CONTINUOUS IMPROVEMENT
--------------------------------------------------------------------------------

Weekly Review:
- What worked well?
- What can be improved?
- Any blockers?
- New learnings?
- Update SOP if needed

Monthly Retrospective:
- Review success metrics
- Identify patterns
- Optimize workflow
- Technology upgrades
- Team (AI+User) alignment

Quarterly Audit:
- Security review
- Performance optimization
- Dependency updates
- Architecture assessment
- Strategic planning

10.3 LEARNING & ADAPTATION
--------------------------------------------------------------------------------

AI Learns From:
- User feedback & preferences
- What gets approved/rejected
- Common revision requests
- Performance patterns
- User interaction style

SOP Updates When:
- Better practices discovered
- User preferences evolve
- Technology changes
- Team expands
- Project scales

Document Updates:
- This SOP is living document
- Version controlled
- Updated as needed
- Always reflects current agreement

================================================================================
PART 11: REFERENCE & QUICK START
================================================================================

11.1 ESSENTIAL COMMANDS
--------------------------------------------------------------------------------

Development:
npm run dev           # Start dev server
npm run build         # Build for production
npm run type-check    # Check TypeScript

Mobile:
npx cap sync          # Sync web to mobile
npx cap open android  # Open Android Studio

Git & Deploy:
git add .
git commit -m "feat: descriptive message"
git push origin main  # Auto-deploys via Coolify

11.2 QUICK DECISION GUIDE
--------------------------------------------------------------------------------

"Can I change this without asking?"

Visual/UI change? → NO, ask first!
Logic/backend change? → Explain first, then ask
Bug fix? → Fix, then inform
Security issue? → Fix immediately, then inform
Performance optimization? → Explain first, then ask
New feature? → Always follow 6-step workflow

11.3 WHEN IN DOUBT
--------------------------------------------------------------------------------

Always Remember:
✅ Ask user, don't assume
✅ Show demo, don't just tell
✅ Test thoroughly before present
✅ Follow SOP strictly
✅ User's vision = priority
✅ Glassmorphism design = standard
✅ Quality over speed (but fast!)

11.4 EMERGENCY CONTACTS
--------------------------------------------------------------------------------

Technical Issues:
- Check logs first
- Review recent changes
- Test in isolation
- Propose fix
- Get approval
- Deploy fix

User Blocked:
- Prioritize unblocking
- Clear communication
- Quick resolution
- Learn from incident

================================================================================
PART 12: DOCUMENT MAINTENANCE
================================================================================

12.1 VERSION HISTORY
--------------------------------------------------------------------------------

Version 1.0 (2025-12-01) - CURRENT
- Initial ULTIMATE SOP consolidation
- Combined all previous SOPs
- Added glassmorphism design system
- Added 6-step feature workflow
- Added responsibility matrix
- Official collaboration framework
- Status: APPROVED & ACTIVE

12.2 RELATED DOCUMENTS
--------------------------------------------------------------------------------

Core Documents:
├─ PROJECT_MASTER_CONTEXT.txt (Project overview)
├─ ULTIMATE_SOP_MASTER.txt (This document - THE guide)
├─ GLASSMORPHISM_DESIGN_SYSTEM.txt (Design specs)
├─ AUTONOMOUS_SETUP_GUIDE.md (Credentials setup)
└─ BENEFIT_ANALYSIS.txt (Business case)

Reference:
├─ SOP_CONSOLIDATED.md (Detailed SOP - legacy)
├─ UI_LOCK_DOCUMENTATION.md (UI protection)
└─ glassmorphism_demo.html (Live demo)

12.3 USAGE INSTRUCTIONS
--------------------------------------------------------------------------------

For New AI Session:
1. Read PROJECT_MASTER_CONTEXT.txt (project overview)
2. Read ULTIMATE_SOP_MASTER.txt (this document - THE guide)
3. Review GLASSMORPHISM_DESIGN_SYSTEM.txt (design specs)
4. Acknowledge understanding to user
5. Ask what to work on next
6. Follow SOP from this point forward

For New Team Member:
1. Read all core documents
2. Review live demo
3. Understand collaboration model
4. Learn glassmorphism design
5. Study 6-step workflow
6. Start with small task

For Reference During Work:
- Quick check section 11 (Quick Start)
- Review specific sections as needed
- Always follow 10 Golden Rules
- Use 6-step workflow for features

================================================================================
CONCLUSION
================================================================================

This ULTIMATE SOP MASTER represents the complete framework for AI-Human
collaboration on the Pawon Salam Restaurant Management System.

It consolidates:
✅ User-centric development philosophy
✅ Clear division of responsibilities
✅ 10 Golden Rules (never violate!)
✅ 6-Step Feature Implementation Workflow
✅ Glassmorphism Design System (approved)
✅ Quality standards & best practices
✅ Mobile app development strategy
✅ Autonomous collaboration model
✅ Communication protocols
✅ Decision-making frameworks
✅ Success metrics & improvement

This is THE definitive guide. All work must follow this SOP.

When in doubt, refer to this document.
When things work well, document why here.
When improvements found, update this document.

This SOP is:
- LIVING (evolves with project)
- BINDING (must be followed)
- COMPREHENSIVE (covers everything)
- USER-APPROVED (official framework)

VERSION: 1.0 FINAL
STATUS: APPROVED & ACTIVE
LAST UPDATED: 2025-12-01

Let's build something amazing together! 🚀

================================================================================
END OF ULTIMATE SOP MASTER
================================================================================

================================================================================
PART 6: ULTRA LOCKED PROTOCOL (BACKEND & FRONTEND WIRING)
================================================================================

6.1 ULTRA LOCKED DEFINITION
--------------------------------------------------------------------------------

ALL wiring logic, routing, and data flow between Backend and Frontend is now in
ULTRA LOCKED MODE.

This includes:
- API Endpoints & Routes
- Data Fetching Logic (Services)
- State Management Logic
- Authentication Flows
- Database Schema & Relationships
- Middleware & Server Configuration

6.2 MODIFICATION PROTOCOL (STRICT)
--------------------------------------------------------------------------------

IF any adjustment to the wiring logic is required:

1.  PERMISSION FIRST:
    - You MUST ask for explicit permission from the User.
    - You MUST explain exactly WHAT will change and WHY.
    - You MUST confirm that existing logic will not be broken.

2.  MANDATORY ROLLBACK SYSTEM:
    - Even if permission is granted, a ROLLBACK SYSTEM is MANDATORY.
    - You must be able to revert to the exact previous state immediately if errors occur.
    - No excuses. Safety is paramount.

3.  AI COMPLIANCE:
    - This rule applies to ANY AI model working on this project.
    - Violation of this protocol is a critical failure.

--------------------------------------------------------------------------------

================================================================================
PART 7: TECHNICAL DOCTRINE & ARCHITECTURE STANDARDS (V1.0)
================================================================================

7.1 INFRASTRUCTURE MANDATE
--------------------------------------------------------------------------------

DO:
- Gunakan infrastruktur VPS Cloud Indonesia (Domainesia/Rumahweb/Biznet) untuk latensi rendah dan kedaulatan data.
- Tulis kode Backend (Node.js) yang agnostik (bisa jalan di VPS biasa), jangan terkunci pada fitur vendor-lock (seperti AWS Lambda only).

REASONING:
- Low Latency (Lokal)
- Data Sovereignty (Kedaulatan Data)
- Cost Efficiency (Efisiensi Biaya)

7.2 CRITICAL DATA INTEGRITY (THE 'ANTI-FRAUD' LAW)
--------------------------------------------------------------------------------

DON'T:
- JANGAN PERNAH menggunakan Optimistic UI (Centang Hijau Palsu) untuk data Kritis (Absensi/Gaji).
- JANGAN percaya pada waktu jam HP Client (Date.now()).

DO:
- Gunakan pendekatan Offline-First dengan status PENDING (Warna Oranye) sampai server memberi konfirmasi (ACK).
- WAJIB implementasi Monotonic Clock Logic & Trusted Time Service untuk mencegah manipulasi jam absensi (Time Travel Fraud).

PROTOCOL:
- UI Status: PENDING (Oranye) -> ACK (Hijau).
- Storage: Offline Queue via IndexedDB.
- Validation: Monotonic Clock Logic.

7.3 SMART AI IMPLEMENTATION
--------------------------------------------------------------------------------

DO:
- Terapkan Hybrid Processing: Liveness Detection ringan di HP, Face Matching berat di Server.

7.4 STANDARD CODE REFERENCE (AI MUST READ)
--------------------------------------------------------------------------------

#### Reference Implementation: TrustedTimeService.ts

Instruksi untuk AI masa depan: "Jika User meminta fitur absensi, GUNAKAN logic kode di bawah ini sebagai pondasi."

```typescript
// src/services/TrustedTimeService.ts

/**
 * TRUSTED TIME SERVICE (MONOTONIC CLOCK LOGIC)
 * Standard Reference for Pawon Salam Enterprise App
 * 
 * Purpose: Prevent "Time Travel Fraud" (User changing device time).
 * Logic: Uses performance.now() (Monotonic) anchored to a trusted Server Time.
 */

export class TimeIntegrityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeIntegrityError';
  }
}

interface TimeSyncState {
  serverTime: number;      // Unix timestamp from server (Trusted)
  performanceTime: number; // performance.now() at the moment of sync
  isSynced: boolean;
}

class TrustedTimeService {
  private syncState: TimeSyncState = {
    serverTime: 0,
    performanceTime: 0,
    isSynced: false
  };

  /**
   * SYNC WITH SERVER
   * Fetches trusted time from backend and anchors it to local monotonic clock.
   */
  async syncWithServer(): Promise<void> {
    try {
      const start = performance.now();
      
      // SIMULATION: Replace with actual API call in production
      // const response = await fetch('/api/system/time');
      // const data = await response.json();
      // const serverTime = data.timestamp; 
      
      // For Reference Purpose: Simulating Server Time
      const serverTime = Date.now(); 
      
      const end = performance.now();
      const latency = (end - start) / 2;

      this.syncState = {
        serverTime: serverTime + latency, // Adjust for network latency
        performanceTime: end,
        isSynced: true
      };

      console.log('[TrustedTime] Synced with server:', new Date(this.syncState.serverTime));
    } catch (error) {
      console.error('[TrustedTime] Sync failed:', error);
      this.syncState.isSynced = false;
      throw new Error('Failed to sync with trusted server.');
    }
  }

  /**
   * GET TRUSTED TIME
   * Calculates current time using the anchor + elapsed monotonic time.
   * Throws error if device restart detected or not synced.
   */
  getTrustedTime(): number {
    if (!this.syncState.isSynced) {
      throw new TimeIntegrityError('Time not synced. Call syncWithServer() first.');
    }

    const currentPerformance = performance.now();

    // DETECT RESTART / ANOMALY
    // performance.now() resets on browser context reload/restart.
    // If current < stored, it means a reset happened.
    if (currentPerformance < this.syncState.performanceTime) {
       this.syncState.isSynced = false;
       throw new TimeIntegrityError('Monotonic clock anomaly detected. Device may have restarted. Re-sync required.');
    }

    const elapsed = currentPerformance - this.syncState.performanceTime;
    return this.syncState.serverTime + elapsed;
  }

  isTimeTrusted(): boolean {
    return this.syncState.isSynced;
  }
}

export const trustedTime = new TrustedTimeService();
```

END OF SOP
