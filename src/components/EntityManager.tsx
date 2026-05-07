"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Edit3, Plus, RefreshCcw, Search, Trash2, X } from "lucide-react";
import type { AdminRecord, ClientResource, PackageOption } from "@/types/admin";
import { ImageField } from "./ImageField";

type EntityManagerProps = {
  resource: ClientResource;
  token: string;
  packageOptions: PackageOption[];
  onPackageCatalogChange?: () => void;
};

function createEmptyRecord(resource: ClientResource): AdminRecord {
  return Object.fromEntries(resource.fields.map((field) => [field.key, ""]));
}

function recordValue(record: AdminRecord, key: string) {
  const value = record[key];
  if (value === null || value === undefined) return "";
  return String(value);
}

export function EntityManager({
  resource,
  token,
  packageOptions,
  onPackageCatalogChange
}: EntityManagerProps) {
  const [records, setRecords] = useState<AdminRecord[]>([]);
  const [form, setForm] = useState<AdminRecord>(() => createEmptyRecord(resource));
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = editingId !== null;

  const visibleColumns = useMemo(() => ["id", ...resource.fields.map((field) => field.key)], [resource.fields]);

  async function loadRecords(query = search) {
    setLoading(true);
    setError("");

    try {
      const url = new URL(`/api/admin/${resource.key}`, window.location.origin);
      if (query.trim()) url.searchParams.set("search", query.trim());

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error ?? "No se pudieron cargar los datos");
      setRecords(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los datos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setForm(createEmptyRecord(resource));
    setEditingId(null);
    setSearch("");
    void loadRecords("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource.key]);

  function updateField(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startEdit(record: AdminRecord) {
    setEditingId(record.id ?? null);
    setForm({ ...createEmptyRecord(resource), ...record });
  }

  function resetForm() {
    setEditingId(null);
    setForm(createEmptyRecord(resource));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/${resource.key}`, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(isEditing ? { ...form, id: editingId } : form)
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error ?? "No se pudo guardar");
      resetForm();
      await loadRecords();
      if (resource.key === "paquete") onPackageCatalogChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string | number | undefined) {
    if (id === undefined) return;
    const confirmed = window.confirm("Eliminar este registro?");
    if (!confirmed) return;

    setError("");
    try {
      const response = await fetch(`/api/admin/${resource.key}?id=${encodeURIComponent(String(id))}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error ?? "No se pudo eliminar");
      await loadRecords();
      if (resource.key === "paquete") onPackageCatalogChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <section className="rounded-lg bg-white p-5 shadow-soft">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-ink">{isEditing ? "Modificar" : "Cargar"} {resource.label}</h2>
            <p className="mt-1 text-sm text-slate-500">{isEditing ? `ID ${editingId}` : "Nuevo registro"}</p>
          </div>
          {isEditing ? (
            <button className="icon-button" type="button" onClick={resetForm} title="Cancelar edicion">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {resource.fields.map((field) => {
            const value = recordValue(form, field.key);

            if (field.type === "image") {
              return (
                <ImageField
                  key={field.key}
                  label={field.label}
                  value={value}
                  token={token}
                  required={field.required}
                  onChange={(url) => updateField(field.key, url)}
                />
              );
            }

            if (field.type === "textarea") {
              return (
                <label className="block space-y-2" key={field.key}>
                  <span className="field-label">{field.label}</span>
                  <textarea
                    className="field-input min-h-32 resize-y"
                    value={value}
                    onChange={(event) => updateField(field.key, event.target.value)}
                    required={field.required}
                  />
                </label>
              );
            }

            if (field.type === "select") {
              return (
                <label className="block space-y-2" key={field.key}>
                  <span className="field-label">{field.label}</span>
                  <input
                    className="field-input"
                    list="paquete-options"
                    value={value}
                    onChange={(event) => updateField(field.key, event.target.value)}
                    required={field.required}
                    placeholder={field.placeholder}
                  />
                  <datalist id="paquete-options">
                    {packageOptions.map((option) => (
                      <option key={`${option.id ?? option.codigo}`} value={String(option.codigo ?? "")}>
                        {option.nombre ? `${option.nombre} - ${option.codigo}` : String(option.codigo ?? "")}
                      </option>
                    ))}
                  </datalist>
                </label>
              );
            }

            return (
              <label className="block space-y-2" key={field.key}>
                <span className="field-label">{field.label}</span>
                <input
                  className="field-input"
                  type={field.type}
                  value={value}
                  onChange={(event) => updateField(field.key, event.target.value)}
                  required={field.required}
                  autoComplete={field.type === "password" ? "new-password" : "off"}
                />
              </label>
            );
          })}

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-dos-puntos-pink px-4 py-3 text-sm font-semibold text-white transition hover:bg-dos-puntos-pink-dark disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={saving}
          >
            <Plus className="h-4 w-4" />
            {saving ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear registro"}
          </button>
        </form>
      </section>

      <section className="min-w-0 rounded-lg bg-white p-5 shadow-soft">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-ink">{resource.label}</h2>
            <p className="mt-1 text-sm text-slate-500">{records.length} registros cargados</p>
          </div>
          <div className="flex gap-2">
            <label className="relative min-w-0 flex-1 md:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="field-input pl-10"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void loadRecords();
                }}
                placeholder="Buscar"
              />
            </label>
            <button className="icon-button" type="button" onClick={() => void loadRecords()} title="Actualizar">
              <RefreshCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                {visibleColumns.map((column) => (
                  <th className="border-b border-slate-200 px-3 py-3 font-semibold" key={column}>
                    {column}
                  </th>
                ))}
                <th className="border-b border-slate-200 px-3 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-3 py-8 text-center text-slate-500" colSpan={visibleColumns.length + 1}>
                    Cargando...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td className="px-3 py-8 text-center text-slate-500" colSpan={visibleColumns.length + 1}>
                    No hay registros para mostrar.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr className="align-top hover:bg-slate-50" key={String(record.id)}>
                    {visibleColumns.map((column) => {
                      const value = recordValue(record, column);
                      const isImage = column === "imagen" && value;
                      return (
                        <td className="border-b border-slate-100 px-3 py-3 text-slate-700" key={column}>
                          {isImage ? (
                            <img className="h-12 w-16 rounded-md object-cover" src={value} alt="" />
                          ) : (
                            <span className="line-clamp-2 break-words">{value}</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="border-b border-slate-100 px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <button className="icon-button" type="button" onClick={() => startEdit(record)} title="Editar">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          className="icon-button text-red-600 hover:border-red-200 hover:bg-red-50"
                          type="button"
                          onClick={() => void handleDelete(record.id)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
