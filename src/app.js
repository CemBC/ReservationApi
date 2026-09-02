import express from "express";
import resourceRoutes from "./routes/resource.routes.js";

const app = express();

app.use(express.json());
app.use("/api/resources" , resourceRoutes);

export default app;