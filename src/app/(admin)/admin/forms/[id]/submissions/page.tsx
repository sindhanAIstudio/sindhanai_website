import { Suspense } from "react";
import FormSubmissionsConsoleClient from "./FormSubmissionsConsoleClient";
import { Spinner } from "@phosphor-icons/react/dist/ssr";

export default async function FormSubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <Suspense
            fallback={
                <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
                    <Spinner className="w-8 h-8 text-indigo-400 animate-spin" />
                    <p className="text-xs text-slate-400 font-medium">Loading Form Submissions...</p>
                </div>
            }
        >
            <FormSubmissionsConsoleClient formId={id} />
        </Suspense>
    );
}
