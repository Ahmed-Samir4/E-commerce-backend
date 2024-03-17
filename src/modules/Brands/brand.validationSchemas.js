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

export const getAllBrandsSchema ={
    query: Joi.object({
        page: Joi.number().min(1),
        size: Joi.number().min(1),
        sortBy: Joi.string(),
        search: Joi.object({
            id: Joi.string().length(24).hex(),
            name: Joi.string(),
            categoryId: Joi.string().length(24).hex(),
            subCategoryId: Joi.string().length(24).hex(),
        })
    })
}

