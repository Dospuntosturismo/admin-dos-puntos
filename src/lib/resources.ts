import { env } from "./env";

export type ResourceName = "paquetes" | "salidas" | "usuarios" | "paquete";

export type FieldType = "text" | "email" | "password" | "textarea" | "image" | "select";

export type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
};

export type ResourceConfig = {
  label: string;
  table: string;
  defaultOrder: string;
  fields: FieldConfig[];
  searchable: string[];
};

export const resourceConfig: Record<ResourceName, ResourceConfig> = {
  paquetes: {
    label: "Paquetes",
    table: env.tables.paquetes,
    defaultOrder: "id",
    searchable: ["titulo", "paquete"],
    fields: [
      { key: "titulo", label: "Titulo", type: "text", required: true },
      { key: "image", label: "Imagen", type: "image", required: true },
      { key: "paquete", label: "Paquete", type: "select", required: true, placeholder: "Codigo" }
    ]
  },
  salidas: {
    label: "Salidas",
    table: env.tables.salidas,
    defaultOrder: "id",
    searchable: ["nombre", "mes", "info"],
    fields: [
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "image", label: "Imagen", type: "image", required: true },
      { key: "mes", label: "Mes", type: "text", required: true },
      { key: "info", label: "Info", type: "textarea", required: true }
    ]
  },
  usuarios: {
    label: "Usuarios",
    table: env.tables.usuarios,
    defaultOrder: "created_at",
    searchable: ["name", "email", "rol"],
    fields: [
      { key: "name", label: "Nombre", type: "text", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "password", label: "Password", type: "password", required: true },
      { key: "rol", label: "Rol", type: "text", required: true }
    ]
  },
  paquete: {
    label: "Catalogo de paquetes",
    table: env.tables.paqueteCatalogo,
    defaultOrder: "codigo",
    searchable: ["nombre", "codigo"],
    fields: [
      { key: "nombre", label: "Nombre", type: "text", required: true },
      { key: "codigo", label: "Codigo", type: "text", required: true }
    ]
  }
};

export function getResource(name: string) {
  if (name in resourceConfig) {
    return resourceConfig[name as ResourceName];
  }
  return null;
}

export function sanitizePayload(resource: ResourceConfig, payload: Record<string, unknown>) {
  const clean: Record<string, unknown> = {};

  for (const field of resource.fields) {
    const value = payload[field.key];
    if (typeof value === "string") clean[field.key] = value.trim();
    else if (value !== undefined) clean[field.key] = value;
  }

  return clean;
}
