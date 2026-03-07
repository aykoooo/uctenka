// ============================================================
// Data Access Factory
// Returns the active repository implementation.
// Switch from mock → supabase by changing the factory here.
// ============================================================

import type { DataRepository } from "./repository";
import { SupabaseRepository } from "./supabase-repository";

let repositoryInstance: DataRepository | null = null;

export function getRepository(): DataRepository {
    if (!repositoryInstance) {
        repositoryInstance = new SupabaseRepository();
    }
    return repositoryInstance;
}

export type { DataRepository } from "./repository";
export type { ReceiptFilters } from "./repository";
