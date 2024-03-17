import Joi from "joi";

export const createOrderSchema = Joi.object({
    body: Joi.object({
        product: Joi.string().hex().length(24).required(),
        quantity: Joi.number().required(),
        address: Joi.string().required(),
        city: Joi.string().required(),
        postalCode: Joi.string().required(),
        country: Joi.string().required(),
        paymentMethod: Joi.string().valid('Cash', 'Stripe', 'Paymob').required(),
        couponCode: Joi.string().optional(),
        phonNumbers: Joi.array().items(Joi.string()).optional(),

    })
});

export const convertFromCartToOrderSchema = Joi.object({
    body: Joi.object({
        address: Joi.string().required(),
        city: Joi.string().required(),
        postalCode: Joi.string().required(),
        country: Joi.string().required(),
        paymentMethod: Joi.string().valid('Cash', 'Stripe', 'Paymob').required(),
        couponCode: Joi.string().optional(),
        phonNumbers: Joi.array().items(Joi.string()).optional(),
    })
});

export const deliverOrderSchema = Joi.object({
    params: Joi.object({
        orderId: Joi.string().hex().length(24).required()
    })
});

export const payWithStripeSchema = Joi.object({
    params: Joi.object({
        orderId: Joi.string().hex().length(24).required()
    })
});

export const refundOrderSchema = Joi.object({
    params: Joi.object({
        orderId: Joi.string().hex().length(24).required()
    })
});

export const cancelOrderSchema = Joi.object({
    params: Joi.object({
        orderId: Joi.string().hex().length(24).required()
    })
});