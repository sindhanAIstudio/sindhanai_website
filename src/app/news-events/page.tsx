import { prisma } from "@/lib/prisma";
import NewsEventsClientView from "./NewsEventsClientView";

export const revalidate = 0;

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
