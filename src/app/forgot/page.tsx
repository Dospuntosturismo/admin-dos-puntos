"use client";
import { FormEvent, useState } from "react"
import { Lock, LogIn, Mail, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

const Forgot = () => {
    const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState("")
      const [shown, setShown] = useState(false)


      async function handleSubmit(event: FormEvent<HTMLFormElement>) {
          event.preventDefault();
          setLoading(true);
          setError("");
      
          try {
            const response = await fetch("/api/forgot", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password })
            });
            const result = await response.json();
      
            if (!response.ok) throw new Error(result.error ?? "No se pudo cambiar la contraseña");
            // onLogin(result.token, result.user);
          } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo cambiar la contraseña");
          } finally {
            setLoading(false);
          }
        }
  return (
    <main className="grid min-h-screen place-items-center bg-mist px-4">
      <section className="w-full max-w-md rounded-lg bg-white p-8 shadow-soft">
        <div className="mb-8">
          <div className="flex items-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-dos-puntos-pink">Dos Puntos Turismo</p>
            <img src="/logo-dos-puntos.png" alt="Dos Puntos Turismo" className="h-12 w-auto mt-2" />
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-dos-puntos-gray">Administrador de contenido</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cambio de Contraseña
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="field-label">Email</span>
            <span className="relative block">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="field-input pl-10"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </span>
          </label>

          <label className="block space-y-2">
            <span className="field-label">Password</span>
            <span className="relative block">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="field-input pl-10"
                type={shown ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
              <button onClick={() => {
					setShown(!shown)
				}} className='absolute bottom-2 right-0 w-5 mr-3' type='button'>
                {shown ? <Eye className="text-slate-400" /> : <EyeOff className="text-slate-400" />}
              </button>
            </span>
          </label>
          <div>
          </div>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Cambiando..." : "Cambiar Contraseña"}
          </button>
        </form>
        <div className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold text-slate-700">
            <LogIn className="h-4 w-4" />
            <Link href="/">
            <p>Volver al Login</p>
            </Link>
        </div>
      </section>
    </main>
  )
}

export default Forgot
