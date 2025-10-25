import { Router } from "express";
import * as ctrl from "../controllers/tasks.controller.js";
const r = Router();
r.post("/", ctrl.createTask);
r.get("/", ctrl.listTasks);
r.get("/:id", ctrl.getTask);
r.put("/:id", ctrl.updateTask);
r.delete("/:id", ctrl.deleteTask);
export default r;
