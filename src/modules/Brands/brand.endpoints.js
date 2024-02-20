import { systemRoles } from "../../utils/system-roles.js";



export const endPointsRoles = {
    ADD_BRAND: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
    UPDATE_BRAND: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
    DELETE_BRAND: [systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
}