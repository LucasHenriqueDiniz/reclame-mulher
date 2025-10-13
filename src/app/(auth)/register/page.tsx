"use client";
import { useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [name,setName]=useState(""), [email,setEmail]=useState(""), [password,setPassword]=useState("");
  const [err,setErr]=useState<string|null>(null);

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null);
    const { error } = await supabaseClient.auth.signUp({ email, password, options:{ data:{ name } }});
    if (error) setErr(error.message); else window.location.href="/login";
  };

  return (
    <form onSubmit={onRegister} className="max-w-sm mx-auto space-y-3 p-6">
      <h1 className="text-xl font-semibold">Criar conta</h1>
      <input className="border w-full p-2" placeholder="nome" value={name} onChange={e=>setName(e.target.value)} />
      <input className="border w-full p-2" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="border w-full p-2" type="password" placeholder="senha" value={password} onChange={e=>setPassword(e.target.value)} />
      {err && <p className="text-red-600">{err}</p>}
      <button className="border px-3 py-2">Registrar</button>
    </form>
  );
}

