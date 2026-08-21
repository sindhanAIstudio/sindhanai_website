import { prisma } from "../src/lib/prisma";

async function main() {
    const tables = [
        "Department",
        "ClassGroup",
        "SlotTiming",
        "SoiDomain",
        "DomainPlacement",
        "Batch",
        "AcademicYear",
        "InterestedRole",
    ];

    for (const table of tables) {
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT 1;`);
            console.log(`Added isActive to ${table}`);
        } catch (e: any) {
            console.log(`isActive already exists in ${table}`);
        }

        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ADD COLUMN "deletedAt" DATETIME;`);
            console.log(`Added deletedAt to ${table}`);
        } catch (e: any) {
            console.log(`deletedAt already exists in ${table}`);
        }
    }

    console.log("Metadata columns migration complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
