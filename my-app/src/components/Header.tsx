"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Header() {
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted) setUser(data?.user ?? null);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      try { listener?.subscription?.unsubscribe(); } catch {}
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold text-black">Job Portal</Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {user && (
            <Link href="/applications" className="text-black hover:text-gray-700">Moje aplikacje</Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link href="/register" className="hidden md:inline-block border rounded-full px-4 py-2 text-sm text-black">Zarejestruj się</Link>
              <Link href="/login" className="inline-block bg-white border px-4 py-2 rounded-full text-sm text-black">Zaloguj się</Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-sm text-black">{user.email}</div>
              <button onClick={handleSignOut} className="text-sm text-red-600">Wyloguj</button>
            </div>
          )}
          <button aria-label="menu" className="ml-2 p-2 rounded-full bg-gray-100 md:hidden">≡</button>
        </div>
      </div>
    </header>
  );
}
