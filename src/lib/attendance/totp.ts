import crypto from "crypto";

export const TOTP_WINDOW_SECONDS = 10;

/**
 * Generates a dynamic 10-second cryptographic TOTP token for a given session secret.
 */
export function generateTOTPToken(sessionSecret: string, timestampMs: number = Date.now()): string {
    const timeWindow = Math.floor(timestampMs / 1000 / TOTP_WINDOW_SECONDS);
    const hmac = crypto.createHmac("sha256", sessionSecret);
    hmac.update(Buffer.from(timeWindow.toString(16), "hex"));
    const hash = hmac.digest("hex");
    return hash.substring(0, 8).toUpperCase();
}

/**
 * Verifies a TOTP token against current, previous window, or next window (grace tolerance).
 */
export function verifyTOTPToken(sessionSecret: string, token: string): boolean {
    const now = Date.now();
    const currentWindowToken = generateTOTPToken(sessionSecret, now);
    const prevWindowToken = generateTOTPToken(sessionSecret, now - TOTP_WINDOW_SECONDS * 1000);
    const nextWindowToken = generateTOTPToken(sessionSecret, now + TOTP_WINDOW_SECONDS * 1000);

    const cleanToken = token.trim().toUpperCase();
    return cleanToken === currentWindowToken || cleanToken === prevWindowToken || cleanToken === nextWindowToken;
}
