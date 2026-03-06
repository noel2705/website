import { Permission } from "../permissions";
import { permissionsList } from "../permissions";

export interface IUser {
    uuid: string;
    permissions: Permission[];

    hasPermission: (permission: Permission) => boolean;
}


export function buildUser(data: {
    uuid: string;
    permissions: string[];
}): IUser {
    const validPermissions = new Set<string>(permissionsList);
    const normalizedPermissions = data.permissions.filter(
        (permission): permission is Permission => validPermissions.has(permission)
    );

    return {
        uuid: data.uuid,
        permissions: normalizedPermissions,
        hasPermission(permission) {
            const hasPermission = this.permissions.includes(permission);
            if(hasPermission) return true;

            if(this.permissions.includes("admin.role")) return true;
            return false;
        }
    };
}
