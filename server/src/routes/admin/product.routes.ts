import { Router } from "express";
import multer from "multer";
import { requireAdmin } from "../../middleware/auth";
import * as productController from "../../controllers/admin/product";

export const adminProductRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldSize: 5 * 1024 * 1024,
    files: 10,
  },
});

adminProductRouter.use(requireAdmin);

// categories
adminProductRouter.get("/categories", productController.getCategories);
adminProductRouter.post("/categories", productController.createCategory);
adminProductRouter.put("/categories/:id", productController.updateCategory);

// products
adminProductRouter.get("/products", productController.getProducts);
adminProductRouter.get("/products/:id", productController.getProductById);

adminProductRouter.post(
  "/products",
  upload.array("images", 10),
  productController.createProduct
);

adminProductRouter.put(
  "/products/:id",
  upload.array("images", 10),
  productController.updateProduct
);
