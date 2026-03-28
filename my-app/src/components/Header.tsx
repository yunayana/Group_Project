"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmployer, setIsEmployer] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
    let adminCheckTimer: NodeJS.Timeout | null = null;

    const checkRoles = async (userId: string) => {
      if (!userId) {
        setIsAdmin(false);
        setIsEmployer(false);
        return;
      }
      try {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();
        if (mounted) {
          setIsAdmin(data?.role === "admin");
          setIsEmployer(data?.role === "employer");
        }
      } catch (error) {
        console.error("Error checking roles:", error);
        if (mounted) {
          setIsAdmin(false);
          setIsEmployer(false);
        }
      }
    };

    const init = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        const u = data?.user ?? null;
        setUser(u);
        if (u?.id) {
          await checkRoles(u.id);
        } else {
          setIsAdmin(false);
          setIsEmployer(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        const u = session?.user ?? null;
        setUser(u);

        // Debounce role check
        if (adminCheckTimer) clearTimeout(adminCheckTimer);
        adminCheckTimer = setTimeout(() => {
          if (u?.id) {
            checkRoles(u.id);
          } else {
            setIsAdmin(false);
            setIsEmployer(false);
          }
        }, 300);
      },
    );

    return () => {
      mounted = false;
      if (adminCheckTimer) clearTimeout(adminCheckTimer);
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt="Job Portal Logo"
              className="h-10 w-10 object-contain"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Job Portal
            </span>
          </a>

          {user && !loading && (
            <nav className="hidden md:flex items-center gap-6">
              <a
                href="/applications"
                className="text-gray-700 hover:text-purple-600 font-medium transition"
              >
                Moje aplikacje
              </a>
              {isAdmin && (
                <a
                  href="/admin"
                  className="text-gray-700 hover:text-purple-600 font-medium transition"
                >
                  Panel admina
                </a>
              )}
              {isEmployer && !isAdmin && (
                <a
                  href="/employer-panel"
                  className="text-gray-700 hover:text-purple-600 font-medium transition"
                >
                  Panel pracodawcy
                </a>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4 min-w-[200px] justify-end">
          {!loading && user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <div className="text-xs text-gray-500">Zalogowany jako</div>
                <div className="text-sm font-semibold text-gray-900">
                  {user.email}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition"
              >
                Wyloguj
              </button>
            </div>
          ) : !loading ? (
            <>
              <a
                href="/register"
                className="hidden md:inline-block border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-5 py-2 rounded-full text-sm font-medium transition"
              >
                Zarejestruj się
              </a>
              <a
                href="/login"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg px-5 py-2 rounded-full text-sm font-medium transition"
              >
                Zaloguj się
              </a>
            </>
          ) : (
            <div className="w-20 h-10 bg-gray-200 rounded-full animate-pulse" />
          )}
        </div>
      </div>
    </header>
  );
}
