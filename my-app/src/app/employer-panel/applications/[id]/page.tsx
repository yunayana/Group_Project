import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  User,
  DollarSign,
  Calendar,
  FileText,
  Download,
} from "lucide-react";
import { StatusButtons } from "./_components/StatusButtons";

export default async function ApplicationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: app, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      jobs!fk_app_job!inner ( title, employer_id ),
      profiles!fk_app_user ( username, email )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Błąd pobierania szczegółów aplikacji:", error);
    }
  }

  const jobInfo = Array.isArray(app?.jobs) ? app.jobs[0] : (app?.jobs as any);
  const profileInfo = Array.isArray(app?.profiles)
    ? app.profiles[0]
    : (app?.profiles as any);

  if (error || !app || jobInfo?.employer_id !== user.id) {
    redirect("/employer-panel/applications");
  }

  let statusText = "Oczekująca";
  let statusBadge = "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (app.status === "accepted") {
    statusText = "Zaakceptowana";
    statusBadge = "bg-green-100 text-green-800 border-green-200";
  } else if (app.status === "rejected") {
    statusText = "Odrzucona";
    statusBadge = "bg-red-100 text-red-800 border-red-200";
  }

  return (
    <section className="p-8 w-full max-w-4xl mx-auto bg-gray-50 min-h-full">
      <Link
        href="/employer-panel/applications"
        className="flex items-center gap-2 hover:underline mb-8 font-medium w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Wróć do listy zgłoszeń
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Szczegóły zgłoszenia</h1>
          <p className="mt-1 flex items-center gap-2">
            Stanowisko: <strong>{jobInfo?.title}</strong>
          </p>
        </div>

        <StatusButtons applicationId={app.id} currentStatus={app.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 border-b pb-2">
              Kandydat
            </h2>

            <div className="space-y-4">
              <div>
                <span className="flex items-center gap-2 text-sm  mb-1">
                  <User className="w-4 h-4" /> Imię i nazwisko
                </span>
                <p className="font-bold text-lg">
                  {profileInfo?.username || "Nie podano"}
                </p>
              </div>

              <div>
                <span className="flex items-center gap-2 text-sm mb-1">
                  <Mail className="w-4 h-4" /> Email kontaktowy
                </span>
                <a
                  href={`mailto:${profileInfo?.email}`}
                  className="font-medium hover:underline break-all"
                >
                  {profileInfo?.email || "Brak emaila"}
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 border-b pb-2">
              Aplikacja
            </h2>

            <div className="space-y-4">
              <div>
                <span className="flex items-center gap-2 text-sm mb-1">
                  Status
                </span>
                <span
                  className={`inline-block border px-3 py-1 rounded-full text-xs uppercase font-bold tracking-wider ${statusBadge}`}
                >
                  {statusText}
                </span>
              </div>

              <div>
                <span className="flex items-center gap-2 text-sm mb-1">
                  <Calendar className="w-4 h-4" /> Wysłano
                </span>
                <p className="font-medium text-sm">
                  {new Date(app.created_at).toLocaleString("pl-PL")}
                </p>
              </div>

              {app.expected_salary && (
                <div>
                  <span className="flex items-center gap-2 text-sm mb-1">
                    <DollarSign className="w-4 h-4" /> Oczekiwania finansowe
                  </span>
                  <p className="font-bold text-gray-900">
                    {app.expected_salary} PLN
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm h-full">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6 border-b pb-4">
              <FileText className="w-5 h-5" /> Wiadomość od kandydata
            </h2>

            {app.cv_text ? (
              <div className="whitespace-pre-wrap  leading-relaxed text-sm bg-gray-50 p-6 rounded border border-gray-100">
                {app.cv_text}
              </div>
            ) : (
              <p className=" italic text-center py-12">
                Kandydat nie zostawił wiadomości tekstowej.
              </p>
            )}

            {app.cv_url && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
                  Załączniki
                </h3>
                <a
                  href={app.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  <Download className="w-5 h-5" /> Pobierz CV (Plik)
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
