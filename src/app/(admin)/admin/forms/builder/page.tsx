import { Suspense } from "react";
import FormBuilderStudioClient from "./FormBuilderStudioClient";
import { Spinner } from "@phosphor-icons/react/dist/ssr";

export default function FormBuilderStudioPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
                    <Spinner className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-xs text-slate-500 font-medium">Loading Form Studio Canvas...</p>
                </div>
            }
        >
            <FormBuilderStudioClient />
        </Suspense>
    );
}
