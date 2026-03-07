import type { User } from "@/types/domain";

const DEMO_USER: User = {
    id: "demo-user-001",
    name: "Jan Novák",
    email: "jan@example.cz",
    avatarUrl: null,
    telegramLinked: true,
};

/**
 * Returns the current user.
 * In v1, this returns a hardcoded demo user.
 * Will be replaced with real Supabase auth later.
 */
export function getCurrentUser(): User {
    return DEMO_USER;
}
