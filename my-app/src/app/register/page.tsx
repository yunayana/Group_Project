"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !username || !password) {
      setError("Wypełnij wszystkie pola");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Rejestracja w auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username, role: "user" } },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!data?.user?.id) {
        setError("Błąd rejestracji - nie utworzono użytkownika");
        setLoading(false);
        return;
      }

      // Tworzenie profilu w tabeli profiles
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email: email,
        username: username,
        role: "user",
        is_blocked: false,
        created_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error("Błąd tworzenia profilu:", profileError);
        setError(
          "Rejestracja auth się powiodła, ale nie udało się utworzyć profilu. Skontaktuj się z support.",
        );
        setLoading(false);
        return;
      }

      alert(
        "Zarejestrowano! Sprawdź e-mail aby potwierdzić. Później możesz się zalogować.",
      );
      setEmail("");
      setUsername("");
      setPassword("");

      // Po 2 sekundach przekieruj na login
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (e: any) {
      setError(e?.message || "Nieznany błąd");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Zarejestruj się
            </h2>
            <p className="text-gray-600">Dołącz do naszej społeczności</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nazwa użytkownika
              </label>
              <input
                type="text"
                placeholder="Nazwa użytkownika"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasło
              </label>
              <input
                type="password"
                placeholder="Hasło"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            {loading ? "Rejestrowanie..." : "Zarejestruj"}
          </button>

          <div className="mt-6 text-center text-sm text-gray-600">
            Masz już konto?{" "}
            <a
              href="/login"
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              Zaloguj się
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
