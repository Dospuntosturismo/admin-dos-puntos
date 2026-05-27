import { env } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as { email?: string; password?: string };

    if (!email || !password) {
      return Response.json({ error: "Email y password son obligatorios" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(env.tables.usuarios)
      .select("id,name,email,password,rol")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

      console.log("Datos para cambiar:", { email, password, error, data });

    if (error) throw error;

    if (!data) {
      return Response.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    // Comparar password hasheada
    const newPassword = await bcrypt.hashSync(password, 10);

    const result = await supabase.from(env.tables.usuarios).update({ password: newPassword }).eq("id", data.id).select("*").single();

    console.log('POST request received for resource:', result)


    return Response.json({ data }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "No se pudo cambiar la contraseña" },
      { status: 500 }
    );
  }
}

