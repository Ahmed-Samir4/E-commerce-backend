import Joi from "joi";

export const addSubCategorySchema ={
    formData: Joi.object({
        name: Joi.string().required(),
    }),
    params : Joi.object({
        categoryId : Joi.string().length(24).hex().required()
    })
}

export const updateSubCategorySchema ={
    formData: Joi.object({
        name: Joi.string().required(),
        oldPublicId: Joi.string().required()
    }),
    params : Joi.object({
        subCategoryId : Joi.string().length(24).hex().required()
    })
}

export const deleteSubCategorySchema ={
    params : Joi.object({
        subCategoryId : Joi.string().length(24).hex().required()
    })
}