import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Eye,
  ArrowRight,
  Map,
  DollarSign,
  Calendar,
  Users,
} from "lucide-react";
import { DeleteButton } from "@/app/employer-panel/jobs/_components/delete-button";

export default async function EmployerJobsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("employer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <section className="p-8 w-full max-w-7xl mx-auto bg-gray-50">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Moje Ogłoszenia</h1>
          <p className="mt-1">
            Zarządzaj swoimi ofertami pracy i śledź zainteresowanie
          </p>
        </div>
        <Link
          href="/employer-panel/jobs/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
        >
          <Plus className="w-5 h-5" /> Dodaj ogłoszenie
        </Link>
      </header>

      {!jobs || jobs.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <p className="mb-4 text-lg">
            Nie opublikowałeś jeszcze żadnego ogłoszenia.
          </p>
          <Link
            href="/employer-panel/jobs/new"
            className="font-bold hover:underline flex items-center justify-center"
          >
            Stwórz swoją pierwszą ofertę teraz{" "}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold">{job.title}</h2>
                  <span className="bg-blue-50  text-xs uppercase font-bold px-2 py-0.5 rounded border border-blue-100">
                    {job.employment_type || "B2B"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm ">
                  <span className="flex items-center gap-2">
                    <Map className="w-4 h-4" /> {job.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {job.salary_from && job.salary_to
                      ? `${job.salary_from} - ${job.salary_to} PLN`
                      : "Nie podano wynagrodzenia"}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(job.created_at).toLocaleDateString("pl-PL")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 pr-4 border-l border-gray-100 pl-6 h-full">
                <div className="text-center">
                  <p className="text-2xl font-bold ">{job.views || 0}</p>
                  <p className="text-xs uppercase font-bold">Wyświetleń</p>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                <Link
                  href={`/jobs/${job.id}`}
                  target="_blank"
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 p-2 text-gray-600! hover:bg-gray-100! rounded-lg transition-colors border border-gray-200"
                  title="Podgląd oferty"
                >
                  <Eye className="w-5 h-5" />
                </Link>

                <Link
                  href={`/employer-panel/applications?jobId=${job.id}`}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 p-2 text-emerald-600! hover:bg-emerald-50! rounded-lg transition-colors border border-emerald-100"
                  title="Przeglądaj aplikacje"
                >
                  <Users className="w-5 h-5" />
                </Link>

                <Link
                  href={`/employer-panel/jobs/${job.id}`}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 p-2 text-blue-600! hover:bg-blue-50! rounded-lg transition-colors border border-blue-100"
                  title="Edytuj"
                >
                  <Pencil className="w-5 h-5" />
                </Link>

                <DeleteButton jobId={job.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
