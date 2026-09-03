import express from "express";

import {
  getResources,
  getResource,
  createNewResource,
  updateExistingResource,
  deleteExistingResource
} from "../controllers/resource.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

import {
  getResourcesSchema,
  getResourceByIdSchema,
  createResourceSchema,
  updateResourceSchema,
  deleteResourceSchema
} from "../validators/resource.validator.js";

const router = express.Router();

/**
 * @swagger
 * /api/resources:
 *   get:
 *     summary: Get resources
 *     tags:
 *       - Resources
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resources returned successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  authenticate,
  validate(getResourcesSchema),
  asyncHandler(getResources)
);

/**
 * @swagger
 * /api/resources/{id}:
 *   get:
 *     summary: Get resource by id
 *     tags:
 *       - Resources
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resource returned successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Resource not found
 */
router.get(
  "/:id",
  authenticate,
  validate(getResourceByIdSchema),
  asyncHandler(getResource)
);

/**
 * @swagger
 * /api/resources:
 *   post:
 *     summary: Create a new resource
 *     tags:
 *       - Resources
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - capacity
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *                 example: Meeting Room A
 *               description:
 *                 type: string
 *                 example: Main meeting room
 *               capacity:
 *                 type: integer
 *                 example: 6
 *               location:
 *                 type: string
 *                 example: Floor 1
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Resource created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 */
router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  validate(createResourceSchema),
  asyncHandler(createNewResource)
);

/**
 * @swagger
 * /api/resources/{id}:
 *   put:
 *     summary: Update a resource
 *     tags:
 *       - Resources
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               location:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Resource not found
 */
router.put(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  validate(updateResourceSchema),
  asyncHandler(updateExistingResource)
);

/**
 * @swagger
 * /api/resources/{id}:
 *   delete:
 *     summary: Delete a resource
 *     tags:
 *       - Resources
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Resource deleted successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Resource not found
 */
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  validate(deleteResourceSchema),
  asyncHandler(deleteExistingResource)
);

export default router;