import { Router } from 'express'
import expressAsyncHandler from 'express-async-handler'

import * as brandController from './brand.controller.js'
import { multerMiddleHost } from '../../middlewares/multer.js'
import { allowedExtensions } from '../../utils/allowed-extensions.js'
import { endPointsRoles } from './brand.endpoints.js'
import { auth } from '../../middlewares/auth.middleware.js'
import { addBrandSchema, deleteBrandSchema, updateBrandSchema, getAllBrandsSchema } from './brand.validationSchemas.js'
import { validationMiddleware } from '../../middlewares/validation.middleware.js'

const router = Router()

router.post('/',
    auth(endPointsRoles.ADD_BRAND),
    validationMiddleware(addBrandSchema),
    multerMiddleHost({
        extensions: allowedExtensions.image
    }).single('image'),
    expressAsyncHandler(brandController.addBrand))

router.put('/:brandId',
    auth(endPointsRoles.UPDATE_BRAND),
    validationMiddleware(updateBrandSchema),
    multerMiddleHost({
        extensions: allowedExtensions.image
    }).single('image'),
    expressAsyncHandler(brandController.updateBrand))

router.delete('/:brandId',
    auth(endPointsRoles.DELETE_BRAND),
    validationMiddleware(deleteBrandSchema),
    expressAsyncHandler(brandController.deleteBrand))

router.get('/',
    // validationMiddleware(getAllBrandsSchema),
    expressAsyncHandler(brandController.getAllBrands))



export default router
