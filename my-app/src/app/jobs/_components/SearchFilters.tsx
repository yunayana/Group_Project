"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";

export function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentUrlQuery = searchParams.get("q") || "";
      const currentUrlLocation = searchParams.get("location") || "";

      if (query === currentUrlQuery && location === currentUrlLocation) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      if (query) params.set("q", query);
      else params.delete("q");

      if (location) params.set("location", location);
      else params.delete("location");

      router.push(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, location, pathname, router, searchParams]);

  const hasFilters = query.length > 0 || location.length > 0;

  return (
    <div className="mb-8 flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj stanowiska lub firmy..."
          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
        />
      </div>
      <div className="flex-1 relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Lokalizacja (np. Warszawa, Zdalnie)..."
          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
        />
      </div>

      {hasFilters && (
        <button
          onClick={() => {
            setQuery("");
            setLocation("");
          }}
          className="flex items-center justify-center py-3 px-6  rounded-lg transition-colors font-medium"
        >
          Wyczyść
        </button>
      )}
    </div>
  );
}
