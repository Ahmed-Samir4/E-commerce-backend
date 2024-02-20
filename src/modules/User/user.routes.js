import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as userController from "./user.controller.js";
import { endPointsRoles } from "./user.endpoints.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { updateUserSchema, deleteUserSchema, getUserDataSchema } from "./user.validationSchemas.js"
import { validationMiddleware } from "../../middlewares/validation.middleware.js"
const router = Router();



router.put('/:userId', auth(endPointsRoles.UPDATE_USER),
    validationMiddleware(updateUserSchema),
    expressAsyncHandler(userController.updateUser))

router.delete('/:userId', auth(endPointsRoles.DELETE_USER),
    validationMiddleware(deleteUserSchema),
    expressAsyncHandler(userController.deleteUser))

router.get('/:userId', auth(endPointsRoles.GET_USER),
    validationMiddleware(getUserDataSchema),
    expressAsyncHandler(userController.getUserData))




export default router;