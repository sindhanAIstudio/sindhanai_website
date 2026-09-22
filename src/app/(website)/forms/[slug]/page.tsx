import { Suspense } from "react";
import PublicFormClient from "./PublicFormClient";
import { Spinner } from "@phosphor-icons/react/dist/ssr";

export default async function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4">
                    <div className="space-y-3 text-center">
                        <Spinner className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                        <p className="text-xs text-slate-500 font-medium">Loading Form...</p>
                    </div>
                </div>
            }
        >
            <PublicFormClient slug={slug} />
        </Suspense>
    );
}
