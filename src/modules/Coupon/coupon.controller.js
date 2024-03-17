
import Coupon from '../../../DB/Models/coupon.model.js'
import CouponUsers from '../../../DB/Models/coupon-users.model.js'
import User from '../../../DB/Models/user.model.js'
import { applyCouponValidation } from '../../utils/coupon-validation.js'
import { APIFeatures } from '../../utils/api-features.js'
//============================== Add Coupon API ==============================//
/**
 * @name addCoupon
 * @param {*} req.body  { couponCode , couponAmount , fromDate, toDate , isFixed , isPercentage, Users}
 * @param {*} req.authUser  { _id:userId} 
 * @returns  {message: "Coupon added successfully",coupon, couponUsers}
 * @description create coupon and couponUsers
 */
export const addCoupon = async (req, res, next) => {
    const {
        couponCode,
        couponAmount,
        fromDate,
        toDate,
        isFixed,
        isPercentage,
        Users  // [{userId, maxUsage},{userId,maxUsage}]  => [{userId, maxUsage, couponId}]
    } = req.body

    const { _id: addedBy } = req.authUser

    // couponcode check
    const isCouponCodeExist = await Coupon.findOne({ couponCode })
    if (isCouponCodeExist) return next({ message: "Coupon code already exist", cause: 409 })

    if (isFixed == isPercentage) return next({ message: "Coupon can be either fixed or percentage", cause: 400 })

    if (isPercentage) {
        if (couponAmount > 100) return next({ message: "Percentage should be less than 100", cause: 400 })
    }

    const couponObject = {
        couponCode,
        couponAmount,
        fromDate,
        toDate,
        isFixed,
        isPercentage,
        addedBy
    }

    const coupon = await Coupon.create(couponObject)

    const userIds = []
    for (const user of Users) {
        userIds.push(user.userId)
    }
    const isUserExist = await User.find({ _id: { $in: userIds } })
    if (isUserExist.length != Users.length) {
        await Coupon.findByIdAndDelete(coupon._id)   // Rollback the coupon if user not found
        return next({ message: "User not found", cause: 404 })
    }


    const couponUsers = await CouponUsers.create(
        Users.map(ele => ({ ...ele, couponId: coupon._id }))
    )
    res.status(201).json({ message: "Coupon added successfully", coupon, couponUsers })

}

//============================== Update Coupon API ==============================//
/**
 * @name updateCoupon
 * @param {*} req.body  { couponCode , couponAmount , fromDate, toDate , isFixed , isPercentage, Users}
 * @param {*} req.params  { couponId}
 * @param {*} req.authUser  { _id:userId}
 * @returns  {message: "Coupon updated successfully",coupon, couponUsers}
 * @description update coupon and couponUsers
 */
export const updateCoupon = async (req, res, next) => {
    const { couponId } = req.params
    const {
        couponCode,
        couponAmount,
        fromDate,
        toDate,
        isFixed,
        isPercentage,
        Users
    } = req.body
    const { _id: updatedBy } = req.authUser
    const couponObject = {};
    // check couponId
    const isCouponExist = await Coupon.findById(couponId)
    if (!isCouponExist) return next({ message: "Coupon not found", cause: 404 })
    // couponCode check
    if (couponCode) {
        const isCouponCodeExist = await Coupon.findOne({ couponCode, _id: { $ne: couponId } })
        if (isCouponCodeExist) return next({ message: "Coupon code already exist", cause: 409 })
        couponObject.couponCode = couponCode
    }
    // isFixed and isPercentage check
    if (isFixed == isPercentage) return next({ message: "Coupon can be either fixed or percentage", cause: 400 })
    if (isPercentage) {
        if (couponAmount > 100) return next({ message: "Percentage should be less than 100", cause: 400 })
        couponObject.isPercentage = isPercentage
    }

    // fromDate and toDate check
    if (fromDate) {
        couponObject.fromDate = fromDate
    }
    if (toDate) {
        couponObject.toDate = toDate
    }
    // couponAmount check
    if (couponAmount) {
        couponObject.couponAmount = couponAmount
    }
    // isFixed check
    if (isFixed) {
        couponObject.isFixed = isFixed
    }
    couponObject.updatedBy = updatedBy

    const coupon = await Coupon.findByIdAndUpdate(couponId, couponObject, { new: true })

    const userIds = []
    for (const user of Users) {
        userIds.push(user.userId)
    }
    const isUserExist = await User.find({ _id: { $in: userIds } })
    if (isUserExist.length != Users.length) {
        return next({ message: "User not found", cause: 404 })
    }

    const couponUsers = await CouponUsers.create(
        Users.map(ele => ({ ...ele, couponId }))
    )
    res.status(201).json({ message: "Coupon updated successfully", coupon, couponUsers })

}

//============================== Disable Coupon API ==============================//
/**
 * @name disable_enableCoupon
 * @param {*} req.params  { couponId}
 * @param {*} req.authUser  { _id:userId}
 * @returns  {message: "Coupon disabled successfully"} or {message: "Coupon enabled successfully"}
 * @description disable coupon or enable coupon
 */
export const disable_enableCoupon = async (req, res, next) => {
    const { couponId } = req.params
    const { _id: updatedBy } = req.authUser
    const coupon = await Coupon.findById(couponId)
    if (!coupon) {
        return next({ message: "Coupon not found", cause: 404 })
    }
    if (coupon.couponStatus == "valid") {
        const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, { couponStatus: "expired", updatedBy, disabledAt: new Date() }, { new: true })
        if (!updatedCoupon) {
            return next({ message: "failed to disable coupon", cause: 400 })
        }
        updatedCoupon.disabledBy = updatedBy
        updatedCoupon.enabledAt = null
        updatedCoupon.enabledBy = null
        await updatedCoupon.save()
        res.status(200).json({ message: "Coupon disabled successfully" })
    }
    if (coupon.couponStatus == "expired") {
        const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, { couponStatus: "valid", updatedBy, enabledAt: new Date() }, { new: true })
        if (!updatedCoupon) {
            return next({ message: "failed to enable coupon", cause: 400 })
        }
        updatedCoupon.enabledBy = updatedBy
        updatedCoupon.disabledBy = null
        updatedCoupon.disabledAt = null
        await updatedCoupon.save()
        res.status(200).json({ message: "Coupon enabled successfully" })
    }
}

//============================== get Coupon by id ==============================//
/**
 * @name getCouponById
 * @param {*} req.params  { couponId}
 * @returns  {coupon}
 * @description get coupon by id
 */
export const getCouponById = async (req, res, next) => {
    const { couponId } = req.params
    const features = new APIFeatures(req.query, Coupon.find()).searchCoupon({ id: couponId })
    const coupon = await features.mongooseQuery
    if (!coupon) return next({ message: "Coupon not found", cause: 404 })
    res.status(200).json({ coupon })
}

//============================== get all Coupons ==============================//
/**
 * @name getAllCoupons
 * @returns  {coupons}
 * @query  {disabled , enabled}
 * @description get all coupons
 */
export const getAllCoupons = async (req, res, next) => {
    const {...search} = req.query
    const features = new APIFeatures(req.query, Coupon.find()).searchCoupon(search)
    const coupons = await features.mongooseQuery

    if (!coupons) return next({ message: "Coupons not found", cause: 404 })
    res.status(200).json({ coupons })

}







