'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function JobDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [applying, setApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [expectedSalary, setExpectedSalary] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const fetchJob = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single();
      if (!mounted) return;
      if (error) {
        setError(error.message ?? String(error));
        setJob(null);
      } else {
        setJob(data ?? null);
        setError(null);
      }
      setLoading(false);
    };
    fetchJob();
    return () => { mounted = false };
  }, [id]);

  if (loading) return <div className="max-w-3xl mx-auto">Ładowanie...</div>;
  if (error) return <div className="max-w-3xl mx-auto text-red-600">Błąd: {error}</div>;
  if (!job) return <div className="max-w-3xl mx-auto">Nie znaleziono oferty.</div>;
  const createdAt = job.created_at ? new Date(job.created_at).toLocaleString() : null;
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="hero-gradient rounded-2xl mx-6 my-8 p-8 md:p-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900">{job.title}</h1>
          <div className="mt-2 text-sm text-black/80">{job.company} • {job.location ?? 'Zdalnie'}</div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:justify-between gap-4">
            <div>
              <div className="text-sm text-black/80 mb-2">{job.employment_type ?? ''} {job.is_remote ? '• Zdalnie' : ''}</div>
              <div className="prose max-w-none mb-4">{job.description}</div>
            </div>
            <aside className="w-full md:w-64">
              {job.salary_from || job.salary_to ? (
                <div className="mb-4">
                  <div className="text-xs text-black/60">Wynagrodzenie</div>
                  <div className="font-semibold">{job.salary_from ?? '—'}{job.salary_from && job.salary_to ? ' – ' + job.salary_to : ''} {job.salary_to ? '' : ''}</div>
                </div>
              ) : null}

              {job.contact_email ? (
                <div className="mb-4">
                  <div className="text-xs text-black/60">Kontakt</div>
                  <a href={`mailto:${job.contact_email}`} className="text-blue-600">{job.contact_email}</a>
                </div>
              ) : null}

              {job.tags && Array.isArray(job.tags) && job.tags.length > 0 ? (
                <div className="mb-4">
                  <div className="text-xs text-black/60">Tagi</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {job.tags.map((t: string) => (
                      <span key={t} className="text-xs bg-white shadow-sm px-2 py-1 rounded">{t}</span>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="text-xs text-black/60">Opublikowano</div>
              <div className="text-sm mb-2">{createdAt ?? '—'}</div>
              <div className="text-xs text-black/60">Wyświetlenia</div>
              <div className="text-sm">{job.views ?? 0}</div>
            </aside>
          </div>

          <div className="mt-6">
            {!showApplyForm ? (
              <button
                onClick={() => setShowApplyForm(true)}
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded"
              >
                Aplikuj
              </button>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!job) return;
                  setSubmitting(true);
                  const { data: userData } = await supabase.auth.getUser();
                  const user = userData?.user ?? null;
                  if (!user) {
                    setSubmitting(false);
                    router.push('/login');
                    return;
                  }

                  let cv_url: string | null = null;
                  try {
                    if (cvFile) {
                      const path = `${user.id}/${Date.now()}_${cvFile.name}`;
                      const upload = await supabase.storage.from('cvs').upload(path, cvFile, { cacheControl: '3600', upsert: false });
                      if (upload.error) {
                        console.warn('CV upload error', upload.error);
                      } else {
                        const { data: publicUrlData } = supabase.storage.from('cvs').getPublicUrl(path);
                        cv_url = publicUrlData?.publicUrl ?? null;
                      }
                    }

                    const payload: any = {
                      job_id: job.id,
                      user_id: user.id,
                      expected_salary: expectedSalary || null,
                      start_date: startDate || null,
                      cv_url: cv_url,
                      cv_text: cvText || null,
                      created_at: new Date().toISOString(),
                    };

                    const { error: insertError } = await supabase.from('applications').insert(payload);
                    if (insertError) throw insertError;
                    router.push('/applications');
                  } catch (err: any) {
                    console.error('Apply error', err);
                    const errMsg = err?.message ?? JSON.stringify(err);
                    alert('Wystąpił błąd podczas wysyłania aplikacji: ' + errMsg);
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="space-y-3 bg-gray-50 p-4 rounded"
              >
                <div>
                  <label className="text-sm text-black/70">Oczekiwana pensja</label>
                  <input value={expectedSalary} onChange={(e) => setExpectedSalary(e.target.value)} placeholder="np. 8000 PLN" className="w-full mt-1 p-2 border rounded" />
                </div>

                <div>
                  <label className="text-sm text-black/70">Kiedy możesz zacząć</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full mt-1 p-2 border rounded" />
                </div>

                <div>
                  <label className="text-sm text-black/70">Dodaj CV (plik)</label>
                  <input type="file" onChange={(e) => setCvFile(e.target.files?.[0] ?? null)} className="w-full mt-1" />
                </div>

                <div>
                  <label className="text-sm text-black/70">Lub wklej treść CV / link</label>
                  <textarea value={cvText} onChange={(e) => setCvText(e.target.value)} rows={4} className="w-full mt-1 p-2 border rounded" />
                </div>

                <div className="flex gap-2">
                  <button type="submit" disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded">{submitting ? 'Wysyłanie...' : 'Wyślij aplikację'}</button>
                  <button type="button" onClick={() => setShowApplyForm(false)} disabled={submitting} className="bg-gray-200 px-4 py-2 rounded">Anuluj</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}