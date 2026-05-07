import { createAdminToken } from "@/lib/auth";
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

      console.log("Login attempt:", { email, error, data });

    if (error) throw error;

    if (!data) {
      return Response.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    // Comparar password hasheada
    const isValidPassword = await bcrypt.compare(
      password,
      data.password
    );

    if (!isValidPassword) {
      return Response.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    const token = createAdminToken({
      id: data.id,
      email: data.email,
      name: data.name,
      rol: data.rol
    });

    return Response.json({
      token,
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        rol: data.rol
      }
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "No se pudo iniciar sesion" },
      { status: 500 }
    );
  }
}
