import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  ChevronRight,
} from "lucide-react";
import { SearchFilters } from "./_components/SearchFilters"; // <--- Importujemy wyszukiwarkę

export default async function JobsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; location?: string }>;
}) {
  const { q, location } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("jobs")
    .select(
      "id, title, company, location, salary_from, salary_to, employment_type, tags, created_at, slug",
    )
    .eq("is_published", true)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (q) query = query.or(`title.ilike.%${q}%,company.ilike.%${q}%`);
  if (location) query = query.ilike("location", `%${location}%`);

  const { data: jobs, error } = await query;

  if (error && process.env.NODE_ENV === "development") {
    console.error("Błąd pobierania publicznych ofert:", error);
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">
          Najnowsze Oferty Pracy
        </h1>
        <p className="text-lg mt-2 text-gray-600">
          Znajdź swoją wymarzoną pracę i zaaplikuj w kilka sekund
        </p>
      </header>

      <SearchFilters />

      {!jobs || jobs.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-16 text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-xl font-medium">
            Obecnie brak aktywnych ofert spełniających kryteria
          </p>
          <p className="mt-2 ">Spróbuj zmienić parametry wyszukiwania.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex-1">
                <h2 className="text-xl font-bold  group-hover:text-blue-600 transition-colors">
                  {job.title}
                </h2>
                <p className="font-medium mb-4">{job.company}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm mb-4 md:mb-0">
                  <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                    <MapPin className="w-4 h-4 " /> {job.location}
                  </span>
                  <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                    <Briefcase className="w-4 h-4" /> {job.employment_type}
                  </span>

                  {(job.salary_from || job.salary_to) && (
                    <span className="flex items-center gap-1.5 font-bold text-green-700 bg-green-50 border border-green-100 px-2 py-1 rounded">
                      <DollarSign className="w-4 h-4" />
                      {job.salary_from ? `${job.salary_from}` : ""}
                      {job.salary_from && job.salary_to ? " - " : ""}
                      {job.salary_to ? `${job.salary_to} PLN` : " PLN"}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:items-end justify-between min-w-50 h-full">
                <div className="flex flex-wrap md:justify-end gap-2 mb-4 md:mb-0">
                  {job.tags &&
                    job.tags.slice(0, 3).map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="bg-blue-50  px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  {job.tags && job.tags.length > 3 && (
                    <span className="bg-gray-100 px-2.5 py-1 rounded text-xs font-bold">
                      +{job.tags.length - 3}
                    </span>
                  )}
                </div>

                <span className="flex items-center gap-1 text-sm text-gray-400 font-medium">
                  <Clock className="w-4 h-4" />
                  {new Date(job.created_at).toLocaleDateString("pl-PL")}
                  <ChevronRight className="w-5 h-5 ml-3 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
