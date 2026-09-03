import express from "express";
import swaggerUi from "swagger-ui-express";

import resourceRoutes from "./routes/resource.routes.js";
import reservationRoutes from "./routes/reservation.routes.js";
import authRoutes from "./routes/auth.routes.js";

import {
  notFoundHandler,
  errorHandler
} from "./middleware/error.middleware.js";

import {
  swaggerSpec
} from "./config/swagger.js";

const app = express();

app.use(express.json());

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use(
  "/api/reservations",
  reservationRoutes
);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;