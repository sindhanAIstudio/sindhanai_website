import { prisma } from "../lib/prisma";

async function main() {
    const subjects = await prisma.subject.findMany();
    console.log("Subjects list:", subjects);

    // Update any duplicate or null code to ensure uniqueness
    const seenCodes = new Set<string>();
    for (const sub of subjects) {
        let code = sub.code?.trim().toUpperCase();
        if (!code || seenCodes.has(code)) {
            code = `SUBJ_${sub.id.slice(0, 6).toUpperCase()}`;
            await prisma.subject.update({
                where: { id: sub.id },
                data: { code },
            });
            console.log(`Updated subject ${sub.name} code to ${code}`);
        }
        seenCodes.add(code);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
