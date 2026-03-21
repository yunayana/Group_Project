'use client';

import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow mt-6">
      <h1 className="text-3xl font-bold mb-4">Panel administratora</h1>
      <p className="text-sm text-gray-600 mb-6">Tutaj możesz zarządzać ofertami, użytkownikami i przeglądać statusy.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/ogloszenia" className="block p-4 border rounded-lg hover:shadow-md">
          <h3 className="font-semibold">Historia ogłoszeń</h3>
          <p className="text-sm text-gray-600 mt-1">Przeglądaj, filtruj i zarządzaj historią ofert.</p>
        </Link>
        
        <Link href="/admin/konta" className="block p-4 border rounded-lg hover:shadow-md">
          <h3 className="font-semibold">Konta</h3>
          <p className="text-sm text-gray-600 mt-1">Przeglądaj szczegóły kont i ich statusy, , zmieniaj role, blokuj lub aktywuj użytkowników.</p>
        </Link>
        <Link href="/admin/statusy" className="block p-4 border rounded-lg hover:shadow-md">
          <h3 className="font-semibold">Statusy zgłoszeń i ofert</h3>
          <p className="text-sm text-gray-600 mt-1">Monitoruj statusy i przeglądaj zmiany.</p>
        </Link>
      </div>
    </div>
  );
}
