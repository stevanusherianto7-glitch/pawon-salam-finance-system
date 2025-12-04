# AI ONBOARDING & READING GUIDE

**PURPOSE:**
This document serves as the **MANDATORY INDEX** for any AI model or developer joining the "Pawon Salam" project. It defines the reading order and critical context required to avoid regression and maintain project integrity.

---

## 1. THE FOUNDATION (READ FIRST)
These documents define the "Soul" and "Law" of the project.
*   **Repository:** [https://github.com/stevanusherianto7-glitch/pawon-salam-finance-system](https://github.com/stevanusherianto7-glitch/pawon-salam-finance-system)
*   **`SOP_ULTIMATE_MASTER.md`**
    *   *The Original Foundation.*
    *   Contains: Philosophy, Roles, Responsibility Matrix, Deployment URLs, GitHub Repo.
*   **`SOP_ULTIMATE_MASTER_V2.md`**
    *   *The Advanced Protocols.*
    *   Contains: Detailed workflows, specific standards, and evolved practices.

## 2. PROJECT CONTEXT (CRITICAL)
Read these to understand *what* we are building and *how* we must build it.
*   **`PAWON_SALAM_CONTEXT.md`**
    *   **Role & Brand**: Who you are (Senior Fullstack Engineer) and the brand voice (Professional, Warm).
    *   **Tech Stack**: React, Tailwind, Lucide.
    *   **Strict Mandates**: `contentEditable` usage, A4 Print constraints, Input sanitization.
*   **`PROJECT_FEATURES.md`**
    *   **Feature Audit**: Comprehensive list of what is already built (Backend/Frontend status).
    *   *Use this to avoid rebuilding existing features.*

## 3. SPECIALIZED GUIDES (TASK-DEPENDENT)
Read these only if your task involves specific domains.
*   **`PRINTABLE_DOCUMENT_SOP.md`**
    *   *Required for:* Payslips, Reports, Invoices.
    *   Contains: CSS for A4 printing, `@media print` rules, sticky footers, and scaling logic.

## 4. DEPLOYMENT & STATUS
*   **`DEPLOYMENT_LOG_MASTER.md`**
    *   **MANDATORY:** Check this to see the latest live version.
    *   **ACTION:** You MUST append your deployment report here after finishing a feature.
*   **`DEPLOYMENT_REPORT_PAYSLIP.md`** (Reference only)
    *   Detailed report of the Payslip rollout.

---

## ⚠️ CRITICAL INSTRUCTION TO AI
**Before writing a single line of code:**
1.  **Identify your task domain.**
2.  **Read the relevant documents** listed above.
3.  **Verify compliance** with `PAWON_SALAM_CONTEXT.md` (especially "Coding Mandates").
4.  **Check `PROJECT_FEATURES.md`** to see if the logic already exists in `services/api.ts` or `store/`.

**FAILURE TO FOLLOW THIS GUIDE WILL RESULT IN:**
*   Broken layouts (especially on Print/A4).
*   Duplicate logic.
*   Violation of Brand Identity.
