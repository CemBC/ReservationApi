import {
  getResourcesFiltered,
  getResourceById,
  createResource,
  updateResource,
  deleteResource
} from "../services/resource.service.js";

import { AppError } from "../utils/app-error.js";

export async function getResources(req, res) {
  const result = await getResourcesFiltered(
    req.validated.query
  );

  res.status(200).json(result);
}

export async function getResource(req, res) {
  const id = Number(req.params.id);

  const resource = await getResourceById(id);

  if (!resource) {
    throw new AppError("Resource not found", 404);
  }

  res.status(200).json(resource);
}

export async function createNewResource(req, res) {
  const resource = await createResource(req.body);

  res.status(201).json(resource);
}

export async function updateExistingResource(req, res) {
  const id = Number(req.params.id);

  const existingResource = await getResourceById(id);

  if (!existingResource) {
    throw new AppError("Resource not found", 404);
  }

  const resource = await updateResource(
    id,
    req.body
  );

  res.status(200).json(resource);
}

export async function deleteExistingResource(req, res) {
  const id = Number(req.params.id);

  const existingResource = await getResourceById(id);

  if (!existingResource) {
    throw new AppError("Resource not found", 404);
  }

  await deleteResource(id);

  res.status(204).send();
}