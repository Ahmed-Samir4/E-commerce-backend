import Joi from "joi";

export const addBrandSchema ={
    formData: Joi.object({
        name: Joi.string().required(),
    }),
    query: Joi.object({
        categoryId: Joi.string().length(24).hex().required(),
        subCategoryId: Joi.string().length(24).hex().required()
    })
}

export const updateBrandSchema ={
    formData: Joi.object({
        name: Joi.string().required(),
        oldPublicId: Joi.string().required()
    }),
    params : Joi.object({
        brandId : Joi.string().length(24).hex().required()
    })
}

export const deleteBrandSchema ={
    params : Joi.object({
        brandId : Joi.string().length(24).hex().required()
    })
}