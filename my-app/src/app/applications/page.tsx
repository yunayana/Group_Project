"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function ApplicationsPage() {
	const [user, setUser] = useState<any | null>(null);
	const router = useRouter();

	useEffect(() => {
		let mounted = true;
		const init = async () => {
			const { data } = await supabase.auth.getUser();
			const current = data?.user ?? null;
			if (!current) {
				router.push('/login');
				return;
			}
			if (mounted) setUser(current);
		};
		init();
		return () => { mounted = false };
	}, [router]);

	if (!user) return null;

	return (
		<div className="max-w-3xl mx-auto">
			<h2 className="text-2xl font-bold mb-4">Aplikacje</h2>
			<p>Twoje aplikacje tutaj.</p>
		</div>
	);
}
