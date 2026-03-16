"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function ApplicationsPage() {
	const [user, setUser] = useState<any | null>(null);
	const [applications, setApplications] = useState<any[]>([]);
	const [jobsMap, setJobsMap] = useState<Record<string, any>>({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		let mounted = true;
		const init = async () => {
			setLoading(true);
			try {
				const { data } = await supabase.auth.getUser();
				const current = data?.user ?? null;
				if (!current) {
					router.push('/login');
					return;
				}
				if (mounted) setUser(current);

				// Fetch applications for current user (including status and extra fields)
				const { data: appsData, error: appsError } = await supabase
					.from('applications')
					.select('id, job_id, created_at, status, expected_salary, start_date, cv_url, cv_text')
					.eq('user_id', current.id)
					.order('created_at', { ascending: false });

				if (appsError) throw appsError;

				const apps = appsData ?? [];
				if (mounted) setApplications(apps);

				// fetch related jobs in batch
				const jobIds = Array.from(new Set(apps.map((a: any) => a.job_id).filter(Boolean)));
				if (jobIds.length > 0) {
					const { data: jobsData, error: jobsError } = await supabase
						.from('jobs')
						.select('*')
						.in('id', jobIds as any[]);
					if (jobsError) throw jobsError;
					const map: Record<string, any> = {};
					(jobsData ?? []).forEach((j: any) => { map[j.id] = j });
					if (mounted) setJobsMap(map);
				}

				if (mounted) setError(null);
			} catch (e: any) {
				console.error('Applications load error', e);
				if (mounted) setError(e?.message ?? JSON.stringify(e));
			} finally {
				if (mounted) setLoading(false);
			}
		};
		init();
		return () => { mounted = false };
	}, [router]);

	if (!user) return null;

	return (
		<div className="max-w-3xl mx-auto">
			<h2 className="text-2xl font-bold mb-4">Aplikacje</h2>

			{loading ? (
				<p>Ładowanie aplikacji...</p>
			) : error ? (
				<div className="text-red-600">Błąd: {error}</div>
			) : applications.length === 0 ? (
				<p>Nie dodałeś jeszcze żadnych aplikacji.</p>
			) : (
				<ul className="space-y-3">
					{applications.map((a) => {
						const job = jobsMap[a.job_id];
						return (
							<li key={a.id} className="p-3 bg-white rounded shadow-sm flex flex-col md:flex-row md:justify-between gap-3">
								<div>
									{job ? (
										<>
											<Link href={`/jobs/${job.id}`} className="text-lg font-semibold text-black">{job.title}</Link>
											<div className="text-sm text-black/70">{job.company} • {job.location ?? 'Zdalnie'}</div>
										</>
									) : (
										<div className="text-sm text-black/80">Oferta usunięta (job_id: {a.job_id})</div>
									)}
									{a.expected_salary ? <div className="text-sm mt-1">Oczekiwana pensja: <strong>{a.expected_salary}</strong></div> : null}
									{a.start_date ? <div className="text-sm">Data rozpoczęcia: <strong>{new Date(a.start_date).toLocaleDateString()}</strong></div> : null}
									{a.cv_url ? <div className="text-sm mt-1"><a href={a.cv_url} target="_blank" rel="noreferrer" className="text-blue-600">Pobierz CV</a></div> : null}
									{a.cv_text ? <div className="text-sm mt-1">{a.cv_text.length > 200 ? a.cv_text.slice(0,200) + '…' : a.cv_text}</div> : null}
								</div>
								<div className="flex flex-col items-start md:items-end justify-center gap-2">
									<div className="text-sm text-black/60">{new Date(a.created_at).toLocaleString()}</div>
									{/* status badge */}
									<div>
										{(a.status ?? 'submitted') === 'submitted' && <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-sm">Wysłane</span>}
										{a.status === 'accepted' && <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-sm">Zaakceptowane</span>}
										{a.status === 'rejected' && <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-sm">Odrzucone</span>}
										{a.status && !['submitted','accepted','rejected'].includes(a.status) && <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-sm">{a.status}</span>}
									</div>
								</div>
							</li>
						)
					})}
				</ul>
			)}
		</div>
	);
}
