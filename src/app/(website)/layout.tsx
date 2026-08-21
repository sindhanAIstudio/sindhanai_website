import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function WebsiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
        </>
    );
}
