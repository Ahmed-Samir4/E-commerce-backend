import slugify from 'slugify'

import Brand from '../../../DB/Models/brand.model.js'
import subCategory from '../../../DB/Models/sub-category.model.js'
import cloudinaryConnection from '../../utils/cloudinary.js'
import generateUniqueString from '../../utils/generate-Unique-String.js'
import Product from '../../../DB/Models/product.model.js'
import { APIFeatures } from '../../utils/api-features.js'


/**
 * @name addBrand
 * @body {name} - required
 * @param {categoryId} - required
 * @param {subCategoryId} - required
 * @description add new brand to the subCategory after checking if the subCategory is exist and the brand name is not duplicated and upload the image to cloudinary
 */
export const addBrand = async (req, res, next) => {
    // 1- desturcture the required data from teh request object
    const { name } = req.body
    const { categoryId, subCategoryId } = req.query
    const { _id } = req.authUser
    // category check , subcategory check
    // 2- subcategory check
    const subCategoryCheck = await subCategory.findById(subCategoryId).populate('categoryId', 'folderId')
    if (!subCategoryCheck) return next({ message: 'SubCategory not found', cause: 404 })

    // 3- duplicate  brand document check 
    const isBrandExists = await Brand.findOne({ name, subCategoryId })
    if (isBrandExists) return next({ message: 'Brand already exists for this subCategory', cause: 400 })

    // 4- categogry check
    if (categoryId != subCategoryCheck.categoryId._id) return next({ message: 'Category not found', cause: 404 })

    // 5 - generate the slug
    const slug = slugify(name, '-')

    // 6- upload brand logo
    if (!req.file) return next({ message: 'Please upload the brand logo', cause: 400 })

    const folderId = generateUniqueString(4)
    const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${subCategoryCheck.categoryId.folderId}/SubCategories/${subCategoryCheck.folderId}/Brands/${folderId}`,
    })
    req.folder = `${process.env.MAIN_FOLDER}/Categories/${subCategoryCheck.categoryId.folderId}/SubCategories/${subCategoryCheck.folderId}/Brands/${folderId}`

    const brandObject = {
        name, slug,
        Image: { secure_url, public_id },
        folderId,
        addedBy: _id,
        subCategoryId,
        categoryId
    }

    const newBrand = await Brand.create(brandObject)
    req.savedDocuments = { model: Brand, _id: newBrand._id }
    res.status(201).json({
        status: 'success',
        message: 'Brand added successfully',
        data: newBrand
    })

}

/**
 * @name updateBrand
 * @body {name} - optional
 * @body {oldPublicId} - optional
 * @param {brandId} - required
 * @description update the brand after checking if the brand is exist and the new name is not duplicated after checking the owner of the brand and upload the new image to cloudinary by using the oldPublicId to overwrite the old image
 */
export const updateBrand = async (req, res, next) => {
    // 1- destructuring the request body
    const { name, oldPublicId } = req.body
    // 2- destructuring the request params 
    const { brandId } = req.params
    // 3- destructuring _id from the request authUser
    const { _id } = req.authUser

    // 4- check if the brand is exist bu using brandId
    const brand = await Brand.findById(brandId).populate('categoryId', 'folderId').populate('subCategoryId', 'folderId')
    if (!brand) return next({ cause: 404, message: 'Brand not found' })
    // 5- check if the owner of the brand is the same as the user 
    if (brand.addedBy.toString() !== _id.toString()) {
        return next({ cause: 403, message: 'You are not the owner of this brand' })
    }

    // 6- check if the use want to update the name field
    if (name) {
        // 6.1 check if the new brand name different from the old name
        if (name == brand.name) {
            return next({ cause: 400, message: 'Please enter different brand name from the existing one.' })
        }

        // 6.2 check if the new brand name is already exist
        const isNameDuplicated = await Brand.findOne({ name })
        if (isNameDuplicated) {
            return next({ cause: 409, message: 'Brand name is already exist' })
        }

        // 6.3 update the brand name and the brand slug
        brand.name = name
        brand.slug = slugify(name, '-')
    }
    // 7- check if the user want to update the image
    if (oldPublicId) {
        if (!req.file) return next({ cause: 400, message: 'Image is required' })

        const newPulicId = oldPublicId.split(`${brand.folderId}/`)[1]

        const { secure_url } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: `${process.env.MAIN_FOLDER}/Categories/${brand.categoryId.folderId}/SubCategories/${brand.subCategoryId.folderId}/Brands/${brand.folderId}`,
            public_id: newPulicId
        })

        brand.Image.secure_url = secure_url
    }


    // 8- set value for the updatedBy field
    brand.updatedBy = _id

    // 9- update the brand
    const updatedBrand = await brand.save()

    res.status(200).json({ success: true, message: 'Brand updated successfully', data: brand })

}

/**
 * @name deleteBrand
 * @param {brandId} - required
 * @description delete the brand after checking if the brand is exist and the owner of the brand is the same as the user and delete the related products and the brand folder from cloudinary
 */
export const deleteBrand = async (req, res, next) => {
    // 1- destructuring the request params
    const { brandId } = req.params
    // 2- destructuring _id from the request authUser
    const { _id } = req.authUser
    // 3- check if the brand is exist bu using brandId
    const brand = await Brand.findById(brandId).populate('categoryId', 'folderId').populate('subCategoryId', 'folderId')
    if (!brand) return next({ cause: 404, message: 'Brand not found' })
    // 4- check if the owner of the brand is the same as the user
    if (brand.addedBy.toString() !== _id.toString()) {
        return next({ cause: 403, message: 'You are not the owner of this brand' })
    }
    // 5- delete the brand from the database
    await Brand.findByIdAndDelete(brandId)
    // 6- delete related products
    const products = await Product.deleteMany({ brandId })
    if (products.deletedCount <= 0) {
        console.log(products.deletedCount);
        console.log('There is no related products');
    }
    // 7- delete the brand folder from cloudinary
    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/Categories/${brand.categoryId.folderId}/SubCategories/${brand.subCategoryId.folderId}/Brands/${brand.folderId}`)
    await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FOLDER}/Categories/${brand.categoryId.folderId}/SubCategories/${brand.subCategoryId.folderId}/Brands/${brand.folderId}`)

    res.status(200).json({ success: true, message: 'Brand deleted successfully' })
}

/**
 * @name getAllBrands
 * @query {page, size, sortBy , search, filters}
 * @description get all brands with category and subcategory names and use pagination
 */
export const getAllBrands = async (req, res, next) => {
    const { page, size, sortBy, ...search } = req.query
    // get all brands with category and subcategory names
    const features = new APIFeatures(req.query, Brand.find()).pagination({ page, size }).sort(sortBy).searchBrand(search)
    const brands = await features.mongooseQuery.populate('categoryId', 'name').populate('subCategoryId', 'name')
    if (!brands) return next({ cause: 404, message: 'Brands not found' })
    res.status(200).json({ success: true, data: brands })
}


