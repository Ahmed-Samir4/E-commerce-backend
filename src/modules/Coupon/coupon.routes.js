
import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as  couponController from "./coupon.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { endpointsRoles } from "./coupon.endpoints.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js"
import * as validators from './coupon.validationSchemas.js';
const router = Router();

router.post('/',
    auth(endpointsRoles.ADD_COUPOUN),
    validationMiddleware(validators.addCouponSchema),
    expressAsyncHandler(couponController.addCoupon))

router.put('/:couponId',
    auth(endpointsRoles.ADD_COUPOUN),
    validationMiddleware(validators.updateCouponSchema),
    expressAsyncHandler(couponController.updateCoupon))

router.delete('/:couponId',
    auth(endpointsRoles.ADD_COUPOUN),
    validationMiddleware(validators.disable_enableCouponSchema),
    expressAsyncHandler(couponController.disableCoupon))

router.put('/enable-disable/:couponId',
    auth(endpointsRoles.ADD_COUPOUN),
    validationMiddleware(validators.disable_enableCouponSchema),
    expressAsyncHandler(couponController.disable_enableCoupon))

router.get('/:couponId',
    validationMiddleware(validators.getCouponSchema),
    expressAsyncHandler(couponController.getCouponById))


router.get('/',
    expressAsyncHandler(couponController.getAllCoupons))



export default router;