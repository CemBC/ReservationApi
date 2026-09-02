import express from "express";

import resourceRoutes from "./routes/resource.routes.js";
import reservationRoutes from "./routes/reservation.routes.js";

const app = express();

app.use(express.json());

app.use("/api/resources", resourceRoutes);
app.use("/api/reservations", reservationRoutes);

export default app;