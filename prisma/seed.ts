import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Seeding SindhanAI database at:", dbPath);

    // 1. Seed News Posts
    await prisma.newsPost.deleteMany();
    await prisma.newsPost.createMany({
        data: [
            {
                title: "SindhanAI Launches Applied Generative AI Vertical at KGISL Campus",
                slug: "sindhanai-launches-applied-genai-vertical",
                summary: "Bringing together industry experts, faculty, and student developers to build production-grade LLM applications and RAG systems.",
                content: `SindhanAI is proud to announce the launch of its Applied Generative AI Lab under the School of Innovation at KGISL Educational Institutions. The lab brings together experienced industry practitioners, academic faculty, and passionate student learners to tackle real-world artificial intelligence challenges.\n\nThe vertical will focus on LLM application development, Retrieval-Augmented Generation (RAG) pipelines, autonomous AI agents, and custom fine-tuning for domain-specific enterprise problems.`,
                category: "Announcement",
                published: true,
            },
            {
                title: "Students and Faculty Team Up for Industry AI Computer Vision Project",
                slug: "students-faculty-team-up-cv-project",
                summary: "SindhanAI team delivers automated quality inspection system for manufacturing partner using edge computer vision models.",
                content: `In a live industry engagement, SindhanAI faculty and student developers engineered an edge-based computer vision system for automated defect detection in real-time manufacturing lines.\n\nStudents worked directly under the guidance of industry leaders, gaining hands-on experience with model quantization, deployment pipelines, and industrial integration.`,
                category: "Tech",
                published: true,
            },
            {
                title: "Upcoming GenAI Hackathon: Building Autonomous Agents for Enterprise",
                slug: "upcoming-genai-hackathon-2026",
                summary: "A 36-hour hackathon bringing together students and mentors across KGISL institutions to create intelligent multi-agent workflows.",
                content: `The School of Innovation and SindhanAI will host the annual Autonomous AI Agents Hackathon next month at the KGISL AI Lab. Registration is open to all students across AI, CS, and engineering streams.`,
                category: "SOI Hackathon",
                published: true,
            },
        ],
    });

    // 2. Seed Events
    await prisma.event.deleteMany();
    const event1 = await prisma.event.create({
        data: {
            title: "Hands-On Workshop: Building Enterprise RAG Systems with LangChain & LlamaIndex",
            slug: "hands-on-rag-workshop-2026",
            date: "September 15, 2026",
            time: "09:30 AM - 04:30 PM IST",
            venue: "Generative AI Lab, KGISL Campus, Coimbatore",
            description: "An intensive 1-day practical workshop covering vector database integration, chunking strategies, hybrid search, and evaluation metrics for enterprise RAG solutions.",
            isPast: false,
        },
    });

    const event2 = await prisma.event.create({
        data: {
            title: "SindhanAI National Student Hackathon 2026",
            slug: "sindhanai-national-student-hackathon-2026",
            date: "October 02 - 04, 2026",
            time: "36 Hours Live",
            venue: "Main Auditorium & Innovation Labs, KGISL",
            description: "Build cutting-edge solutions across AI/ML, Computer Vision, and Web Development. Win cash prizes and direct project incubation opportunities with SindhanAI.",
            isPast: false,
        },
    });

    await prisma.event.create({
        data: {
            title: "Faculty Upskilling Series: Modern Deep Learning & PyTorch",
            slug: "faculty-upskilling-pytorch-2026",
            date: "July 18, 2026",
            time: "10:00 AM - 01:00 PM IST",
            venue: "AI & Data Science Lab (Completed)",
            description: "Comprehensive upskilling module for faculty members on deep learning fundamentals, attention mechanisms, and PyTorch model training workflows.",
            isPast: true,
        },
    });

    // 3. Seed Event Registrations
    await prisma.eventRegistration.deleteMany();
    await prisma.eventRegistration.create({
        data: {
            eventId: event1.id,
            name: "Aravind Swamy",
            email: "aravind@kgisl.ac.in",
            phone: "+91 98765 43210",
            institution: "KGISL Institute of Technology",
            role: "Student",
            additionalInfo: "Interested in vector databases and LLM fine-tuning.",
        },
    });

    // 4. Seed Team Members
    await prisma.teamMember.deleteMany();
    await prisma.teamMember.createMany({
        data: [
            {
                name: "Dr. K. Ashok Kumar",
                designation: "Head of AI & Technology Lab",
                category: "Industry Professional",
                labGroup: "AI & Data Science Lab",
                domain: "AI Architecture & Industry Engagements",
                order: 1,
            },
            {
                name: "Priya Sundaram",
                designation: "Lead GenAI Engineer & Practitioner",
                category: "Industry Professional",
                labGroup: "Generative AI Lab",
                domain: "LLM Applications & Agentic Workflows",
                order: 2,
            },
            {
                name: "Prof. S. Ranganathan",
                designation: "Associate Professor & Research Lead",
                category: "Faculty",
                labGroup: "SCOPE",
                domain: "Computer Vision & Data Science",
                order: 3,
            },
            {
                name: "Deepak Raj",
                designation: "Senior Student Developer",
                category: "Student",
                labGroup: "Generative AI Lab",
                domain: "Full-Stack Web & RAG Systems",
                order: 4,
            },
        ],
    });

    // 5. Seed Client Logos / Partners
    await prisma.clientLogo.deleteMany();
    await prisma.clientLogo.createMany({
        data: [
            { name: "KGISL Group of Companies" },
            { name: "KGISL School of Innovation (SOI)" },
            { name: "MicroCollege" },
            { name: "Apex Tech Solutions" },
            { name: "Cognitive AI Systems" },
        ],
    });

    // 0. Truncate existing relational records for a clean seed
    console.log("Truncating existing records for fresh seed...");
    await prisma.studentSkill.deleteMany();
    await prisma.attendanceRecord.deleteMany();
    await prisma.classroomSession.deleteMany();
    await prisma.formSubmission.deleteMany();
    await prisma.user.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.role.deleteMany();
    await prisma.department.deleteMany();
    await prisma.classGroup.deleteMany();
    await prisma.slotTiming.deleteMany();
    await prisma.soiDomain.deleteMany();
    await prisma.domainPlacement.deleteMany();
    await prisma.batch.deleteMany();
    await prisma.academicYear.deleteMany();
    await prisma.interestedRole.deleteMany();

    // 7. Seed Dynamic Metadata Categories
    console.log("Seeding Dynamic Metadata Categories...");
    const batch1 = await prisma.batch.create({
        data: { name: "2023-2027", code: "BATCH_2023_2027", startYear: 2023, endYear: 2027, isActive: true } as any,
    });

    const batch2 = await prisma.batch.create({
        data: { name: "2024-2028", code: "BATCH_2024_2028", startYear: 2024, endYear: 2028, isActive: true } as any,
    });

    const year3 = await prisma.academicYear.create({
        data: { name: "3rd Year", code: "YEAR_3", isActive: true } as any,
    });

    const deptCse = await prisma.department.create({
        data: { name: "Computer Science & Engineering", code: "CSE", isActive: true } as any,
    });

    const deptEce = await prisma.department.create({
        data: { name: "Electronics & Communication Engineering", code: "ECE", isActive: true } as any,
    });

    const domainAids = await prisma.soiDomain.create({
        data: { name: "AI & Data Science", code: "AIDS", isActive: true } as any,
    });

    const placementGenAi = await prisma.domainPlacement.create({
        data: { name: "Generative AI Engineer", code: "GENAI_ENG", isActive: true } as any,
    });

    const classA = await prisma.classGroup.create({
        data: { name: "Section A", code: "CLASS_A", isActive: true } as any,
    });

    const classB = await prisma.classGroup.create({
        data: { name: "Section B", code: "CLASS_B", isActive: true } as any,
    });

    const slotMorning = await prisma.slotTiming.create({
        data: { name: "Morning Slot A (09:00 AM - 11:30 AM)", code: "SLOT_MORNING_A", isActive: true } as any,
    });

    const slotAfternoon = await prisma.slotTiming.create({
        data: { name: "Afternoon Slot B (01:30 PM - 04:00 PM)", code: "SLOT_AFTERNOON_B", isActive: true } as any,
    });

    const roleAiEngineer = await prisma.interestedRole.create({
        data: { name: "AI / ML Engineer", code: "ROLE_AI_ENG", isActive: true } as any,
    });

    const roleFullstack = await prisma.interestedRole.create({
        data: { name: "Fullstack Web Engineer", code: "ROLE_FULLSTACK", isActive: true } as any,
    });

    // 8. Seed Roles
    console.log("Seeding Dynamic Roles...");
    const roleSuperAdmin = await prisma.role.create({
        data: { name: "SUPER_ADMIN", description: "Super Admin with unrestricted systemic privileges", isSystem: true },
    });

    const roleAdmin = await prisma.role.create({
        data: { name: "ADMIN", description: "Administrator managing users, sessions, and forms", isSystem: true },
    });

    const roleInstructor = await prisma.role.create({
        data: { name: "INSTRUCTOR", description: "Instructor generating TOTP QR codes and running sessions", isSystem: true },
    });

    const roleAuthor = await prisma.role.create({
        data: { name: "AUTHOR", description: "Content author for news, events, and dynamic forms", isSystem: true },
    });

    const roleStudent = await prisma.role.create({
        data: { name: "STUDENT", description: "Student scanning attendance and maintaining portfolio", isSystem: true },
    });

    // 9. Seed System Permissions
    console.log("Seeding Permissions...");
    const permissionsData = [
        { key: "users:manage", name: "Manage System Users", category: "Users" },
        { key: "rbac:manage", name: "Manage Roles & Permissions", category: "RBAC" },
        { key: "metadata:manage", name: "Manage Metadata Categories", category: "Metadata" },
        { key: "attendance:create", name: "Create Classroom Sessions", category: "Attendance" },
        { key: "qr:generate", name: "Generate Dynamic TOTP QR Codes", category: "Attendance" },
        { key: "attendance:mark", name: "Mark Session Attendance", category: "Attendance" },
        { key: "content:write", name: "Write News & Event Posts", category: "Content" },
        { key: "forms:manage", name: "Manage Dynamic Forms", category: "Forms" },
        { key: "profile:sync", name: "Sync Developer Platform Portfolios", category: "Integrations" },
    ];

    for (const permData of permissionsData) {
        const perm = await prisma.permission.create({
            data: permData,
        });

        // Grant all permissions to SUPER_ADMIN
        await prisma.rolePermission.create({
            data: { roleId: roleSuperAdmin.id, permissionId: perm.id },
        });
    }

    // 10. Seed Default Test Users (Both .com and .ac.in)
    console.log("Seeding Default System Users with Complete Metadata Bindings...");
    const defaultPasswordHash = await bcrypt.hash("SuperAdminPass123!", 10);
    const adminPasswordHash = await bcrypt.hash("AdminPass123!", 10);
    const instructorPasswordHash = await bcrypt.hash("InstructorPass123!", 10);
    const studentPasswordHash = await bcrypt.hash("StudentPass123!", 10);

    const userCredentials = [
        { email: "superadmin@sindhanai.com", name: "Super Admin", roleId: roleSuperAdmin.id, passwordHash: defaultPasswordHash },
        { email: "superadmin@sindhanai.ac.in", name: "Super Admin", roleId: roleSuperAdmin.id, passwordHash: defaultPasswordHash },
        { email: "admin@sindhanai.com", name: "System Admin", roleId: roleAdmin.id, passwordHash: adminPasswordHash },
        { email: "admin@sindhanai.ac.in", name: "System Admin", roleId: roleAdmin.id, passwordHash: adminPasswordHash },
        { email: "instructor@sindhanai.com", name: "Dr. K. Ashok Kumar", roleId: roleInstructor.id, passwordHash: instructorPasswordHash, departmentId: deptCse.id, soiDomainId: domainAids.id },
        { email: "instructor@sindhanai.ac.in", name: "Dr. K. Ashok Kumar", roleId: roleInstructor.id, passwordHash: instructorPasswordHash, departmentId: deptCse.id, soiDomainId: domainAids.id },
        {
            email: "student@sindhanai.com",
            name: "Deepak Raj",
            rollNumber: "73772321001",
            registrationNumber: "REG2023001",
            roleId: roleStudent.id,
            passwordHash: studentPasswordHash,
            batchId: batch1.id,
            academicYearId: year3.id,
            departmentId: deptCse.id,
            soiDomainId: domainAids.id,
            domainPlacementId: placementGenAi.id,
            classGroupId: classA.id,
            slotTimingId: slotMorning.id,
            interestedRoleId: roleAiEngineer.id,
        },
        {
            email: "student@sindhanai.ac.in",
            name: "Deepak Raj",
            rollNumber: "73772321001",
            registrationNumber: "REG2023001",
            roleId: roleStudent.id,
            passwordHash: studentPasswordHash,
            batchId: batch1.id,
            academicYearId: year3.id,
            departmentId: deptCse.id,
            soiDomainId: domainAids.id,
            domainPlacementId: placementGenAi.id,
            classGroupId: classA.id,
            slotTimingId: slotMorning.id,
            interestedRoleId: roleAiEngineer.id,
        },
        {
            email: "student2@sindhanai.com",
            name: "Priya Sharma",
            rollNumber: "73772321002",
            registrationNumber: "REG2023002",
            roleId: roleStudent.id,
            passwordHash: studentPasswordHash,
            batchId: batch2.id,
            academicYearId: year3.id,
            departmentId: deptEce.id,
            soiDomainId: domainAids.id,
            domainPlacementId: placementGenAi.id,
            classGroupId: classB.id,
            slotTimingId: slotAfternoon.id,
            interestedRoleId: roleFullstack.id,
        },
    ];

    for (const u of userCredentials) {
        await prisma.user.create({
            data: u,
        });
    }

    console.log("Database successfully truncated and seeded with full metadata relation bindings!");

    console.log("Database seeded successfully with Metadata, RBAC, and System Users!");
}

main()
    .catch((e) => {
        console.error("Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
