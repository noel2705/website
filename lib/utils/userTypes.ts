import { Permission } from "../permissions";

export interface IUser {
    uuid: string;
    permissions: Permission[];

    hasPermission: (permission: Permission) => boolean;
}


export function buildUser(data: {
    uuid: string;
    permissions: Permission[];
}): IUser {
    return {
        uuid: data.uuid,
        permissions: data.permissions,
        hasPermission(permission) {
            const hasPermission = this.permissions.includes(permission);
            if(hasPermission) return true;

            if(this.permissions.includes("admin.role")) return true;
            return false;
        }
    };
}