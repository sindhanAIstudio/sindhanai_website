import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Starting Comprehensive SindhanAI Institutional DB Seeding...");

    // 1. ROLES
    const superAdminRole = await prisma.role.upsert({
        where: { name: "SUPER_ADMIN" },
        update: {},
        create: { name: "SUPER_ADMIN", description: "Super Administrator - System Settings, RBAC & Metadata", isSystem: true },
    });

    const adminRole = await prisma.role.upsert({
        where: { name: "ADMIN" },
        update: {},
        create: { name: "ADMIN", description: "Lab Administrator - Manage Students, Instructors & Lab Attendance", isSystem: true },
    });

    const instructorRole = await prisma.role.upsert({
        where: { name: "INSTRUCTOR" },
        update: {},
        create: { name: "INSTRUCTOR", description: "Lab Instructor & Technical Mentor", isSystem: true },
    });

    const studentRole = await prisma.role.upsert({
        where: { name: "STUDENT" },
        update: {},
        create: { name: "STUDENT", description: "Enrolled Student", isSystem: true },
    });

    // 2. DEPARTMENTS (10)
    const departmentsData = [
        { name: "Computer Science and Engineering", code: "CSE" },
        { name: "Electronics and Communication Engineering", code: "ECE" },
        { name: "Mechanical Engineering", code: "MECH" },
        { name: "Artificial Intelligence and Data Science", code: "AIDS" },
        { name: "Computer Science and Business Systems", code: "CSBS" },
        { name: "Information Technology", code: "IT" },
        { name: "Sciences and Humanities", code: "SNH" },
        { name: "Master of Business Administration", code: "MBA" },
        { name: "Artificial Intelligence and Machine Learning", code: "AIML" },
        { name: "Cybersecurity", code: "CYBER" },
    ];

    const createdDepartments: any[] = [];
    for (const dept of departmentsData) {
        const d = await prisma.department.upsert({
            where: { code: dept.code },
            update: { name: dept.name },
            create: { name: dept.name, code: dept.code },
        });
        createdDepartments.push(d);
    }

    // 3. CLASS GROUPS / SECTIONS (3)
    const sectionsData = [
        { name: "Section A", code: "CLASS_A" },
        { name: "Section B", code: "CLASS_B" },
        { name: "Section C", code: "CLASS_C" },
    ];

    const createdSections: any[] = [];
    for (const sec of sectionsData) {
        const s = await prisma.classGroup.upsert({
            where: { code: sec.code },
            update: { name: sec.name },
            create: { name: sec.name, code: sec.code },
        });
        createdSections.push(s);
    }

    // 4. SLOT TIMINGS (3)
    const slotTimingsData = [
        { name: "Morning", code: "SLOT_MORNING" },
        { name: "Afternoon", code: "SLOT_AFTERNOON" },
        { name: "Evening", code: "SLOT_EVENING" },
    ];

    const createdSlotTimings: any[] = [];
    for (const slot of slotTimingsData) {
        const st = await prisma.slotTiming.upsert({
            where: { code: slot.code },
            update: { name: slot.name },
            create: { name: slot.name, code: slot.code },
        });
        createdSlotTimings.push(st);
    }

    // 5. SOI DOMAINS / SOI LABS (9)
    const soiLabsData = [
        { name: "Artificial Intelligence & Data Science", code: "AIDS_LAB", short: "aids" },
        { name: "Blockchain & Web 3.0", code: "BLOCKCHAIN_LAB", short: "blockchain" },
        { name: "Cloud & DevOps", code: "CLOUD_LAB", short: "cloud" },
        { name: "Cybersecurity", code: "CYBER_LAB", short: "cyber" },
        { name: "Embedded Systems & Internet of Things (IoT)", code: "IOT_LAB", short: "iot" },
        { name: "Design, Manufacturing & Automation", code: "AUTOMATION_LAB", short: "automation" },
        { name: "Full-Stack Web Development", code: "FULLSTACK_LAB", short: "fullstack" },
        { name: "Generative AI Lab", code: "GENAI_LAB", short: "genai" },
        { name: "Venture & Incubation Laboratory", code: "VENTURE_LAB", short: "venture" },
    ];

    const createdLabs: any[] = [];
    for (const lab of soiLabsData) {
        const l = await prisma.soiDomain.upsert({
            where: { code: lab.code },
            update: { name: lab.name },
            create: { name: lab.name, code: lab.code },
        });
        createdLabs.push({ ...l, short: lab.short });
    }

    // 6. DOMAIN PLACEMENTS (7)
    const domainPlacementsData = [
        { name: "Artificial Intelligence & Data Science", code: "PLACE_AIDS" },
        { name: "Blockchain & Web 3.0", code: "PLACE_BLOCKCHAIN" },
        { name: "Cloud & DevOps", code: "PLACE_CLOUD" },
        { name: "Cybersecurity", code: "PLACE_CYBER" },
        { name: "Embedded Systems & Internet of Things (IoT)", code: "PLACE_IOT" },
        { name: "Design, Manufacturing & Automation", code: "PLACE_AUTOMATION" },
        { name: "Full-Stack Web Development", code: "PLACE_FULLSTACK" },
    ];

    const createdPlacements: any[] = [];
    for (const dp of domainPlacementsData) {
        const p = await prisma.domainPlacement.upsert({
            where: { code: dp.code },
            update: { name: dp.name },
            create: { name: dp.name, code: dp.code },
        });
        createdPlacements.push(p);
    }

    // 7. BATCHES & ACADEMIC YEARS (5)
    const batchesData = [
        { name: "2022 - 2026", code: "BATCH_2022_2026", startYear: 2022, endYear: 2026 },
        { name: "2023 - 2027", code: "BATCH_2023_2027", startYear: 2023, endYear: 2027 },
        { name: "2024 - 2028", code: "BATCH_2024_2028", startYear: 2024, endYear: 2028 },
        { name: "2025 - 2029", code: "BATCH_2025_2029", startYear: 2025, endYear: 2029 },
        { name: "2026 - 2027", code: "BATCH_2026_2027", startYear: 2026, endYear: 2027 },
    ];

    const createdBatches: any[] = [];
    for (const b of batchesData) {
        const batch = await prisma.batch.upsert({
            where: { code: b.code },
            update: { name: b.name },
            create: { name: b.name, code: b.code, startYear: b.startYear, endYear: b.endYear },
        });
        createdBatches.push(batch);
    }

    const createdAcademicYears: any[] = [];
    const yearsData = [
        { name: "1st Year", code: "YEAR_1" },
        { name: "2nd Year", code: "YEAR_2" },
        { name: "3rd Year", code: "YEAR_3" },
        { name: "4th Year", code: "YEAR_4" },
    ];
    for (const y of yearsData) {
        const yr = await prisma.academicYear.upsert({
            where: { code: y.code },
            update: { name: y.name },
            create: { name: y.name, code: y.code },
        });
        createdAcademicYears.push(yr);
    }

    // 8. INTERESTED ROLES
    const rolesData = [
        { name: "AI Engineer", code: "ROLE_AI_ENG" },
        { name: "Cloud Architect", code: "ROLE_CLOUD_ARCH" },
        { name: "Cybersecurity Specialist", code: "ROLE_CYBER_SPEC" },
        { name: "DevOps Engineer", code: "ROLE_DEVOPS" },
        { name: "Fullstack Developer", code: "ROLE_FULLSTACK" },
        { name: "IoT Solutions Architect", code: "ROLE_IOT_ARCH" },
        { name: "Data Scientist", code: "ROLE_DATA_SCI" },
        { name: "Blockchain Developer", code: "ROLE_BLOCKCHAIN" },
        { name: "Generative AI Researcher", code: "ROLE_GENAI_RES" },
        { name: "Automation & Robotics Engineer", code: "ROLE_AUTOMATION" },
        { name: "Venture & Product Lead", code: "ROLE_PRODUCT_LEAD" },
        { name: "Embedded Firmware Engineer", code: "ROLE_EMBEDDED" },
        { name: "Business Systems Analyst", code: "ROLE_CSBS_ANALYST" },
    ];

    for (const r of rolesData) {
        await prisma.interestedRole.upsert({
            where: { code: r.code },
            update: { name: r.name },
            create: { name: r.name, code: r.code },
        });
    }

    // 9. WI-FI WHITELIST & SPECIAL ACTIVITY
    await prisma.wifiWhitelist.upsert({
        where: { id: "wifi-sub-main" },
        update: {},
        create: {
            id: "wifi-sub-main",
            name: "Institutional SOI Lab Subnet (5GHz)",
            ipAddressOrSubnet: "192.168.1.0/24",
            description: "Primary lab router for 3-tier attendance verification",
            isActive: true,
        },
    });

    await prisma.specialActivityConfig.upsert({
        where: { id: "special-act-config" },
        update: {},
        create: {
            id: "special-act-config",
            startTime: "16:30",
            description: "Evening Special Activity Threshold Window",
        },
    });

    // 10. SUPER ADMIN ACCOUNT
    const defaultPasswordHash = bcrypt.hashSync("Sindhanai@2026", 10);

    await prisma.user.upsert({
        where: { email: "superadmin@sindhanai.in" },
        update: {
            passwordHash: defaultPasswordHash,
        },
        create: {
            name: "Super Administrator",
            email: "superadmin@sindhanai.in",
            roleId: superAdminRole.id,
            passwordHash: defaultPasswordHash,
            mustChangePassword: false,
        },
    });

    console.log("👤 Created Super Admin (superadmin@sindhanai.in)");

    // 11. GENERATE 1 ADMIN & 10 INSTRUCTORS & 10 STUDENTS PER LAB (9 LABS)
    let studentCount = 0;
    let instructorCount = 0;
    let adminCount = 0;

    for (let labIdx = 0; labIdx < createdLabs.length; labIdx++) {
        const lab = createdLabs[labIdx];
        const dept = createdDepartments[labIdx % createdDepartments.length];
        const placementTrack = createdPlacements[labIdx % createdPlacements.length];
        const batch = createdBatches[labIdx % createdBatches.length];
        const academicYr = createdAcademicYears[labIdx % createdAcademicYears.length];

        // A. Create Lab Admin (1 per lab)
        const adminEmail = `admin.${lab.short}@sindhanai.in`;
        await prisma.user.upsert({
            where: { email: adminEmail },
            update: {},
            create: {
                name: `${lab.name} Admin`,
                email: adminEmail,
                roleId: adminRole.id,
                soiDomainId: lab.id,
                departmentId: dept.id,
                designation: `${lab.name} Lab Administrator`,
                mustChangePassword: false,
            },
        });
        adminCount++;

        // B. Create Instructors (10 per lab)
        for (let i = 1; i <= 10; i++) {
            const instEmail = `instructor.${lab.short}.${i}@sindhanai.in`;
            await prisma.user.upsert({
                where: { email: instEmail },
                update: {},
                create: {
                    name: `Mentor ${i} - ${lab.name}`,
                    email: instEmail,
                    roleId: instructorRole.id,
                    soiDomainId: lab.id,
                    departmentId: dept.id,
                    designation: `Senior Technical Mentor (${lab.name})`,
                    experienceYears: 3 + i,
                    mustChangePassword: false,
                },
            });
            instructorCount++;
        }

        // C. Create Students (10 per lab)
        for (let s = 1; s <= 10; s++) {
            const studEmail = `student.${lab.short}.${s}@sindhanai.in`;
            const rollNum = `2023${dept.code}${String(labIdx * 10 + s).padStart(3, "0")}`;
            const regNum = `713523${dept.code}${String(labIdx * 10 + s).padStart(4, "0")}`;
            const section = createdSections[s % createdSections.length];
            const slotTiming = createdSlotTimings[s % createdSlotTimings.length];

            // Assign placement track to first 6 students, leave last 4 unallocated to demonstrate optional placement
            const domainPlacementId = s <= 6 ? placementTrack.id : null;

            await prisma.user.upsert({
                where: { email: studEmail },
                update: {},
                create: {
                    name: `Student ${s} (${lab.short.toUpperCase()})`,
                    email: studEmail,
                    personalEmail: `student.${lab.short}.${s}.personal@gmail.com`,
                    rollNumber: rollNum,
                    registrationNumber: regNum,
                    roleId: studentRole.id,
                    soiDomainId: lab.id,
                    departmentId: dept.id,
                    batchId: batch.id,
                    academicYearId: academicYr.id,
                    classGroupId: section.id,
                    slotTimingId: slotTiming.id,
                    domainPlacementId,
                    yearOfPassing: batch.endYear,
                    mobileNumber: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
                    tenthPercentage: parseFloat((75 + Math.random() * 20).toFixed(2)),
                    twelfthPercentage: parseFloat((75 + Math.random() * 20).toFixed(2)),
                    currentCgpa: parseFloat((7.0 + Math.random() * 2.8).toFixed(2)),
                    residentialStatus: s % 2 === 0 ? "Hosteller" : "Dayscholar",
                    githubUrl: `https://github.com/student-${lab.short}-${s}`,
                    linkedinUrl: `https://linkedin.com/in/student-${lab.short}-${s}`,
                    leetcodeUrl: `https://leetcode.com/u/student-${lab.short}-${s}`,
                    kaggleUrl: `https://kaggle.com/student-${lab.short}-${s}`,
                    passwordHash: defaultPasswordHash,
                    mustChangePassword: true,
                },
            });
            studentCount++;
        }
    }

    console.log(`✅ Seeded ${adminCount} Lab Admins`);
    console.log(`✅ Seeded ${instructorCount} Lab Instructors across 9 SOI Labs`);
    console.log(`✅ Seeded ${studentCount} Enrolled Students across 9 SOI Labs`);
    console.log("🚀 Comprehensive Institutional DB Seeding Completed Successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
