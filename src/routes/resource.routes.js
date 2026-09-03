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

const router = express.Router();

router.get("/", authenticate, getResources);
router.get("/:id", authenticate, getResource);

router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  createNewResource
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  updateExistingResource
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  deleteExistingResource
);

export default router;