export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  storageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? "imagenes",
  adminSessionSecret: process.env.ADMIN_SESSION_SECRET ?? "",
  tables: {
    paqueteCatalogo: process.env.SUPABASE_TABLE_PAQUETE_CATALOGO ?? "paquete",
    salidas: process.env.SUPABASE_TABLE_SALIDAS ?? "salidas",
    usuarios: process.env.SUPABASE_TABLE_USUARIOS ?? "usuarios",
    packages: process.env.SUPABASE_TABLE_PACKAGES ?? "packages"
  }
};

export function assertServerEnv() {
  const missing = [
    ["NEXT_PUBLIC_SUPABASE_URL", env.supabaseUrl],
    ["SUPABASE_SERVICE_ROLE_KEY", env.supabaseServiceRoleKey],
    ["ADMIN_SESSION_SECRET", env.adminSessionSecret]
  ].filter(([, value]) => !value);

  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno: ${missing.map(([key]) => key).join(", ")}`);
  }
}
