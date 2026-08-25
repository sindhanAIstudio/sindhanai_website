import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🧹 Starting Complete Institutional Database Truncation...");

    // 1. Delete Operational Attendance & Worklog Data
    const delAttendance = await prisma.attendanceRecord.deleteMany();
    console.log(`- Deleted ${delAttendance.count} Attendance Records`);

    const delSessions = await prisma.classroomSession.deleteMany();
    console.log(`- Deleted ${delSessions.count} Classroom Sessions`);

    const delWorklogs = await prisma.facultyWorklog.deleteMany();
    console.log(`- Deleted ${delWorklogs.count} Faculty Worklogs`);

    const delCalendarEvents = await (prisma as any).calendarEvent.deleteMany();
    console.log(`- Deleted ${delCalendarEvents.count} Calendar Events`);

    // 2. Delete Student Profile Extensions & Skills
    const delSkills = await prisma.studentSkill.deleteMany();
    console.log(`- Deleted ${delSkills.count} Student Skills`);

    const delProfiles = await prisma.studentPlatformProfile.deleteMany();
    console.log(`- Deleted ${delProfiles.count} Student Platform Profiles`);

    // 3. Delete Public Content & Forms
    await prisma.eventRegistration.deleteMany();
    await prisma.event.deleteMany();
    await prisma.newsPost.deleteMany();
    await prisma.formSubmission.deleteMany();
    await prisma.dynamicForm.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.clientLogo.deleteMany();
    await prisma.galleryItem.deleteMany();

    // 4. Delete All User Accounts EXCLUDING Super Admin (superadmin@sindhanai.in)
    const delUsers = await prisma.user.deleteMany({
        where: {
            email: { not: "superadmin@sindhanai.in" },
        },
    });
    console.log(`- Deleted ${delUsers.count} User Accounts (Preserved Super Admin: superadmin@sindhanai.in)`);

    console.log("✨ Complete Database Truncation Finished! Only Super Admin account remains intact.");
}

main()
    .catch((e) => {
        console.error("❌ Reset Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
