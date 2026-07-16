import { createAdminMockStore, type AdminMockStore } from "@/data/admin-mock-data";

let store: AdminMockStore = createAdminMockStore();

export function getAdminMockStore(): AdminMockStore {
  return store;
}

export function resetAdminMockStore() {
  store = createAdminMockStore();
}

export function mockId(prefix = "mock") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
