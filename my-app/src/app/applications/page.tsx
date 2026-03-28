"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// 🔹 Типы
type Status = "submitted" | "accepted" | "rejected";

type Application = {
  id: string;
  job_id: string;
  created_at: string;
  status: Status | null;
  expected_salary?: string | null;
  start_date?: string | null;
  cv_url?: string | null;
  cv_text?: string | null;
};

type Job = {
  id: string;
  title: string;
  company: string;
  location?: string | null;
};

// 🔹 Конфиг статусов
const statusConfigMap: Record<
  Status,
  { icon: string; label: string; bg: string; text: string }
> = {
  submitted: {
    icon: "⏳",
    label: "Wysłane",
    bg: "bg-yellow-100",
    text: "text-yellow-800",
  },
  accepted: {
    icon: "✅",
    label: "Zaakceptowane",
    bg: "bg-green-100",
    text: "text-green-800",
  },
  rejected: {
    icon: "❌",
    label: "Odrzucone",
    bg: "bg-red-100",
    text: "text-red-800",
  },
};

export default function ApplicationsPage() {
  const [user, setUser] = useState<any | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobsMap, setJobsMap] = useState<Record<string, Job>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getUser();
        const current = data?.user ?? null;

        if (!current) {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (mounted) setUser(current);

        const { data: appsData, error: appsError } = await supabase
          .from("applications")
          .select(
            "id, job_id, created_at, status, expected_salary, start_date, cv_url, cv_text",
          )
          .eq("user_id", current.id)
          .order("created_at", { ascending: false });

        if (appsError) throw appsError;

        const apps = (appsData ?? []) as Application[];
        if (mounted) setApplications(apps);

        const jobIds = Array.from(
          new Set(apps.map((a) => a.job_id).filter(Boolean)),
        );

        if (jobIds.length > 0) {
          const { data: jobsData, error: jobsError } = await supabase
            .from("jobs")
            .select("*")
            .in("id", jobIds);

          if (jobsError) throw jobsError;

          const map: Record<string, Job> = {};
          (jobsData ?? []).forEach((j: Job) => {
            map[j.id] = j;
          });

          if (mounted) setJobsMap(map);
        }

        if (mounted) setError(null);
      } catch (e: any) {
        console.error("Applications load error", e);
        if (mounted) setError(e?.message ?? JSON.stringify(e));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">📋 Moje aplikacje</h2>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8">
            <p className="text-blue-900 mb-4 text-lg">
              Aby zobaczyć swoje aplikacje, musisz być zalogowany
            </p>
            <button
              onClick={() => router.push("/login")}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              Zaloguj się
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 text-white">
          📋 Moje aplikacje
        </h2>
        <p className="text-white mb-8">
          Historia Twoich aplikacji na stanowiska
        </p>

        <div className="text-black">
          {error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              ❌ Błąd: {error}
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded text-center py-8">
              Nie dodałeś jeszcze żadnych aplikacji
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((a) => {
                const job = jobsMap[a.job_id];

                const status: Status = (a.status as Status) ?? "submitted";

                const statusConfig = statusConfigMap[status] ?? {
                  icon: "📝",
                  label: a.status ?? "unknown",
                  bg: "bg-gray-600",
                  text: "text-gray-200",
                };

                return (
                  <div
                    key={a.id}
                    className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-1">
                        {job ? (
                          <Link
                            href={`/jobs/${job.id}`}
                            className="text-black no-underline"
                          >
                            <h3 className="text-xl font-bold text-gray-900 hover:text-purple-600 transition mb-1">
                              📌 {job.title}
                            </h3>
                            <p className="text-gray-600 mb-3">
                              🏭 {job.company} • 📍 {job.location ?? "Zdalnie"}
                            </p>
                          </Link>
                        ) : (
                          <p className="text-sm text-gray-600 italic">
                            ⚠️ Oferta została usunięta
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                          {a.expected_salary && (
                            <div>
                              <span className="text-gray-600">💰 Pensja:</span>{" "}
                              <strong>{a.expected_salary}</strong>
                            </div>
                          )}
                          {a.start_date && (
                            <div>
                              <span className="text-gray-600">📅 Start:</span>{" "}
                              <strong>
                                {new Date(a.start_date).toLocaleDateString(
                                  "pl-PL",
                                )}
                              </strong>
                            </div>
                          )}
                        </div>

                        {(a.cv_url || a.cv_text) && (
                          <div className="mt-3 p-3 bg-purple-50 rounded border border-purple-200">
                            {a.cv_url && (
                              <a
                                href={a.cv_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-600 font-medium hover:underline flex items-center gap-1"
                              >
                                📎 Pobierz CV
                              </a>
                            )}
                            {a.cv_text && (
                              <p className="text-sm text-gray-700 mt-1">
                                {a.cv_text.length > 150
                                  ? a.cv_text.slice(0, 150) + "…"
                                  : a.cv_text}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-start md:items-end justify-between gap-3">
                        <div className="text-xs text-gray-500">
                          🕐{" "}
                          {new Date(a.created_at).toLocaleString("pl-PL", {
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>

                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${statusConfig.bg} ${statusConfig.text}`}
                        >
                          {statusConfig.icon} {statusConfig.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
