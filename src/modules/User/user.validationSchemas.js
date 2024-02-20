import Joi from "joi";


export const updateUserSchema ={
    body: Joi.object({
        username: Joi.string(),
        email: Joi.string(),
        age: Joi.number(),
        role: Joi.string(),
        phoneNumbers: Joi.array(),
        addresses: Joi.array()
    }),
    params : Joi.object({
        userId : Joi.string().length(24).hex().required()
    })
}

export const deleteUserSchema ={
    params : Joi.object({
        userId : Joi.string().length(24).hex().required()
    })
}

export const getUserDataSchema ={
    params : Joi.object({
        userId : Joi.string().length(24).hex().required()
    })
}