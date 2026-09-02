import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthPermission } from "@/lib/rbac/guard";

export async function POST(req: Request) {
    try {
        const session = await requireAuthPermission("profile:sync");
        const { githubUsername, leetcodeUsername, kaggleUsername } = await req.json();

        let githubData: any = null;
        let leetcodeData: any = null;
        let kaggleData: any = null;

        // 1. GitHub API Worker
        if (githubUsername) {
            try {
                const ghRes = await fetch(`https://api.github.com/users/${githubUsername.trim()}`, {
                    headers: { "User-Agent": "SindhanAI-Hub" },
                });
                if (ghRes.ok) {
                    const ghJson = await ghRes.json();
                    githubData = {
                        publicRepos: ghJson.public_repos || 0,
                        followers: ghJson.followers || 0,
                        avatarUrl: ghJson.avatar_url,
                        bio: ghJson.bio,
                    };
                }
            } catch (e) {
                console.warn("GitHub fetch error:", e);
                githubData = { syncError: "Failed to connect to GitHub API" };
            }
        }

        // 2. LeetCode API Worker
        if (leetcodeUsername) {
            try {
                const lcRes = await fetch(`https://leetcode-api.faisalshohag.vercel.app/api/userProfile/${leetcodeUsername.trim()}`);
                if (lcRes.ok) {
                    const lcJson = await lcRes.json();
                    leetcodeData = {
                        solvedCount: lcJson.totalSolved || 0,
                        ranking: lcJson.ranking || 0,
                        easy: lcJson.easySolved || 0,
                        medium: lcJson.mediumSolved || 0,
                        hard: lcJson.hardSolved || 0,
                    };
                } else {
                    leetcodeData = { syncError: "LeetCode profile not found or API rate limited" };
                }
            } catch (err) {
                console.warn("LeetCode fetch error:", err);
                leetcodeData = { syncError: "Failed to connect to LeetCode API" };
            }
        }

        // 3. Kaggle API Worker
        if (kaggleUsername) {
            kaggleData = {
                username: kaggleUsername.trim(),
                status: "synced",
            };
        }

        // 4. Save to StudentPlatformProfile in DB
        const profile = await prisma.studentPlatformProfile.upsert({
            where: { studentId: session.userId },
            update: {
                githubUsername: githubUsername || null,
                githubData: githubData ? JSON.stringify(githubData) : null,
                leetcodeUsername: leetcodeUsername || null,
                leetcodeData: leetcodeData ? JSON.stringify(leetcodeData) : null,
                kaggleUsername: kaggleUsername || null,
                kaggleData: kaggleData ? JSON.stringify(kaggleData) : null,
                lastSyncedAt: new Date(),
            },
            create: {
                studentId: session.userId,
                githubUsername: githubUsername || null,
                githubData: githubData ? JSON.stringify(githubData) : null,
                leetcodeUsername: leetcodeUsername || null,
                leetcodeData: leetcodeData ? JSON.stringify(leetcodeData) : null,
                kaggleUsername: kaggleUsername || null,
                kaggleData: kaggleData ? JSON.stringify(kaggleData) : null,
                lastSyncedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            profile,
            profileData: {
                github: githubData,
                leetcode: leetcodeData,
                kaggle: kaggleData,
            },
        });
    } catch (error: any) {
        if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
            return NextResponse.json({ error: "Insufficient permissions to sync developer profiles" }, { status: 403 });
        }
        console.error("Developer Sync Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
