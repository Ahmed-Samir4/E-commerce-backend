import { Router } from 'express'
import express from 'express'
import expressAsyncHandler from 'express-async-handler'

import * as orderController from './order.controller.js'
import { auth } from '../../middlewares/auth.middleware.js'
import { endPointsRoles } from './order.endpoints.js'
import { validationMiddleware } from '../../middlewares/validation.middleware.js'
import { cancelOrderSchema, convertFromCartToOrderSchema, createOrderSchema, deliverOrderSchema, payWithStripeSchema, refundOrderSchema } from './order.validationSchemas.js'

const router = Router()


router.post('/',
    auth(endPointsRoles.CREATE_ORDER),
    validationMiddleware(createOrderSchema),
    expressAsyncHandler(orderController.createOrder))


router.post('/cartToOrder',
    auth(endPointsRoles.CONVERT_FROM_CART_TO_ORDER),
    validationMiddleware(convertFromCartToOrderSchema),
    expressAsyncHandler(orderController.convertFromCartToOrder))


router.put('/:orderId',
    auth(endPointsRoles.DELIVER_ORDER),
    validationMiddleware(deliverOrderSchema),
    expressAsyncHandler(orderController.deliverOrder))

router.post(
    '/stripePay/:orderId',
    auth(endPointsRoles.PAY_WITH_STRIPE),
    validationMiddleware(payWithStripeSchema),
    expressAsyncHandler(orderController.payWithStripe))

router.post('/webhook',
    express.raw({ type: 'application/json' }),
    expressAsyncHandler(orderController.stripeWebhookLocal))


router.post('/refund/:orderId',
    auth(endPointsRoles.REFUND_ORDER),
    validationMiddleware(refundOrderSchema),
    expressAsyncHandler(orderController.refundOrder))

router.put('/cancel/:orderId',
    auth(endPointsRoles.CANCEL_ORDER),
    validationMiddleware(cancelOrderSchema),
    expressAsyncHandler(orderController.cancelOrder))

export default router