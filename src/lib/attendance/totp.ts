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

/**
 * IP Matching helper supporting CIDR (e.g. 192.168.1.0/24), wildcards (192.168.1.*), or exact IP.
 */
export function isIpInSubnet(clientIp: string, allowedRange: string): boolean {
    const ip = clientIp.trim();
    const range = allowedRange.trim();

    if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") {
        return true; // Allow local loopback testing
    }

    if (range === "*" || range === "0.0.0.0/0") return true;

    // Exact match
    if (ip === range) return true;

    // Wildcard match (e.g., "192.168.1.*")
    if (range.endsWith(".*")) {
        const prefix = range.replace(".*", "");
        return ip.startsWith(prefix);
    }

    // Subnet CIDR /24 simple check
    if (range.includes("/24")) {
        const subnetPrefix = range.split("/")[0].split(".").slice(0, 3).join(".");
        const clientPrefix = ip.split(".").slice(0, 3).join(".");
        return subnetPrefix === clientPrefix;
    }

    return false;
}
