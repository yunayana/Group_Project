import { createClient } from "@/lib/supabase/server";
import Link from 'next/link';
import { redirect } from "next/navigation";

export default async function AdminPage() {
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

  if (profile?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Panel administratora</h1>
        <p className="text-gray-600">Zarządzaj ofertami, użytkownikami i monitoruj aplikacje</p>
      </div>

      {/* Główne sekcje */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/ogloszenia" className="group block p-6 bg-white rounded-xl shadow hover:shadow-lg transition-all border border-gray-200 hover:border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition">
              <span className="text-xl">📋</span>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Narzędzie</span>
          </div>
          <h3 className="font-bold text-lg text-gray-900 mb-2">Historia ogłoszeń</h3>
          <p className="text-sm text-gray-600">Przeglądaj, filtruj, publikuj i usuwaj oferty pracy.</p>
        </Link>
        
        <Link href="/admin/konta" className="group block p-6 bg-white rounded-xl shadow hover:shadow-lg transition-all border border-gray-200 hover:border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition">
              <span className="text-xl">👥</span>
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">Narzędzie</span>
          </div>
          <h3 className="font-bold text-lg text-gray-900 mb-2">Zarządzanie kontami</h3>
          <p className="text-sm text-gray-600">Wyświetl, blokuj użytkowników i zmień ich role.</p>
        </Link>

        <Link href="/admin/statusy" className="group block p-6 bg-white rounded-xl shadow hover:shadow-lg transition-all border border-gray-200 hover:border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition">
              <span className="text-xl">📊</span>
            </div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">Narzędzie</span>
          </div>
          <h3 className="font-bold text-lg text-gray-900 mb-2">Statusy aplikacji</h3>
          <p className="text-sm text-gray-600">Akceptuj, odrzucaj i monitoruj aplikacje kandydatów.</p>
        </Link>
      </div>

      {/* Wskazówki */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-3">💡 Szybkie wskazówki</h4>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>• W sekcji <strong>Ogłoszenia</strong> możesz publikować/wycofywać i usuwać oferty</li>
          <li>• W sekcji <strong>Konta</strong> zarządzaj uprawnieniami i statusem użytkowników</li>
          <li>• W sekcji <strong>Statusy</strong> zarządzaj aplikacjami kandydatów</li>
        </ul>
      </div>
    </div>
  );
}
