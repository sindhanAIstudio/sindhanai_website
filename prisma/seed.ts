import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
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

    // 6. Seed Gallery Items
    await prisma.galleryItem.deleteMany();
    await prisma.galleryItem.createMany({
        data: [
            {
                title: "Generative AI Lab Sprint",
                category: "Lab Sessions",
                imageUrl: "/logo.png",
                eventDate: "August 2026",
            },
            {
                title: "Hands-on Student Hackathon",
                category: "Hackathons",
                imageUrl: "/logo.png",
                eventDate: "July 2026",
            },
            {
                title: "Faculty Upskilling Workshop",
                category: "Workshops",
                imageUrl: "/logo.png",
                eventDate: "June 2026",
            },
        ],
    });

    console.log("Database seeded successfully!");
}

main()
    .catch((e) => {
        console.error("Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
