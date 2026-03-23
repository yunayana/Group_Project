"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function JobDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [applying, setApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [expectedSalary, setExpectedSalary] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const fetchJob = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();
      if (!mounted) return;
      if (error) {
        setError(error.message ?? String(error));
        setJob(null);
      } else {
        setJob(data ?? null);
        setError(null);

        // Inkrementuj views
        if (data?.id) {
          try {
            const currentViews = data?.views ?? 0;
            const { error: updateError } = await supabase
              .from("jobs")
              .update({ views: currentViews + 1 })
              .eq("id", data.id);
            if (updateError) {
              console.error("Error incrementing views:", updateError);
            }
          } catch (err) {
            console.error("Error incrementing views:", err);
          }
        }
      }
      setLoading(false);
    };
    fetchJob();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Ładowanie oferty...</div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Błąd: {error}</div>
      </div>
    );

  if (!job)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Nie znaleziono oferty.</div>
      </div>
    );

  const createdAt = job.created_at
    ? new Date(job.created_at).toLocaleString()
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-purple-100">
            <span className="text-lg">{job.company}</span>
            <span>•</span>
            <span className="text-lg">{job.location ?? "Zdalnie"}</span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Główna zawartość */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
              <div className="flex flex-wrap gap-2 mb-6 items-center">
                {job.employment_type && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {job.employment_type}
                  </span>
                )}
                {job.is_remote && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    🌐 Zdalnie
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                O tej ofercie
              </h2>
              <div className="prose prose-sm max-w-none text-gray-700 mb-8 leading-relaxed">
                {job.description || "Brak opisu"}
              </div>

              {job.tags && Array.isArray(job.tags) && job.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Wymagane umiejętności
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((t: string) => (
                      <span
                        key={t}
                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Formularz aplikacji */}
            {!showApplyForm ? (
              <div className="text-center py-8">
                <button
                  onClick={() => setShowApplyForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow text-lg"
                >
                  Aplikuj na tę ofertę
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Twoja aplikacja
                </h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!job) return;
                    setSubmitting(true);
                    const { data: userData } = await supabase.auth.getUser();
                    const user = userData?.user ?? null;
                    if (!user) {
                      setSubmitting(false);
                      router.push("/login");
                      return;
                    }

                    let cv_url: string | null = null;
                    try {
                      if (cvFile) {
                        const path = `${user.id}/${Date.now()}_${cvFile.name}`;
                        const upload = await supabase.storage
                          .from("cvs")
                          .upload(path, cvFile, {
                            cacheControl: "3600",
                            upsert: false,
                          });
                        if (upload.error) {
                          console.warn("CV upload error", upload.error);
                        } else {
                          const { data: publicUrlData } = supabase.storage
                            .from("cvs")
                            .getPublicUrl(path);
                          cv_url = publicUrlData?.publicUrl ?? null;
                        }
                      }

                      const payload: any = {
                        job_id: job.id,
                        user_id: user.id,
                        expected_salary: expectedSalary || null,
                        start_date: startDate || null,
                        cv_url: cv_url,
                        cv_text: cvText || null,
                        created_at: new Date().toISOString(),
                      };

                      const { error: insertError } = await supabase
                        .from("applications")
                        .insert(payload);
                      if (insertError) throw insertError;
                      router.push("/applications");
                    } catch (err: any) {
                      console.error("Apply error", err);
                      const errMsg = err?.message ?? JSON.stringify(err);
                      alert(
                        "Wystąpił błąd podczas wysyłania aplikacji: " + errMsg,
                      );
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Oczekiwana pensja
                    </label>
                    <input
                      type="text"
                      value={expectedSalary}
                      onChange={(e) => setExpectedSalary(e.target.value)}
                      placeholder="np. 8000 PLN"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kiedy możesz zacząć
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dodaj CV (plik PDF/DOCX)
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                      accept=".pdf,.doc,.docx"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lub wklej CV / link do profilu
                    </label>
                    <textarea
                      value={cvText}
                      onChange={(e) => setCvText(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
                      placeholder="Możesz wkleić link do CV lub krótki tekst o sobie"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg disabled:from-gray-400 disabled:to-gray-400 transition-shadow"
                    >
                      {submitting ? "⏳ Wysyłanie..." : "✓ Wyślij aplikację"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApplyForm(false)}
                      disabled={submitting}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
                    >
                      Anuluj
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-lg text-gray-900 mb-6">
                Szczegóły oferty
              </h3>

              {job.salary_from || job.salary_to ? (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Wynagrodzenie
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {job.salary_from && job.salary_to
                      ? `${job.salary_from}–${job.salary_to} PLN`
                      : job.salary_from
                        ? `od ${job.salary_from} PLN`
                        : `do ${job.salary_to} PLN`}
                  </div>
                </div>
              ) : null}

              {job.contact_email ? (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Kontakt
                  </div>
                  <a
                    href={`mailto:${job.contact_email}`}
                    className="text-purple-600 hover:text-purple-700 font-semibold break-all"
                  >
                    {job.contact_email}
                  </a>
                </div>
              ) : null}

              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Opublikowano
                </div>
                <div className="text-sm text-gray-700">{createdAt ?? "—"}</div>
              </div>

              {job.expires_at && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Wygasa
                  </div>
                  <div className="text-sm text-gray-700">
                    {new Date(job.expires_at).toLocaleString()}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Wyświetlenia
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {job.views ?? 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
