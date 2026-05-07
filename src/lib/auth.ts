import { createHmac, timingSafeEqual } from "crypto";
import { env } from "./env";

export type AdminSession = {
  id: string | number;
  email: string;
  name?: string;
  rol?: string;
  exp: number;
};

function base64Url(input: string) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string) {
  return createHmac("sha256", env.adminSessionSecret).update(payload).digest("base64url");
}

export function createAdminToken(session: Omit<AdminSession, "exp">) {
  const payload = base64Url(
    JSON.stringify({
      ...session,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8
    })
  );
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token: string | null): AdminSession | null {
  if (!token || !env.adminSessionSecret) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;
    if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

export function getBearerToken(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice("Bearer ".length);
}

export function requireAdminSession(request: Request) {
  const session = verifyAdminToken(getBearerToken(request));
  if (!session) {
    return {
      session: null,
      response: Response.json({ error: "Sesion invalida o expirada" }, { status: 401 })
    };
  }
  return { session, response: null };
}
