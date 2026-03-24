import { InformationBoxes } from "@/app/employer-panel/_components/information-boxes";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function EmployerDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  if (profile?.role !== "employer") {
    redirect("/");
  }

  const { count: jobsCount } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("employer_id", user.id);

  const { count: newAppsCount } = await supabase
    .from("applications")
    .select("*, jobs!inner(employer_id)", { count: "exact", head: true })
    .eq("jobs.employer_id", user.id)
    .eq("status", "submitted");

  const { data: jobViews } = await supabase
    .from("jobs")
    .select("views")
    .eq("employer_id", user.id);

  const totalViews =
    jobViews?.reduce((sum, job) => sum + (job.views || 0), 0) || 0;

  const { data: recentApplications } = await supabase
    .from("applications")
    .select("id, created_at, status, jobs!inner(title, employer_id)")
    .eq("jobs.employer_id", user.id)
    .eq("status", "submitted")
    .order("created_at", { ascending: false })
    .limit(5);

  const boxes = [
    {
      id: "active-jobs",
      text: "Aktywne ogłoszenia",
      value: jobsCount || 0,
    },
    {
      id: "new-apps",
      text: "Nowe aplikacje",
      value: newAppsCount || 0,
    },
    {
      id: "views",
      text: "Wyświetlenia",
      value: totalViews,
    },
  ];

  const tableHeaderStyles = "p-4 font-medium text-gray-600";

  return (
    <section className="p-8 w-full bg-gray-50 h-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Przegląd Panelu</h1>
        <p className="mt-2">
          Witaj, {user.email}. Oto podsumowanie Twoich rekrutacji.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {boxes.map((box) => (
          <InformationBoxes key={box.id} text={box.text} value={box.value} />
        ))}
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 border-b border-gray-800 pb-2">
          Akcje
        </h2>
        <div className="flex gap-4 flex-col sm:flex-row">
          <Link
            href="/employer-panel/jobs/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" /> Dodaj nowe ogłoszenie
          </Link>
          <Link
            href="/employer-panel/applications"
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-6 py-3 rounded font-medium transition-colors"
          >
            Przeglądaj ogłoszenia
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">
          Ostatnie zgłoszenia
        </h2>

        {!recentApplications || recentApplications.length === 0 ? (
          <p className="text-gray-500 py-4">Brak nowych zgłoszeń</p>
        ) : (
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100/50">
                  <th className={tableHeaderStyles}>Stanowisko</th>
                  <th className={tableHeaderStyles}>Data aplikacji</th>
                  <th className={tableHeaderStyles}>Status</th>
                  <th className={tableHeaderStyles}>Akcja</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => {
                  const jobInfo = Array.isArray(app.jobs)
                    ? app.jobs[0]
                    : app.jobs;
                  const jobTitle = jobInfo?.title || "Nieznane stanowisko";

                  return (
                    <tr
                      key={app.id}
                      className="border-b border-gray-100 hover:bg-green-200 transition-colors"
                    >
                      <td className="p-4 font-medium">{jobTitle}</td>
                      <td className="p-4 text-gray-500">
                        {new Date(app.created_at).toLocaleDateString("pl-PL", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4">
                        <span className="bg-yellow-100 border border-yellow-200 px-2 py-1 rounded text-sm uppercase font-semibold">
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/employer-panel/applications/${app.id}`}
                          className="flex items-center gap-1 hover:text-blue-800 transition-colors text-sm font-medium text-red-900"
                        >
                          Zobacz szczegóły <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
