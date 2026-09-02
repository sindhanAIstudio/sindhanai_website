import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
    throw new Error("CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing in production!");
}

const rawJwtSecret = process.env.JWT_SECRET || "sindhanai_dev_only_jwt_secret_key_2026_change_in_prod";
const JWT_SECRET = new TextEncoder().encode(rawJwtSecret);

export const SESSION_COOKIE_NAME = "sindhanai_session";
export const SESSION_DURATION_DAYS = 30;
export const SESSION_DURATION_SECONDS = SESSION_DURATION_DAYS * 24 * 60 * 60;

export interface SessionPayload {
    userId: string;
    email: string;
    name: string;
    role: string;
    deviceFingerprint?: string | null;
}

export async function signJWT(payload: SessionPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
        .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<SessionPayload | null> {
    try {
        const verified = await jwtVerify(token, JWT_SECRET);
        return verified.payload as unknown as SessionPayload;
    } catch {
        return null;
    }
}

export async function createSessionCookie(payload: SessionPayload): Promise<string> {
    const token = await signJWT(payload);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_DURATION_SECONDS,
        path: "/",
    });
    return token;
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyJWT(token);
}

export async function clearSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}
