"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  employment_type: string;
  is_remote: boolean;
  salary_from: number | null;
  salary_to: number | null;
  is_published: boolean;
  created_at: string;
  expires_at: string;
  posted_by: string;
}

type StatusFilter = "all" | "active" | "expired" | "unpublished";
type SortOrder = "newest" | "oldest";

export default function JobsHistory() {
  const supabase = createClient();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select(
        "id, title, company, location, employment_type, is_remote, salary_from, salary_to, is_published, created_at, expires_at, posted_by",
      )
      .order("created_at", { ascending: false });

    if (error) console.error("Błąd:", error);
    else setJobs((data || []) as Job[]);
    setLoading(false);
  };

  const getStatus = (job: Job) => {
    if (!job.is_published) return "Nieopublikowane";
    if (job.expires_at && new Date(job.expires_at) < new Date())
      return "Wygaśnięte";
    return "Aktywne";
  };

  const togglePublish = async (job: Job) => {
    const first = window.confirm(
      job.is_published
        ? `Na pewno CHCESZ WYCOFAĆ ogłoszenie "${job.title}"?`
        : `Na pewno CHCESZ OPUBLIKOWAĆ ogłoszenie "${job.title}"?`,
    );
    if (!first) return;

    try {
      setActionLoadingId(job.id);
      const { error } = await supabase
        .from("jobs")
        .update({ is_published: !job.is_published })
        .eq("id", job.id);

      if (error) {
        console.error("Błąd publikowania:", error);
        return;
      }

      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id ? { ...j, is_published: !job.is_published } : j,
        ),
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const deleteJob = async (job: Job) => {
    const first = window.confirm(
      `Czy NA PEWNO chcesz trwale usunąć ogłoszenie "${job.title}"?`,
    );
    if (!first) return;
    const second = window.confirm(
      "To działanie jest nieodwracalne. Potwierdź.",
    );
    if (!second) return;

    try {
      setActionLoadingId(job.id);

      // Najpierw usuń powiązane aplikacje
      const { error: appsError } = await supabase
        .from("applications")
        .delete()
        .eq("job_id", job.id);

      if (appsError) {
        console.error("Błąd usuwania aplikacji:", appsError);
        alert("Błąd usuwania - nie udało się usunąć powiązanych aplikacji");
        setActionLoadingId(null);
        return;
      }

      // Potem usuń ogłoszenie
      const { error: jobError } = await supabase
        .from("jobs")
        .delete()
        .eq("id", job.id);

      if (jobError) {
        console.error("Błąd usuwania ogłoszenia:", jobError);
        alert(`Błąd usuwania ogłoszenia: ${jobError.message}`);
        return;
      }

      setJobs((prev) => prev.filter((j) => j.id !== job.id));
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredJobs = jobs
    .filter((job) => {
      const status = getStatus(job);
      if (statusFilter === "active") return status === "Aktywne";
      if (statusFilter === "expired") return status === "Wygaśnięte";
      if (statusFilter === "unpublished") return status === "Nieopublikowane";
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

  if (loading)
    return <div className="text-center py-12">Ładowanie ogłoszeń...</div>;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold text-gray-900">
          Historia ogłoszeń ({filteredJobs.length}/{jobs.length})
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Wszystkie statusy</option>
            <option value="active">Aktywne</option>
            <option value="expired">Wygaśnięte</option>
            <option value="unpublished">Nieopublikowane</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="newest">Najnowsze najpierw</option>
            <option value="oldest">Najstarsze najpierw</option>
          </select>
        </div>
      </div>

      {/* Desktop view - table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Tytuł
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                Firma
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                Lokalizacja
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                Typ
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                Pensja
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                Data
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredJobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-md truncate">
                  {job.title}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {job.company}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {job.is_remote ? "🌐 Zdalnie" : job.location}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {job.employment_type}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {job.salary_from
                    ? `${job.salary_from} - ${
                        job.salary_to || "do negocjacji"
                      } zł`
                    : "Nie podano"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      getStatus(job) === "Aktywne"
                        ? "bg-green-100 text-green-800"
                        : getStatus(job) === "Wygaśnięte"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {getStatus(job)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(job.created_at).toLocaleDateString("pl-PL")}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 space-x-2 whitespace-nowrap">
                  <button
                    onClick={() => togglePublish(job)}
                    disabled={actionLoadingId === job.id}
                    className={
                      job.is_published
                        ? "px-3 py-1 text-xs rounded bg-yellow-500 text-white hover:bg-yellow-600"
                        : "px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
                    }
                  >
                    {job.is_published ? "Wycofaj" : "Publikuj"}
                  </button>
                  <button
                    onClick={() => deleteJob(job)}
                    disabled={actionLoadingId === job.id}
                    className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view - cards */}
      <div className="md:hidden space-y-4">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 break-words text-base">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-600">{job.company}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                    getStatus(job) === "Aktywne"
                      ? "bg-green-100 text-green-800"
                      : getStatus(job) === "Wygaśnięte"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {getStatus(job)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Lokalizacja</span>
                  <p className="font-medium text-gray-900">
                    {job.is_remote ? "🌐 Zdalnie" : job.location}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Typ</span>
                  <p className="font-medium text-gray-900">{job.employment_type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Pensja</span>
                  <p className="font-medium text-gray-900">
                    {job.salary_from
                      ? `${job.salary_from} - ${job.salary_to || "neg."} zł`
                      : "Nie podano"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Data</span>
                  <p className="font-medium text-gray-900">
                    {new Date(job.created_at).toLocaleDateString("pl-PL")}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 flex-wrap">
                <button
                  onClick={() => togglePublish(job)}
                  disabled={actionLoadingId === job.id}
                  className={
                    job.is_published
                      ? "flex-1 px-3 py-2 text-xs rounded bg-yellow-500 text-white hover:bg-yellow-600"
                      : "flex-1 px-3 py-2 text-xs rounded bg-green-600 text-white hover:bg-green-700"
                  }
                >
                  {job.is_published ? "Wycofaj" : "Publikuj"}
                </button>
                <button
                  onClick={() => deleteJob(job)}
                  disabled={actionLoadingId === job.id}
                  className="flex-1 px-3 py-2 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Usuń
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
