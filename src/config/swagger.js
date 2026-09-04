import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Reservation API",
      version: "1.0.0",
      description:
        "REST API for managing resources and reservations"
    },

    servers: [
      {
        url: process.env.NODE_ENV === "production"
      ? "https://reservation-api-cembc-hfebdgh3exefe2ez.italynorth-01.azurewebsites.net"
      : "http://localhost:3000"
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },

      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1
            },
            fullName: {
              type: "string",
              example: "Test User"
            },
            email: {
              type: "string",
              example: "test@example.com"
            },
            role: {
              type: "string",
              enum: ["USER", "ADMIN"]
            }
          }
        },

        Resource: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1
            },
            name: {
              type: "string",
              example: "Meeting Room A"
            },
            description: {
              type: "string",
              nullable: true
            },
            capacity: {
              type: "integer",
              example: 6
            },
            location: {
              type: "string",
              example: "Floor 1"
            },
            isActive: {
              type: "boolean",
              example: true
            },
            createdAt: {
              type: "string",
              format: "date-time"
            }
          }
        },

        Reservation: {
          type: "object",
          properties: {
            id: {
              type: "integer"
            },
            userId: {
              type: "integer"
            },
            resourceId: {
              type: "integer"
            },
            startDate: {
              type: "string",
              format: "date-time"
            },
            endDate: {
              type: "string",
              format: "date-time"
            },
            status: {
              type: "string",
              enum: [
                "ACTIVE",
                "CANCELLED",
                "COMPLETED"
              ]
            },
            createdAt: {
              type: "string",
              format: "date-time"
            }
          }
        },

        ErrorResponse: {
          type: "object",
          properties: {
            message: {
              type: "string"
            }
          }
        }
      }
    }
  },

  apis: [
    "./src/routes/*.js"
  ]
};

export const swaggerSpec =
  swaggerJsdoc(options);