import Joi from "joi";
import { generalValidationRule } from "../../utils/general.validation.rule.js";


export const addCouponSchema = {
    body:Joi.object({
        couponCode: Joi.string().required().min(3).max(10).alphanum(),
        couponAmount: Joi.number().required().min(1),
        isFixed: Joi.boolean(),
        isPercentage: Joi.boolean(),
        fromDate: Joi.date().greater(Date.now()-(24*60*60*1000)).required(),
        toDate: Joi.date().greater(Joi.ref('fromDate')).required(),
        Users: Joi.array().items(
            Joi.object({
                userId: generalValidationRule.dbId.required(),
                maxUsage: Joi.number().required().min(1)
        }))
    })
}

export const updateCouponSchema = {
    body:Joi.object({
        couponCode: Joi.string().min(3).max(10).alphanum(),
        couponAmount: Joi.number().min(1),
        isFixed: Joi.boolean(),
        isPercentage: Joi.boolean(),
        fromDate: Joi.date().greater(Date.now()-(24*60*60*1000)),
        toDate: Joi.date().greater(Joi.ref('fromDate')),
        Users: Joi.array().items(
            Joi.object({
                userId: generalValidationRule.dbId.required(),
                maxUsage: Joi.number().required().min(1)
        }))
    })
}

export const disable_enableCouponSchema = {
    params:Joi.object({
        couponId: generalValidationRule.dbId.required()
    })
}

export const getCouponSchema = {
    params:Joi.object({
        couponId: generalValidationRule.dbId.required()
    })
}
