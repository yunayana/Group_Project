"use client"
import { useEffect, useState } from "react"
import { supabase } from "../../../../lib/supabaseClient"

interface Application {
  id: string
  job_id: string
  status: string
  expected_salary: number | null
  cv_url: string | null
  created_at: string
  user_id: string
}

interface Profile {
  id: string
  username: string | null
  email: string
}

interface Job {
  id: string
  title: string
  company: string
}

export default function StatusyPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)

      const [appsRes, profilesRes, jobsRes] = await Promise.all([
        supabase
          .from("applications")
          .select(
            "id, job_id, status, expected_salary, cv_url, created_at, user_id",
          )
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, username, email"),
        supabase.from("jobs").select("id, title, company"),
      ])

      if (appsRes.error) {
        console.error("❌ Błąd applications:", appsRes.error)
        setApplications([])
      } else {
        setApplications((appsRes.data || []) as Application[])
      }

      if (profilesRes.error) {
        console.error("❌ Błąd profiles:", profilesRes.error)
        setProfiles([])
      } else {
        setProfiles((profilesRes.data || []) as Profile[])
      }

      if (jobsRes.error) {
        console.error("❌ Błąd jobs:", jobsRes.error)
        setJobs([])
      } else {
        setJobs((jobsRes.data || []) as Job[])
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleUpdateStatus = async (
    app: Application,
    newStatus: "pending" | "accepted" | "rejected",
  ) => {
    const first = window.confirm(
      `Na pewno zmienić status na "${newStatus}" dla zgłoszenia użytkownika ${app.user_id}?`,
    )
    if (!first) return

    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", app.id)

      if (error) {
        console.error("❌ Błąd zmiany statusu:", error)
        return
      }

      setApplications(prev =>
        prev.map(a => (a.id === app.id ? { ...a, status: newStatus } : a)),
      )
    } catch (e) {
      console.error("❌ Błąd zmiany statusu (catch):", e)
    }
  }

  const handleDeleteApplication = async (app: Application) => {
    const first = window.confirm(
      `Czy NA PEWNO chcesz usunąć zgłoszenie użytkownika ${app.user_id}?`,
    )
    if (!first) return
    const second = window.confirm("To działanie jest nieodwracalne. Potwierdź.")
    if (!second) return

    try {
      const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", app.id)

      if (error) {
        console.error("❌ Błąd usuwania zgłoszenia:", error)
        return
      }

      setApplications(prev => prev.filter(a => a.id !== app.id))
    } catch (e) {
      console.error("❌ Błąd usuwania zgłoszenia (catch):", e)
    }
  }

  const handleEdit = (app: Application) => {
    alert(
      `Tu możesz otworzyć modal z edycją zgłoszenia.\nNa razie: id=${app.id}`,
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">Ładowanie statusów...</div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Statusy zgłoszeń i ofert</h1>
        <p className="text-gray-600">Monitoruj i zarządzaj aplikacjami kandydatów - zmień status, zaakceptuj lub odrzuć.</p>
      </div>

      {/* Główna tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Aplikacje ({applications.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Oferta
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Kandydat
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Pensja
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  CV
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.map(app => {
                const user = profiles.find(p => p.id === app.user_id) || {
                  id: app.user_id,
                  username: "Brak",
                  email: "Brak",
                }

                const job = jobs.find(j => j.id === app.job_id) || {
                  id: app.job_id,
                  title: "Brak",
                  company: "Brak",
                }

                return (
                  <tr key={app.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {job.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {job.company}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {user.username}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}
                      >
                        {app.status === "pending"
                          ? "⏳ Oczekuje"
                          : app.status === "accepted"
                          ? "✅ Zaakceptowana"
                          : app.status === "rejected"
                          ? "❌ Odrzucona"
                          : app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {app.expected_salary ? `${app.expected_salary} zł` : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {app.cv_url ? (
                        <a
                          href={app.cv_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          📄 Otwórz
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(app.created_at).toLocaleDateString("pl-PL")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateStatus(app, "accepted")}
                          className="inline-flex items-center bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded text-xs font-medium transition"
                          title="Zaakceptuj"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app, "rejected")}
                          className="inline-flex items-center bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded text-xs font-medium transition"
                          title="Odrzuć"
                        >
                          ✕
                        </button>
                        <button
                          onClick={() => handleDeleteApplication(app)}
                          className="inline-flex items-center bg-gray-100 text-gray-700 hover:bg-gray-200 px-2 py-1 rounded text-xs font-medium transition"
                          title="Usuń"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {applications.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <div>Brak aplikacji</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
