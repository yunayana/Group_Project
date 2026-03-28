"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAdminRole = async (userId: string | undefined) => {
    if (!userId) return false;
    try {
      // Czytaj rolę bezpośrednio z bazy danych (profiles table)
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      return data?.role === "admin";
    } catch (error) {
      console.error("Error checking admin role:", error);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;
    let adminCheckTimer: NodeJS.Timeout | null = null;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        const u = data?.user ?? null;
        if (u?.id) {
          const admin = await checkAdminRole(u.id);
          if (mounted) {
            setIsAdmin(admin);
          }
        } else {
          if (mounted) setIsAdmin(false);
        }
      } catch (e) {
        console.error("Admin check error:", e);
        if (mounted) {
          setIsAdmin(false);
          router.push("/");
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

        // Debounce admin check
        if (adminCheckTimer) clearTimeout(adminCheckTimer);
        adminCheckTimer = setTimeout(() => {
          if (u?.id) {
            checkAdminRole(u.id).then((admin) => {
              if (mounted) {
                setIsAdmin(admin);
              }
            });
          } else {
            setIsAdmin(false);
          }
        }, 300);
      },
    );

    return () => {
      mounted = false;
      if (adminCheckTimer) clearTimeout(adminCheckTimer);
      listener?.subscription?.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Sprawdzanie uprawnień...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 font-semibold">Brak dostępu</div>
          <div className="text-gray-600 mt-2">
            Nie masz uprawnień do panel admin.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto px-4">{children}</div>
      </div>
    </div>
  );
}
