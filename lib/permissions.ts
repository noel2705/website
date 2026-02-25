export const permissionsList = [
    "view.admin.panel",
    "view.shards.panel",
    "dashboard.view.admin",
    "admin.role",
    "beta.access",
    "view.shard.calculator"
] as const

export type Permission = (typeof permissionsList)[number]

export const ROLE_PRESETS: Record<string, Permission[]> = {
    Admin: ["view.admin.panel", "dashboard.view.admin", "admin.role", "view.shards.panel", "beta.access"],
    Moderator: ["view.admin.panel", "view.shards.panel"],
    User: ["view.shards.panel"],
    BetaTester: ["beta.access"]
}