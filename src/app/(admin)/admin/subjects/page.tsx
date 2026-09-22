import SubjectManagementClient from "@/components/admin/SubjectManagementClient";

export const metadata = {
    title: "Subject Management — SCOPE Academic Engine",
    description: "Create and manage academic subjects for syllabus allocation and daily plans.",
};

export default function SubjectsPage() {
    return (
        <main className="max-w-7xl mx-auto space-y-6">
            <SubjectManagementClient />
        </main>
    );
}
