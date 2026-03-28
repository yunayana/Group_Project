"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const supabase = createClient();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(200);

      if (!mounted) return;
      if (error) {
        console.error("Error fetching jobs:", error, JSON.stringify(error));
        setFetchError(error?.message ?? JSON.stringify(error));
        setJobs([]);
      } else {
        setFetchError(null);
        setJobs(data ?? []);
      }
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Przywrócone stałe kategorie — kliknięcie pokaże oferty z danej kategorii
  const categories = useMemo(() => {
    return [
      "Wszystkie",
      "Sprzedaż",
      "Marketing",
      "Finanse",
      "Bankowość",
      "Inżynieria",
      "Obsługa klienta",
    ];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const loc = locationQuery.trim().toLowerCase();
    return jobs.filter((j) => {
      if (category && category !== "Wszystkie") {
        const hasCategory =
          (j.category && j.category === category) ||
          (Array.isArray(j.tags) && j.tags.includes(category));
        if (!hasCategory) return false;
      }
      if (q) {
        const match =
          String(j.title ?? "")
            .toLowerCase()
            .includes(q) ||
          String(j.company ?? "")
            .toLowerCase()
            .includes(q) ||
          String(j.description ?? "")
            .toLowerCase()
            .includes(q);
        if (!match) return false;
      }
      if (loc) {
        const matchLoc = String(j.location ?? "")
          .toLowerCase()
          .includes(loc);
        if (!matchLoc) return false;
      }
      return true;
    });
  }, [jobs, query, locationQuery, category]);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="hero-gradient rounded-2xl mx-6 my-8 p-8 md:p-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Zdobądź lepszą pracę. W nowym roku.
            </h1>
            <p className="text-gray-700 mb-6">
              Szukaj ofert, aplikuj i zarządzaj swoimi aplikacjami w jednym
              miejscu.
            </p>

            <div className="mt-4 flex items-center max-w-2xl mx-auto md:mx-0 gap-2">
              <input
                placeholder="Szukaj: Stanowisko, firma, słowo kluczowe"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 rounded-full p-3 border"
              />
              <input
                placeholder="Lokalizacja"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-48 rounded-full p-3 border"
              />
              <button
                onClick={() => {}}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full shadow-sm hover:shadow-lg transition-shadow font-medium"
              >
                Szukaj
              </button>
            </div>
          </div>

          <div className="hidden md:block flex-1">
            <img
              src="/images/glowna.gif"
              alt="Job Portal Hero"
              className="w-full h-56 object-cover rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        <h3 className="text-lg font-semibold mb-4">Kategorie</h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => {
            const isActive =
              category === cat || (cat === "Wszystkie" && category === null);
            return (
              <button
                key={cat}
                onClick={() =>
                  setCategory((prev) =>
                    cat === "Wszystkie" ? null : prev === cat ? null : cat,
                  )
                }
                className={`px-4 py-2 rounded-full text-sm ${isActive ? "bg-pink-200 text-black shadow-sm" : "bg-white text-black shadow-sm border"}`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        <h3 className="text-lg font-semibold mb-4">Oferty</h3>
        {loading ? (
          <p>Ładowanie ofert...</p>
        ) : fetchError ? (
          <div className="text-red-600">
            Błąd podczas pobierania ofert: {fetchError}
          </div>
        ) : filtered.length === 0 ? (
          <p>Brak ofert pasujących do wyszukiwania.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((job) => (
              <article
                key={job.id}
                className="p-4 bg-white rounded-lg shadow-sm"
              >
                <div>
                  <Link href={`/jobs/${job.id}`} className="no-underline">
                    <h4 className="text-lg font-semibold mb-1 text-black">
                      {job.title}
                    </h4>
                    <div className="text-sm text-black/80 mb-2">
                      {job.company} • {job.location ?? "Zdalnie"}
                    </div>
                    <p className="text-sm text-black/90 mb-3">
                      {job.description?.slice(0, 160)}
                      {job.description && job.description.length > 160
                        ? "…"
                        : ""}
                    </p>
                  </Link>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-black/80">
                    {job.employment_type ?? ""}{" "}
                    {job.is_remote ? "• Zdalnie" : ""}
                  </div>
                  <Link href={`/jobs/${job.id}`} className="text-blue-600">
                    Szczegóły
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
