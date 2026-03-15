import { Permission } from "../permissions";
import { permissionsList } from "../permissions";
import { UserSettings, DEFAULT_USER_SETTINGS, mergeUserSettings } from "@/lib/utils/userSettings";

export interface IUser {
    uuid: string;
    permissions: Permission[];
    password: string;
    visitCount: number;
    name: string;
    loginStreak: number;
    bestLoginStreak: number;
    settings: UserSettings;
    hasPermission: (permission: Permission) => boolean;
}


export function buildUser(data: {
    uuid: string;
    visitCount: number;
    name: string;
    loginStreak: number;
    bestLoginStreak: number;
    password: string;
    permissions: string[];
    settings?: Partial<UserSettings> | null;
}): IUser {
    const validPermissions = new Set<string>(permissionsList);
    const normalizedPermissions = data.permissions.filter(
        (permission): permission is Permission => validPermissions.has(permission)
    );

    return {
        uuid: data.uuid,
        name: data.name,
        password: data.password,
        loginStreak: data.loginStreak,
        bestLoginStreak: data.bestLoginStreak,
        visitCount: data.visitCount,
        settings: mergeUserSettings(data.settings ?? DEFAULT_USER_SETTINGS),
        permissions: normalizedPermissions,
        hasPermission(permission) {
            const hasPermission = this.permissions.includes(permission);
            if(hasPermission) return true;

            if(this.permissions.includes("admin.role")) return true;
            return false;
        }
    };
}
