'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else router.push('/');
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Zaloguj się</h2>
      {error && <p className="text-red-500">{error}</p>}
      <input 
        type="email" placeholder="Email" 
        className="w-full mb-2 p-2 border rounded"
        value={email} onChange={e => setEmail(e.target.value)}
      />
      <input 
        type="password" placeholder="Hasło" 
        className="w-full mb-2 p-2 border rounded"
        value={password} onChange={e => setPassword(e.target.value)}
      />
      <button 
        onClick={handleLogin}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Zaloguj
      </button>
    </div>
  );
}