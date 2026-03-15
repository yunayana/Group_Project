'use client';

import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, role: 'user' } }
    });
    if (error) setError(error.message);
    else alert('Zarejestrowano! Sprawdź e-mail.');
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Zarejestruj się</h2>
      {error && <p className="text-red-500">{error}</p>}
      <input 
        type="text" placeholder="Nazwa użytkownika" 
        className="w-full mb-2 p-2 border rounded"
        value={username} onChange={e => setUsername(e.target.value)}
      />
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
        onClick={handleRegister}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Zarejestruj
      </button>
    </div>
  );
}