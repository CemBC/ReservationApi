import prisma from "../config/prisma.js";

export async function getResourcesFiltered(options) {
  const {
    page,
    limit,
    isActive,
    location,
    search
  } = options;

  const where = {};

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  if (location) {
    where.location = {
      contains: location,
      mode: "insensitive"
    };
  }

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive"
        }
      },
      {
        description: {
          contains: search,
          mode: "insensitive"
        }
      }
    ];
  }

  const skip = (page - 1) * limit;

  const [resources, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      orderBy: {
        createdAt: "desc"
      },
      skip,
      take: limit
    }),

    prisma.resource.count({
      where
    })
  ]);

  return {
    data: resources,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getResourceById(id) {
  return await prisma.resource.findUnique({
    where: {
      id
    }
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

export async function updateResource(id, data) {
  return await prisma.resource.update({
    where: {
      id
    },
    data: {
      name: data.name,
      description: data.description,
      capacity: data.capacity,
      location: data.location,
      isActive: data.isActive
    }
  });
}

export async function deleteResource(id) {
  return await prisma.resource.delete({
    where: {
      id
    }
  });
}