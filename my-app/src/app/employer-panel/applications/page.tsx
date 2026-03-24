import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, SearchX, Briefcase, ArrowLeft } from "lucide-react";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const { jobId } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let query = supabase
    .from("applications")
    .select(
      `
      id,
      created_at,
      status,
      jobs!fk_app_job!inner ( title, employer_id ),
      profiles!fk_app_user ( username, email )
    `,
    )
    .eq("jobs.employer_id", user.id)
    .order("created_at", { ascending: false });

  if (jobId) {
    query = query.eq("job_id", jobId);
  }

  const { data: applications, error } = await query;

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Błąd pobierania aplikacji:", error);
    }
  }

  let filterTitle = null;
  if (jobId && applications && applications.length > 0) {
    const jobInfo = Array.isArray(applications[0].jobs)
      ? applications[0].jobs[0]
      : (applications[0].jobs as any);
    filterTitle = jobInfo?.title;
  }

  const tableHeaderStyles =
    "p-4 font-bold text-gray-600 uppercase tracking-wider text-xs";

  return (
    <section className="p-8 w-full max-w-7xl mx-auto bg-gray-50">
      <header className="flex justify-between items-end mb-8">
        <div>
          <Link
            href="/employer-panel/jobs"
            className="hover:underline flex items-center mb-2 gap-2 font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć do ogłoszeń
          </Link>
          <h1 className="text-3xl font-bold">Zgłoszenia kandydatów</h1>
          <p className="mt-1">
            {filterTitle ? (
              <span>
                Aplikacje tylko dla: <strong>{filterTitle}</strong>
              </span>
            ) : (
              "Przeglądaj wszystkie aplikacje na Twoje ogłoszenia"
            )}
          </p>
        </div>
        {jobId && (
          <Link
            href="/employer-panel/applications"
            className="text-sm bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded transition-colors font-medium"
          >
            Pokaż wszystkie
          </Link>
        )}
      </header>

      {!applications || applications.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-16 flex flex-col items-center justify-center text-center">
          <SearchX className="w-12 h-12 mb-4" />
          <p className="text-xl font-medium  mb-2">Brak zgłoszeń</p>
          <p>
            {jobId
              ? "Nikt jeszcze nie zaaplikował na to stanowisko"
              : "Nie masz jeszcze żadnych aplikacji od kandydatów"}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100/50">
                  <th className={tableHeaderStyles}>Kandydat</th>
                  <th className={tableHeaderStyles}>Stanowisko</th>
                  <th className={tableHeaderStyles}>Data aplikacji</th>
                  <th className={tableHeaderStyles}>Status</th>
                  <th className={`${tableHeaderStyles} text-right`}>Akcja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => {
                  const jobInfo = Array.isArray(app.jobs)
                    ? app.jobs[0]
                    : (app.jobs as any);
                  const profileInfo = Array.isArray(app.profiles)
                    ? app.profiles[0]
                    : (app.profiles as any);

                  let statusBadge = "bg-gray-100 border-gray-200";
                  if (app.status === "submitted")
                    statusBadge =
                      "bg-yellow-100 text-yellow-800! border-yellow-200";
                  if (app.status === "accepted")
                    statusBadge =
                      "bg-green-100 text-green-800! border-green-200";
                  if (app.status === "rejected")
                    statusBadge = "bg-red-100 text-red-800 border-red-200";

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-bold ">
                          {profileInfo?.username || "Nieznany"}
                        </p>
                        <p className="text-xs">
                          {profileInfo?.email || "Brak emaila"}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          <span className="font-medium">
                            {jobInfo?.title || "Nieznane stanowisko"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm ">
                        {new Date(app.created_at).toLocaleDateString("pl-PL", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-4">
                        <span
                          className={`border px-2 py-1 rounded text-xs uppercase font-bold tracking-wider ${statusBadge}`}
                        >
                          {app.status === "submitted" ? "Nowe" : app.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/employer-panel/applications/${app.id}`}
                          className="inline-flex items-center gap-1 bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm font-medium transition-colors"
                        >
                          Szczegóły <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
