import {systemRoles} from '../../utils/system-roles.js'


export const endPointsRoles  = {
    CREATE_ORDER: [systemRoles.USER],
    CONVERT_FROM_CART_TO_ORDER: [systemRoles.USER],
    DELIVER_ORDER: [systemRoles.DELIVER],
    PAY_WITH_STRIPE: [systemRoles.USER],
    STRIPE_WEBHOOK_LOCAL: [],
    REFUND_ORDER: [systemRoles.USER],
    CANCEL_ORDER: [systemRoles.USER]
}