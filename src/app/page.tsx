"use client";

import { useEffect, useMemo, useState } from "react";
import { Database, LogOut, Package, PlaneTakeoff, Users } from "lucide-react";
import { EntityManager } from "@/components/EntityManager";
import { LoginForm } from "@/components/LoginForm";
import { resourceConfig, type ResourceName } from "@/lib/resources";
import type { AdminUser, ClientResource, PackageOption } from "@/types/admin";

const storageKeys = {
  token: "admin-token",
  user: "admin-user"
};

const resources: ClientResource[] = [
  {
    key: "paquetes",
    label: resourceConfig.paquetes.label,
    fields: resourceConfig.paquetes.fields
  },
  {
    key: "salidas",
    label: resourceConfig.salidas.label,
    fields: resourceConfig.salidas.fields
  },
  {
    key: "usuarios",
    label: resourceConfig.usuarios.label,
    fields: resourceConfig.usuarios.fields
  },
  {
    key: "paquete",
    label: "Catalogo",
    fields: resourceConfig.paquete.fields
  }
];

const iconByResource: Record<ResourceName, React.ComponentType<{ className?: string }>> = {
  paquetes: Package,
  salidas: PlaneTakeoff,
  usuarios: Users,
  paquete: Database
};

export default function Home() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [activeResource, setActiveResource] = useState<ResourceName>("paquetes");
  const [packageOptions, setPackageOptions] = useState<PackageOption[]>([]);

  const currentResource = useMemo(
    () => resources.find((resource) => resource.key === activeResource) ?? resources[0],
    [activeResource]
  );

  useEffect(() => {
    const storedToken = window.localStorage.getItem(storageKeys.token);
    const storedUser = window.localStorage.getItem(storageKeys.user);
    if (storedToken) setToken(storedToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as AdminUser);
      } catch {
        window.localStorage.removeItem(storageKeys.user);
      }
    }
  }, []);

  async function loadPackageOptions(authToken = token) {
    if (!authToken) return;
    try {
      const response = await fetch("/api/admin/paquete", {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const result = await response.json();
      if (response.ok) setPackageOptions(result.data ?? []);
    } catch {
      setPackageOptions([]);
    }
  }

  useEffect(() => {
    void loadPackageOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function handleLogin(nextToken: string, nextUser: AdminUser) {
    setToken(nextToken);
    setUser(nextUser);
    window.localStorage.setItem(storageKeys.token, nextToken);
    window.localStorage.setItem(storageKeys.user, JSON.stringify(nextUser));
    void loadPackageOptions(nextToken);
  }

  function logout() {
    setToken("");
    setUser(null);
    window.localStorage.removeItem(storageKeys.token);
    window.localStorage.removeItem(storageKeys.user);
  }

  if (!token) return <LoginForm onLogin={handleLogin} />

  const rolesMap: Record<string, string> = {
  "1": "Administrador",
  "2": "Editor",
  "3": "Usuario"
};

  return (
    <main className="min-h-screen bg-mist">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between lg:px-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">Dos Puntos Turismo</p>
            <h1 className="mt-1 text-2xl font-semibold text-ink">Administrador de contenido</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-semibold text-slate-800">{user?.name ?? user?.email}</p>
              <p className="truncate text-xs text-slate-500">{rolesMap[user?.rol as string] ?? "Sin rol"}</p>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
              type="button"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <nav className="mb-6 flex flex-wrap gap-2">
          {resources.map((resource) => {
            const Icon = iconByResource[resource.key];
            const active = resource.key === activeResource;
            return (
              <button
                className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                type="button"
                key={resource.key}
                onClick={() => setActiveResource(resource.key)}
              >
                <Icon className="h-4 w-4" />
                {resource.label}
              </button>
            );
          })}
        </nav>

        <EntityManager
          key={currentResource.key}
          resource={currentResource}
          token={token}
          packageOptions={packageOptions}
          onPackageCatalogChange={() => void loadPackageOptions()}
        />
      </div>
    </main>
  );
}
