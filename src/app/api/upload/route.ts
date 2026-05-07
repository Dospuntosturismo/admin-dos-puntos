import { requireAdminSession } from "@/lib/auth";
import { env } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const guard = requireAdminSession(request);
  if (guard.response) return guard.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "Archivo invalido" }, { status: 400 });
    }

    const extension = file.name.split(".").pop() || "jpg";
    const safeName = `${Date.now()}-${crypto.randomUUID()}.${extension.toLowerCase()}`;
    const path = `admin/${safeName}`;
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.storage.from(env.storageBucket).upload(path, file, {
      contentType: file.type,
      upsert: false
    });

    if (error) throw error;

    const { data } = supabase.storage.from(env.storageBucket).getPublicUrl(path);

    return Response.json({
      path,
      url: data.publicUrl
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "No se pudo subir la imagen" },
      { status: 500 }
    );
  }
}
