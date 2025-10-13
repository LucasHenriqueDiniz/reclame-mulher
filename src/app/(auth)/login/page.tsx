"use client";
import { useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState(""), [password, setPassword] = useState("");
  const [err, setErr] = useState<string|null>(null), [loading, setLoading] = useState(false);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr(null);
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    setLoading(false); if (error) setErr(error.message); else window.location.href = "/app";
  };

  return (
    <form onSubmit={onLogin} className="max-w-sm mx-auto space-y-3 p-6">
      <h1 className="text-xl font-semibold">Login</h1>
      <input className="border w-full p-2" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="border w-full p-2" type="password" placeholder="senha" value={password} onChange={e=>setPassword(e.target.value)} />
      {err && <p className="text-red-600">{err}</p>}
      <button disabled={loading} className="border px-3 py-2">{loading ? "..." : "Entrar"}</button>
    </form>
  );
}

