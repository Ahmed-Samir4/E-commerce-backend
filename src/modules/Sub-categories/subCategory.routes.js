
import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as subCategoryController from './subCategory.controller.js'
import { multerMiddleHost } from "../../middlewares/multer.js";
import { endPointsRoles } from "../Sub-categories/subCategory.endpoints.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { addSubCategorySchema, deleteSubCategorySchema, updateSubCategorySchema ,getSubCategorySchema } from "./subCategory.validationSchemas.js"
import { validationMiddleware } from "../../middlewares/validation.middleware.js"
const router = Router();

router.post('/:categoryId', auth(endPointsRoles.ADD_SubCategory),
    validationMiddleware(addSubCategorySchema),
    multerMiddleHost({
        extensions: allowedExtensions.image
    }).single('image'),
    expressAsyncHandler(subCategoryController.addSubCategory))

router.put('/:subCategoryId', auth(endPointsRoles.UPDATE_SubCategory),
    validationMiddleware(updateSubCategorySchema),
    multerMiddleHost({
        extensions: allowedExtensions.image
    }).single('image'),
    expressAsyncHandler(subCategoryController.updateSubCategory))

router.delete('/:subCategoryId', auth(endPointsRoles.DELETE_SubCategory),
    validationMiddleware(deleteSubCategorySchema),
    expressAsyncHandler(subCategoryController.deleteSubCategory))

router.get('/:subCategoryId',
    validationMiddleware(getSubCategorySchema),
    expressAsyncHandler(subCategoryController.getSubCategory))

router.get('/', expressAsyncHandler(subCategoryController.getAllSubCategories))
export default router;