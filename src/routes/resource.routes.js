import express from "express";
import { getResources , getResource, createNewResource , updateExistingResource , deleteExistingResource} from "../controllers/resource.controller.js";

const router = express.Router();

router.get("/" , getResources);
router.get("/:id" , getResource);
router.post("/" , createNewResource);
router.put("/:id" , updateExistingResource);
router.delete("/:id" , deleteExistingResource);

export default router;