import { Router } from "express";
import * as homeController from "../../controllers/customer/home";

export const customerHomeRouter = Router();

customerHomeRouter.get("/home", homeController.getHomeData);
