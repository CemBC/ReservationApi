import { getAllResources  , getResourceById , createResource , updateResource , deleteResource} from "../services/resource.service.js";

export async function deleteExistingResource(req, res) {
    const id = Number(req.params.id);
    const existingResource = await getResourceById(id);

    if(!existingResource) {
        return res.status(400).json({
            message: "Resource not found"
        });
    }
    await deleteResource(id);
    
    return res.status(204).send();
}
export async function updateExistingResource(req ,res) {
    const id = Number(req.params.id);
    const existingResource = await getResourceById(id);

    if(!existingResource) {
        return res.status(404).json({
            message: "Resource not found"
        })
    }

    const resource = await updateResource(id , req.body);
    return res.status(200).json(resource);
}

export async function createNewResource(req , res){
    const resource = await createResource(req.body);

    res.status(201).json(resource);
}

export async function getResources(req , res){
    const resources = await getAllResources();

    res.status(200).json(resources);
}

export async function getResource(req , res) {
    const id = Number(req.params.id);
    const resource = await getResourceById(id);
    if(!resource) {
        return res.status(404).json({
            message: "Resource not found"
        })
    }

    res.status(200).json(resource);
}