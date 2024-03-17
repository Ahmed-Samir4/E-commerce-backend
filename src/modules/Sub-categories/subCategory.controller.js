
import SubCategory from "../../../DB/Models/sub-category.model.js"
import Category from '../../../DB/Models/category.model.js'
import generateUniqueString from "../../utils/generate-Unique-String.js"
import cloudinaryConnection from "../../utils/cloudinary.js"
import slugify from "slugify"
import Brand from "../../../DB/Models/brand.model.js"
import { APIFeatures } from "../../utils/api-features.js"
import Product from "../../../DB/Models/product.model.js"

/**
 * @name addSubCategory
 * @body {name} - required
 * @param {categoryId} - required
 * @param {image} - required
 * @description add new subCategory to the category after checking if the category is exist and the subCategory name is not duplicated and upload the image to cloudinary
 */
export const addSubCategory = async (req, res, next) => {
    // 1- destructuring the request body
    const { name } = req.body
    const { categoryId } = req.params
    const { _id } = req.authUser

    // 2- check if the subcategory name is already exist
    const isNameDuplicated = await SubCategory.findOne({ name })
    if (isNameDuplicated) {
        return next({ cause: 409, message: 'SubCategory name is already exist' })
        // return next( new Error('Category name is already exist' , {cause:409}) )
    }

    // 3- check if the category is exist by using categoryId
    const category = await Category.findById(categoryId)
    if (!category) return next({ cause: 404, message: 'Category not found' })

    // 4- generate the slug
    const slug = slugify(name, '-')

    // 5- upload image to cloudinary
    if (!req.file) return next({ cause: 400, message: 'Image is required' })

    const folderId = generateUniqueString(4)
    const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${folderId}`
    })
    req.folder = `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${folderId}`

    // 6- generate the subCategory object
    const subCategory = {
        name,
        slug,
        Image: { secure_url, public_id },
        folderId,
        addedBy: _id,
        categoryId
    }
    // 7- create the subCategory
    const subCategoryCreated = await SubCategory.create(subCategory)
    req.savedDocuments = { model: SubCategory, _id: subCategoryCreated._id }

    res.status(201).json({ success: true, message: 'subCategory created successfully', data: subCategoryCreated })
}

/**
 * @name updateSubCategory
 * @body {name} - optional
 * @body {oldPublicId} - optional
 * @param {subCategoryId} - required
 * @description update the subCategory after checking if the subCategory is exist and the new name is not duplicated and upload the new image to cloudinary by using the oldPublicId to overwrite the old image
 */
export const updateSubCategory = async (req, res, next) => {
    // 1- destructuring the request body
    const { name, oldPublicId } = req.body
    // 2- destructuring the request params 
    const { subCategoryId } = req.params
    // 3- destructuring _id from the request authUser
    const { _id } = req.authUser

    // 4- check if the subCategory is exist by using subCategoryId
    const subCategory = await SubCategory.findById(subCategoryId).populate('categoryId', 'folderId')
    if (!subCategory) return next({ cause: 404, message: 'subCategory not found' })

    // 5- check if the use want to update the name field
    if (name) {
        // 5.1 check if the new category name different from the old name
        if (name == subCategory.name) {
            return next({ cause: 400, message: 'Please enter different subCategory name from the existing one.' })
        }

        // 5.2 check if the new category name is already exist
        const isNameDuplicated = await SubCategory.findOne({ name })
        if (isNameDuplicated) {
            return next({ cause: 409, message: 'subCategory name is already exist' })
        }

        // 5.3 update the category name and the category slug
        subCategory.name = name
        subCategory.slug = slugify(name, '-')
    }


    // 6- check if the user want to update the image
    if (oldPublicId) {
        if (!req.file) return next({ cause: 400, message: 'Image is required' })

        const newPublicId = oldPublicId.split(`${subCategory.folderId}/`)[1]

        const { secure_url } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: `${process.env.MAIN_FOLDER}/Categories/${subCategory.categoryId.folderId}/SubCategories/${subCategory.folderId}`,
            public_id: newPublicId
        })

        subCategory.Image.secure_url = secure_url
    }


    // 7- set value for the updatedBy field
    subCategory.updatedBy = _id

    await subCategory.save()
    res.status(200).json({ success: true, message: 'Category updated successfully', data: subCategory })
}


/**
 * @name getSubCategory
 * @param {subCategoryId} - required
 * @description get the subCategory by using subCategoryId and populate the brands and the products after using pagination and sorting if exist
 */
export const getAllSubCategories = async (req, res, next) => {
    const { page, size, sortBy} = req.query
    const features = new APIFeatures(req.query, SubCategory.find()).pagination({ page, size }).sort(sortBy)
    const subCategories = await features.mongooseQuery.populate([{
        path: 'Brands',
        populate:[{
            path:'Products'
        }]
    }])
    if (!subCategories) return next({ cause: 404, message: 'SubCategories not found' })
    res.status(200).json({ success: true, message: 'SubCategories fetched successfully', data: subCategories })
}

/**
 * @name deleteSubCategory
 * @param {subCategoryId} - required
 * @description delete the subCategory by using subCategoryId and delete the related brands and the category folder from cloudinary
 */
export const deleteSubCategory = async (req, res, next) => {
    const { subCategoryId } = req.params


    // 1-delete subcategory
    const subcategory = await SubCategory.findByIdAndDelete(subCategoryId).populate('categoryId', 'folderId')
    if (!subcategory) {
        return next({ cause: 404, message: 'subCategory not found' })
    }

    // 2-delete the related brands
    const brands = await Brand.deleteMany({ subCategoryId })
    if (brands.deletedCount <= 0) {
        console.log(brands.deletedCount);
        console.log('There is no related brands');
    }

    // 3- delete the related products
    const products = await Product.deleteMany({ subCategoryId })
    if (products.deletedCount <= 0) {
        console.log(products.deletedCount);
        console.log('There is no related products');
    }

    // 4- delete the category folder from cloudinary
    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/Categories/${subcategory.categoryId.folderId}/SubCategories/${subcategory.folderId}`)
    await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FOLDER}/Categories/${subcategory.categoryId.folderId}/SubCategories/${subcategory.folderId}`)

    res.status(200).json({ success: true, message: 'SubCategory deleted successfully' })
}

/**
 * @name getSubCategory
 * @param {subCategoryId} - required
 * @description get subCategory by using subCategoryId and populate the brands and the products 
 */
export const getSubCategory = async (req, res, next) => {
    const { subCategoryId } = req.params
    const features = new APIFeatures(req.query, SubCategory.find()).searchSubCategory({ id: subCategoryId })
    const subCategory = await features.mongooseQuery.populate([{
        path: 'Brands',
        populate:[{
            path:'Products'
        }]
    }])
    if (!subCategory) return next({ cause: 404, message: 'SubCategory not found' })

    res.status(200).json({ success: true, message: 'SubCategory fetched successfully', data: subCategory })
}