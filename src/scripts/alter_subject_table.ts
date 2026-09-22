import { prisma } from "../lib/prisma";

async function main() {
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE Subject ADD COLUMN isActive BOOLEAN DEFAULT 1;`);
        console.log("Added isActive column");
    } catch (e: any) {
        console.log("isActive column error/already exists:", e.message);
    }

    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE Subject ADD COLUMN deletedAt DATETIME;`);
        console.log("Added deletedAt column");
    } catch (e: any) {
        console.log("deletedAt column error/already exists:", e.message);
    }

    try {
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS Subject_name_key ON Subject(name);`);
        console.log("Created Subject_name_key index");
    } catch (e: any) {
        console.log("Subject_name_key index error:", e.message);
    }

    try {
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS Subject_code_key ON Subject(code);`);
        console.log("Created Subject_code_key index");
    } catch (e: any) {
        console.log("Subject_code_key index error:", e.message);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
