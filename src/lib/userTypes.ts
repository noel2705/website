import { Permission } from "./permissions";

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
            return this.permissions.includes(permission);
        }
    };
}