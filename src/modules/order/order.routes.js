import { Router } from 'express'
import express from 'express'
const router = Router()

import * as orderController from './order.controller.js'
import { auth } from '../../middlewares/auth.middleware.js'
import { systemRoles } from '../../utils/system-roles.js'
import expressAsyncHandler from 'express-async-handler'



router.post('/',
    auth([systemRoles.USER]),
    expressAsyncHandler(orderController.createOrder))


router.post('/cartToOrder',
    auth([systemRoles.USER]),
    expressAsyncHandler(orderController.convertFromCartToOrder))


router.put('/:orderId',
    auth([systemRoles.DELIVER]),
    expressAsyncHandler(orderController.deliverOrder))

router.post(
    '/stripePay/:orderId',
    auth([systemRoles.USER]),
    expressAsyncHandler(orderController.payWithStripe))

router.post('/webhook',
    express.raw({ type: 'application/json' }),
    expressAsyncHandler(orderController.stripeWebhookLocal))


router.post('/refund/:orderId',
    
    expressAsyncHandler(orderController.refundOrder))


export default router