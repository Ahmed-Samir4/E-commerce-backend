import Joi from "joi";

export const addCategorySchema ={
    formData: Joi.object({
        name: Joi.string().required(),
    })
}

export const updateCategorySchema ={
    formData: Joi.object({
        name: Joi.string().required(),
        oldPublicId: Joi.string().required()
    }),
    params : Joi.object({
        categoryId : Joi.string().length(24).hex().required()
    })
}

export const deleteCategorySchema ={
    params : Joi.object({
        categoryId : Joi.string().length(24).hex().required()
    })
}