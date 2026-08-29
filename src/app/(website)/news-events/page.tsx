import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import NewsEventsClientView from "./NewsEventsClientView";

export const revalidate = 0;

export const metadata: Metadata = {
    title: "News, Events & Gallery — SindhanAI",
    description: "Stay updated with the latest AI workshops, research hackathons, technical events, and achievements at KGiSL Institute of Technology.",
    openGraph: {
        title: "News, Events & Gallery | SindhanAI",
        description: "Latest news, tech events, and achievements from SindhanAI at KGiSL Institute of Technology.",
        images: ["/sindhanai-logo.png"]
    }
};

export default async function NewsEventsPage() {
    const initialNews = await prisma.newsPost.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
    });

    const initialEvents = await prisma.event.findMany({
        orderBy: { createdAt: "desc" },
    });

    const initialGallery = await prisma.galleryItem.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <NewsEventsClientView
            initialNews={initialNews}
            initialEvents={initialEvents}
            initialGallery={initialGallery}
        />
    );
}
