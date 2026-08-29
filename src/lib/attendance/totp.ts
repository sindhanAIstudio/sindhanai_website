import crypto from "crypto";

const QR_VALIDITY_WINDOW_MS = 5000; // 5 Seconds Strict Window

export interface QrPayload {
    sessionId: string;
    timestamp: number;
    nonce: string;
    signature: string;
}

function base64UrlEncode(str: string): string {
    return Buffer.from(str)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
        base64 += "=";
    }
    return Buffer.from(base64, "base64").toString("utf-8");
}

/**
 * Generate a 5-second dynamic HMAC signed token for a classroom session.
 */
export function generateDynamicQrToken(sessionId: string, sessionSecret: string): string {
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(4).toString("hex");

    const dataToSign = `${sessionId}:${timestamp}:${nonce}`;
    const signature = crypto
        .createHmac("sha256", sessionSecret)
        .update(dataToSign)
        .digest("hex")
        .substring(0, 16);

    const payload: QrPayload = {
        sessionId,
        timestamp,
        nonce,
        signature,
    };

    return base64UrlEncode(JSON.stringify(payload));
}

/**
 * Verify a 5-second dynamic HMAC QR token.
 */
export function verifyDynamicQrToken(
    tokenStr: string,
    sessionSecret: string
): { valid: boolean; sessionId?: string; error?: string } {
    try {
        const decodedJson = base64UrlDecode(tokenStr);
        const payload: QrPayload = JSON.parse(decodedJson);

        const { sessionId, timestamp, nonce, signature } = payload;

        if (!sessionId || !timestamp || !nonce || !signature) {
            return { valid: false, error: "Invalid QR code format" };
        }

        // 1. Check strict 5-second timestamp freshness window
        const now = Date.now();
        const timeDiff = Math.abs(now - timestamp);
        if (timeDiff > QR_VALIDITY_WINDOW_MS) {
            return { valid: false, error: "QR code expired (5s limit). Scan live code." };
        }

        // 2. Re-calculate signature
        const dataToSign = `${sessionId}:${timestamp}:${nonce}`;
        const expectedSignature = crypto
            .createHmac("sha256", sessionSecret)
            .update(dataToSign)
            .digest("hex")
            .substring(0, 16);

        if (signature !== expectedSignature) {
            return { valid: false, error: "Security signature mismatch (Spoofed QR)" };
        }

        return { valid: true, sessionId };
    } catch (err) {
        return { valid: false, error: "Malformed security token" };
    }
}

import os from "os";

function ipToLong(ip: string): number {
    const parts = ip.split(".").map(Number);
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
        throw new Error("Invalid IPv4 address format");
    }
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

/**
 * IP Matching helper supporting bitwise CIDR (e.g. 172.16.48.0/21, 192.168.1.0/24, 10.0.0.0/16), wildcards (172.16.52.*), or exact IP.
 */
export function isIpInSubnet(clientIp: string, allowedRange: string): boolean {
    let ip = clientIp.trim();
    const range = allowedRange.trim();

    // If loopback address (::1 or 127.0.0.1), resolve to active non-internal IPv4 address of local network adapter
    if (ip === "::1" || ip === "127.0.0.1" || ip === "localhost") {
        try {
            const interfaces = os.networkInterfaces();
            for (const name in interfaces) {
                const iface = interfaces[name];
                if (!iface) continue;
                for (const alias of iface) {
                    const isIpv4 = alias.family === "IPv4" || (alias.family as any) === 4;
                    if (isIpv4 && !alias.internal && alias.address !== "127.0.0.1") {
                        ip = alias.address;
                        break;
                    }
                }
            }
        } catch { }
    }

    // Strip IPv6-mapped IPv4 prefix (e.g. ::ffff:172.16.52.254 -> 172.16.52.254)
    if (ip.startsWith("::ffff:")) {
        ip = ip.substring(7);
    }

    if (range === "*" || range === "0.0.0.0/0") return true;

    // Exact match
    if (ip === range) return true;

    // Wildcard match (e.g., "172.16.52.*" or "172.16.*")
    if (range.endsWith(".*")) {
        const prefix = range.replace(/\.\*+$/, "");
        return ip.startsWith(prefix);
    }

    // Bitwise CIDR matching for any mask (/8 to /32)
    if (range.includes("/")) {
        const [subnetIp, maskBitsStr] = range.split("/");
        const maskBits = parseInt(maskBitsStr, 10);
        if (isNaN(maskBits) || maskBits < 0 || maskBits > 32) return false;

        try {
            const clientLong = ipToLong(ip);
            const subnetLong = ipToLong(subnetIp);
            const mask = maskBits === 0 ? 0 : (~0 << (32 - maskBits)) >>> 0;
            return (clientLong & mask) === (subnetLong & mask);
        } catch {
            return false;
        }
    }

    return false;
}
