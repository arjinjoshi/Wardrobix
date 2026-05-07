import { Router } from "express";
import * as productController from "../../controllers/customer/product";

export const customerProductRouter = Router();

customerProductRouter.get("/categories", productController.getCategories);
customerProductRouter.get("/products", productController.getProducts);
customerProductRouter.get("/products/:id", productController.getProductById);
