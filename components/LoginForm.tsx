"use client";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";

export default function LoginForm() {
  const { apiUrl, setToken } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiUrl}/users/auth`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Falha no login. Verifique credenciais.");

      const data = await res.json();
      // O Swagger diz que retorna { token: string, user: ... }
      if (data.token) {
        setToken(data.token);
      } else {
        throw new Error("Token não recebido da API.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 border border-slate-200">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Login</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="p-3 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            className="p-3 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            disabled={loading}
            className="bg-emerald-600 text-white py-3 rounded hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Acessar Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
