import { requireAdminSession } from "@/lib/auth";
import { getResource, sanitizePayload } from "@/lib/resources";
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import bcrypt from 'bcryptjs'

export const dynamic = "force-dynamic";

type Params = {
  params: {
    resource: string;
  };
};

export async function GET(request: Request, { params }: Params) {
  
  const guard = requireAdminSession(request);
  if (guard.response) return guard.response;

  const resource = getResource(params.resource);
  if (!resource) return Response.json({ error: "Recurso no encontrado" }, { status: 404 });

  console.log('GET request received for resource:', resource)

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const supabase = getSupabaseAdmin();
    let query = supabase.from(resource.table).select("*").limit(200);

    if (search) {
      query = query.or(
        resource.searchable.map((field) => `${field}.ilike.%${search.replaceAll(",", "")}%`).join(",")
      );
    }

    const { data, error } = await query.order(resource.defaultOrder, { ascending: false })
    console.log('Supabase query executed:', { query: query.toString(), error, data });
    if (error) throw error;

    return Response.json({ data: data ?? [] });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "No se pudieron obtener los datos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: Params) {
  const guard = requireAdminSession(request);
  if (guard.response) return guard.response;

  const resource = getResource(params.resource);
  if (!resource) return Response.json({ error: "Recurso no encontrado" }, { status: 404 });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload = sanitizePayload(resource, body);
    if (
      typeof payload.password === "string" &&
      payload.password.trim() !== ""
    ) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }
    const { data, error } = await getSupabaseAdmin().from(resource.table).insert(payload).select("*").single();

    console.log('POST request received for resource:', resource, { payload, error, data })

    if (error) throw error;
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "No se pudo crear el registro" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  const guard = requireAdminSession(request);
  if (guard.response) return guard.response;

  const resource = getResource(params.resource);
  if (!resource) return Response.json({ error: "Recurso no encontrado" }, { status: 404 });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = body.id;
    if (id === undefined || id === null || id === "") {
      return Response.json({ error: "El id es obligatorio" }, { status: 400 });
    }

    const payload = sanitizePayload(resource, body);
    delete payload.id;

    const { data, error } = await getSupabaseAdmin()
      .from(resource.table)
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return Response.json({ data });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "No se pudo actualizar el registro" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const guard = requireAdminSession(request);
  if (guard.response) return guard.response;

  const resource = getResource(params.resource);
  if (!resource) return Response.json({ error: "Recurso no encontrado" }, { status: 404 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return Response.json({ error: "El id es obligatorio" }, { status: 400 });

    const { error } = await getSupabaseAdmin().from(resource.table).delete().eq("id", id);
    if (error) throw error;

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "No se pudo eliminar el registro" },
      { status: 500 }
    );
  }
}
