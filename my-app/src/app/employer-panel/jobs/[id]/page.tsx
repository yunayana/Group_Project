import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { EditJobForm } from "@/app/employer-panel/jobs/[id]/_components/EditJobForm";
import { ArrowLeft } from "lucide-react";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !job || job.employer_id !== user.id) {
    redirect("/employer-panel/jobs");
  }

  return (
    <section className="p-8 w-full max-w-3xl mx-auto bg-gray-50">
      <header className="mb-8">
        <Link
          href="/employer-panel/jobs"
          className="hover:underline mb-4 gap-2 font-medium flex items-center"
        >
          <ArrowLeft className="w-4 h-4" />
          Wróć do ogłoszeń
        </Link>
        <h1 className="text-3xl font-bold">Edytuj ogłoszenie</h1>
        <p className="mt-2 ">
          Wprowadź zmiany w ofercie:{" "}
          <span className="font-bold">{job.title}</span>
        </p>
      </header>

      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <EditJobForm job={job} />
      </div>
    </section>
  );
}
