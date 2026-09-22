import { prisma } from "../lib/prisma";

async function main() {
    console.log("Truncating all academic syllabus, mini projects, daily plans, and subject data...");

    await prisma.scopeDailyPlan.deleteMany({});
    await prisma.syllabusItem.deleteMany({});
    await prisma.miniProjectSyllabus.deleteMany({});
    await prisma.subject.deleteMany({});

    console.log("All subject and syllabus data truncated cleanly!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
