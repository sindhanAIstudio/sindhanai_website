import { prisma } from "@/lib/prisma";
import { getSession, SessionPayload } from "@/lib/auth/session";

/**
 * Checks if a user has a specific dynamic permission key.
 * SUPER_ADMIN role automatically passes all permission checks.
 */
export async function hasPermission(userId: string, requiredPermissionKey: string): Promise<boolean> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user || !user.role) return false;

        // Super Admin override
        if (user.role.name === "SUPER_ADMIN") return true;

        // Check assigned permissions in dynamic RolePermission matrix
        return user.role.permissions.some(
            (rp) => rp.permission.key === requiredPermissionKey
        );
    } catch (error) {
        console.error("RBAC Guard Error:", error);
        return false;
    }
}

/**
 * Ensures the currently authenticated user in session has the required permission.
 * Returns session payload or throws a 403 Forbidden error.
 */
export async function requireAuthPermission(requiredPermissionKey: string): Promise<SessionPayload> {
    const session = await getSession();
    if (!session) {
        throw new Error("UNAUTHORIZED");
    }

    const isAuthorized = await hasPermission(session.userId, requiredPermissionKey);
    if (!isAuthorized) {
        throw new Error("FORBIDDEN");
    }

    return session;
}

/**
 * Returns all granted permission keys for a given user.
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user || !user.role) return [];

        if (user.role.name === "SUPER_ADMIN") {
            const allPerms = await prisma.permission.findMany({ select: { key: true } });
            return allPerms.map((p) => p.key);
        }

        return user.role.permissions.map((rp) => rp.permission.key);
    } catch {
        return [];
    }
}
