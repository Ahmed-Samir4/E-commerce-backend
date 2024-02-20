import User from "../../../DB/Models/user.model.js";

export const updateUser = async (req, res, next) => {
    // 1- destruct _id from the request authUser
    const { _id } = req.authUser
    // 2- destruct userId from the request params
    const { userId } = req.params
    // 3- destructuring the request body
    const {
        username,
        email,
        age,
        role,
        phoneNumbers,
        addresses, } = req.body
    // 4- check if user exists and same as the logged in user
    const user = await User.findById(userId)
    if (!user) {
        return next({ cause: 404, message: 'User not found' })
    }
    if (user._id.toString() != _id.toString()) {
        return next({ cause: 403, message: 'You are not authorized to update this user' })
    }
    // 5- update name if exists
    if (username) {
        user.username = username
    }
    // 6- update email if exists
    if (email) {
        // 6.1- check if email already exists
        const isEmailDuplicated = await User.findOne({ email })
        if (isEmailDuplicated) {
            return next(new Error('Email already exists,Please try another email', { cause: 409 }))
        }
        // 6.2- check if if the new email is different from the old email
        if (email == user.email) {  
            return next(new Error('New email is the same as the old email', { cause: 409 }))
        }
        // 6.3- update email
        user.email = email;
    }
    // 7- update age if exists
    if (age) {
        user.age = age
    }
    // 8- update role if exists
    if (role) {
        user.role = role
    }
    // 9- update phoneNumbers if exists
    if (phoneNumbers) {
        user.phoneNumbers = phoneNumbers
    }
    // 10- update addresses if exists
    if (addresses) {
        user.addresses = addresses
    }

    // 11- update user
    await user.save()
    // 12- return response
    res.status(200).json({
        success: true,
        message: 'User updated successfully',
        user
    })
}

export const deleteUser = async (req, res, next) => {
    // 1- destruct _id from the request authUser
    const { _id } = req.authUser
    // 2- destruct userId from the request params
    const { userId } = req.params
    // 3- check if user exists 
    const user = await User.findById(userId)
    if (!user) {
        return next({ cause: 404, message: 'User not found' })
    } 

    // super admin and admin can delete any user if needed so can't use this code
    // if (user._id != _id) {
    //     return next({ cause: 403, message: 'You are not authorized to delete this user' })
    // }

    // 4- delete user
    await user.delete()

    res.status(200).json({
        success: true,
        message: 'User deleted successfully',
    })
}

export const getUserData = async (req, res, next) => {
    // 1- destruct userId from the request params
    const { userId } = req.params
    // 2- check if user exists
    const user = await User.findById(userId).select('-password -__v -createdAt -updatedAt ')
    if (!user) {
        return next({ cause: 404, message: 'User not found' })
    }
    // 3- return user
    res.status(200).json({
        success: true,
        message: 'User fetched successfully',
        data: user
    })
}