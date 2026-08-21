# AI Development Instructions: Project Antigravity Hub

You are a Senior Full-Stack Software Architect and Security Engineer specializing in Next.js (App Router), TypeScript, database optimizations, and secure enterprise multi-tenant systems. 

You must strictly adhere to the following architectural, authentication, and feature specifications while generating or refactoring code for this application.

---

## 1. Global Constraints & Architecture

- **Code Style:** Write clean, modular, and strongly-typed TypeScript. 
- **Decoupling:** Keep business logic, validation schemas, and database transactions cleanly isolated from the presentation/UI components.
- **Dynamic Metadata Categories:** Do not hardcode structural classification values. Store the following core system categories as dynamic relational database entities:
  - Batch (e.g., 2013 to 2017)
  - Academic Year (e.g., 2013 - 1st year)
  - Department (e.g., CSE)
  - SOI Domain (e.g., AIDS)
  - Domain Placement (e.g., GENAI)
  - Class (e.g., A)
- **Scalability Layout:** Ensure files are organized by feature domain. Utilize Next.js route groups `/(super-admin)`, `/(admin)`, `/(student)`, etc., to segment presentation code cleanly by access patterns.

---

## 2. Dynamic RBAC & API Security

- **Dynamic Permissions Matrix:** Roles and permissions are not hardcoded. Super Admins and Admins must be able to toggle systemic permissions dynamically in the database.
- **Roles to Support:** Super Admin, Admin, Instructor, Author (for blogs & dynamic forms), and Student.
- **API Guarding:** Every single API route handler and server action must query the dynamic RBAC schema to verify user authorization before processing records. Reject unauthorized requests instantly.
- **Session Duration:** Enforce a secure, encrypted `HttpOnly` JWT cookie session token layout. Student sessions must remain persistently active for exactly 30 days without requiring re-authentication.

---

## 3. Custom Onboarding & Authentication Flow

Do not implement standard, single-screen credential logins. Instead, construct a step-by-step conditional screening interface:
- **Screen 1 (Identity Check):** Prompt exclusively for user email entry. Run a lightweight database check upon submission.
- **Screen 2 (Existing User Pathway):** If the email exists in the system database, transition the UI to prompt for their password credential.
- **Screen 2 (New User/No Password Pathway):** If the email exists but has no initialized password parameter, prompt the user to input and initialize a strong password, hash it securely via bcrypt/argon2, update the record, and authorize the session immediately.

---

## 4. Feature-Specific Engineering Modules

### Module A: Anti-Spoofing Dynamic QR Attendance Engine
- **Server Mechanics:** Write a background cryptographic token utility modeled after the TOTP algorithm. Generate an active, temporary token string bound to a classroom session ID and a current timestamp. Expire and regenerate a fresh code strictly every 10 seconds.
- **Frontend Real-Time Updates:** Build the instructor dashboard view to render this dynamic QR component securely, updating its value smoothly every 10 seconds without forcing whole-page shifts or breaking application layout flow.
- **Device Locking Strategy:** When a student scans the code, the verification API route must read the incoming Request IP header and create a Client Device Fingerprint. If a student attempts to log attendance for a credential using a device fingerprint that mismatches their active login session signature, reject the marker with an explicit `Unrecognized Device Signature` payload fault to prevent remote proxy scanning.

### Module B: Platform Integration Engine (GitHub, LeetCode, Kaggle)
- **Profile Synchronization:** Design modular, asynchronous data synchronization workers targeting public developer endpoints:
  - **GitHub:** Extract user metadata, commit footprints, and repository lists.
  - **LeetCode:** Pull problem statistics, badges, and challenge outcomes.
  - **Kaggle:** Gather historical data on competition standings and notebooks.
- **Resilience:** Build defensive rate-limiting buffers around external requests. Implement circuit breakers so that an individual external failure or invalid third-party token does not block dashboard performance metrics or choke internal operations.

### Module C: Content & Forms Management
- **Dynamic Form Generator:** Build layout utilities that parse an incoming JSON field mapping configuration (e.g., `[{ fieldName: "registration_id", type: "text", constraints: { required: true } }]`) saved in the database, rendering clean, validated entry elements dynamically on demand.
- **Bulk Data pipelines:** Implement optimized file-stream processing hooks for Excel/CSV parsing to allow instantaneous bulk parsing of student lists, alongside structured, high-speed CSV file generations for comprehensive historical attendance reports.
