"use client"
import { useEffect, useState } from "react"
import { supabase } from "../../../../lib/supabaseClient"

interface Stats {
  totalUsers: number
  totalJobs: number
  totalApplications: number
  activeJobs: number
}

interface Account {
  id: string
  email: string
  username: string | null
  role: string | null
  is_blocked: boolean
  created_at: string
}

interface Application {
  id: string
  job_id: string
  created_at: string
  expected_salary: string | null
  start_date: string | null
  status: string | null
  cv_text: string | null
}

export default function KontaPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    activeJobs: 0,
  })
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [appsLoading, setAppsLoading] = useState(false)

  const fetchStats = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
      const totalUsers =
        !profilesError && Array.isArray(profilesData)
          ? profilesData.length
          : 0

      const { data: jobsData } = await supabase.from("jobs").select("*")
      const totalJobs = Array.isArray(jobsData) ? jobsData.length : 0

      const { data: appsData } = await supabase
        .from("applications")
        .select("*")
      const totalApplications = Array.isArray(appsData)
        ? appsData.length
        : 0

      const { data: activeJobsData } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_published", true)
        .gte("expires_at", new Date().toISOString())
      const activeJobs = Array.isArray(activeJobsData)
        ? activeJobsData.length
        : 0

      setStats({ totalUsers, totalJobs, totalApplications, activeJobs })
    } catch (error) {
      console.error("❌ BŁĄD statystyk:", error)
    }
  }

  const fetchAccounts = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, username, role, is_blocked, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ BŁĄD ładowania kont:", error)
      setAccounts([])
    } else {
      setAccounts((data || []) as Account[])
    }
  }

  const fetchApplicationsForUser = async (userId: string) => {
    try {
      setAppsLoading(true)
      const { data, error } = await supabase
        .from("applications")
        .select(
          "id, job_id, created_at, expected_salary, start_date, status, cv_text",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ BŁĄD ładowania aplikacji:", error)
        setApplications([])
      } else {
        setApplications((data || []) as Application[])
      }
    } finally {
      setAppsLoading(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([fetchStats(), fetchAccounts()])
      setLoading(false)
    }
    load()
  }, [])

  const handleChangeRole = async (id: string, newRole: "user" | "admin") => {
    const ok = window.confirm(
      `Na pewno zmienić rolę użytkownika na "${newRole}"?`,
    )
    if (!ok) return

    try {
      setActionLoadingId(id)
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", id)

      if (error) {
        console.error("❌ BŁĄD zmiany roli:", error)
        return
      }

      setAccounts(prev =>
        prev.map(acc => (acc.id === id ? { ...acc, role: newRole } : acc)),
      )
      fetchStats()
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleToggleBlock = async (
    id: string,
    current: boolean,
    label: string,
  ) => {
    const first = window.confirm(
      current
        ? `Czy na pewno chcesz ODBLOKOWAĆ użytkownika ${label}?`
        : `Czy na pewno chcesz ZABLOKOWAĆ użytkownika ${label}?`,
    )
    if (!first) return

    try {
      setActionLoadingId(id)
      const { error } = await supabase
        .from("profiles")
        .update({ is_blocked: !current })
        .eq("id", id)

      if (error) {
        console.error("❌ BŁĄD blokowania:", error)
        return
      }

      setAccounts(prev =>
        prev.map(acc =>
          acc.id === id ? { ...acc, is_blocked: !current } : acc,
        ),
      )
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDeleteAccount = async (id: string, label: string) => {
    const first = window.confirm(
      `Czy NA PEWNO chcesz TRWALE usunąć konto ${label}?`,
    )
    if (!first) return
    const second = window.confirm(
      "To działanie jest nieodwracalne. Potwierdź usunięcie.",
    )
    if (!second) return

    try {
      setActionLoadingId(id)
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id)

      if (error) {
        console.error("❌ BŁĄD usuwania konta:", error)
        return
      }

      setAccounts(prev => prev.filter(acc => acc.id !== id))
      fetchStats()
    } finally {
      setActionLoadingId(null)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">Ładowanie statystyk i kont...</div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Statystyki */}
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Statystyki kont i ofert
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-black p-8 rounded-xl">
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <div className="text-blue-100 mt-1">Użytkowników</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-black p-8 rounded-xl">
            <div className="text-3xl font-bold">{stats.totalJobs}</div>
            <div className="text-green-100 mt-1">Ogłoszeń</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-black p-8 rounded-xl">
            <div className="text-3xl font-bold">
              {stats.totalApplications}
            </div>
            <div className="text-purple-100 mt-1">Aplikacji</div>
          </div>
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-black p-8 rounded-xl">
            <div className="text-3xl font-bold">{stats.activeJobs}</div>
            <div className="text-indigo-100 mt-1">Aktywnych ofert</div>
          </div>
        </div>
      </div>

      {/* Tabela kont + zgłoszenia */}
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Zarządzanie kontami
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Użytkownik
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Rola
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Założone
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {accounts.map(acc => {
                const label = acc.username || acc.email || acc.id
                return (
                  <tr key={acc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {acc.username || "—"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {acc.id.slice(0, 8)}…
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{acc.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={acc.role || "user"}
                        onChange={e =>
                          handleChangeRole(
                            acc.id,
                            e.target.value as "user" | "admin",
                          )
                        }
                        disabled={actionLoadingId === acc.id}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          acc.is_blocked
                            ? "inline-flex px-2 py-1 text-xs rounded-full bg-red-100 text-red-800"
                            : "inline-flex px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"
                        }
                      >
                        {acc.is_blocked ? "Zablokowany" : "Aktywny"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(acc.created_at).toLocaleDateString("pl-PL")}
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        onClick={() =>
                          handleToggleBlock(acc.id, acc.is_blocked, label)
                        }
                        disabled={actionLoadingId === acc.id}
                        className={
                          acc.is_blocked
                            ? "px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
                            : "px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                        }
                      >
                        {acc.is_blocked ? "Odblokuj" : "Zablokuj"}
                      </button>

                      <button
                        onClick={() => handleDeleteAccount(acc.id, label)}
                        disabled={actionLoadingId === acc.id}
                        className="px-3 py-1 text-xs rounded bg-gray-700 text-white hover:bg-black"
                      >
                        Usuń
                      </button>

                      <button
                        onClick={async () => {
                          setSelectedAccount(acc)
                          await fetchApplicationsForUser(acc.id)
                        }}
                        className="px-3 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        Zgłoszenia
                      </button>
                    </td>
                  </tr>
                )
              })}

              {accounts.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Brak kont do wyświetlenia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedAccount && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Zgłoszenia użytkownika:{" "}
              {selectedAccount.username || selectedAccount.email}
            </h3>

            {appsLoading ? (
              <div className="text-gray-500 text-sm">
                Ładowanie zgłoszeń...
              </div>
            ) : applications.length === 0 ? (
              <div className="text-gray-500 text-sm">
                Ten użytkownik nie ma jeszcze zgłoszeń.
              </div>
            ) : (
              <div className="overflow-x-auto mt-3">
                <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">
                        Oferta (job_id)
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">
                        Data
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">
                        Status
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">
                        Oczekiwane wynagrodzenie
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">
                        Start
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">
                        CV (tekst)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {applications.map(app => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-900">
                          {app.job_id.slice(0, 8)}…
                        </td>
                        <td className="px-3 py-2 text-gray-900">
                          {new Date(app.created_at).toLocaleDateString(
                            "pl-PL",
                          )}
                        </td>
                        <td className="px-3 py-2 text-gray-900">
                          {app.status || "—"}
                        </td>
                        <td className="px-3 py-2 text-gray-900">
                          {app.expected_salary || "—"}
                        </td>
                        <td className="px-3 py-2 text-gray-900">
                          {app.start_date || "—"}
                        </td>
                        <td className="px-3 py-2 text-gray-700 max-w-xs truncate">
                          {app.cv_text || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button
              onClick={() => {
                setSelectedAccount(null)
                setApplications([])
              }}
              className="mt-4 px-4 py-1 text-xs rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Ukryj zgłoszenia
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
