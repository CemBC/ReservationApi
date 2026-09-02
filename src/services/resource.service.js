import prisma from "../config/prisma.js";
export async function deleteResource(id) {
    return await prisma.resource.delete({
        where: {
            id: id
        }
    })
    
}
export async function getAllResources() {
  return await prisma.resource.findMany();
}

export async function getResourceById(id){
    return await prisma.resource.findUnique({
        where: { id : id}
    });
}

export async function createResource(data) {
    return await prisma.resource.create({
        data: {
            name: data.name,
            description: data.description,
            capacity: data.capacity,
            location: data.location,
            isActive: data.isActive
        }
    });
}

export async function updateResource(id , data) {
    return await prisma.resource.update({
        where: {
            id: id
        },
        data: {
            name: data.name,
            description: data.description,
            capacity: data.capacity,
            location: data.location,
            isActive: data.isActive
        }
    })
}