import { type Request, type Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/envelope";
import { requireNumber, requireText } from "../../utils/helpers";
import { getDbUserFromReq } from "../../middleware/auth";
import * as productService from "../../services/admin/product";

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await productService.getCategories();
  res.json(ok(categories));
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const name = String(req.body.name || "").trim();
  requireText(name, "Category name is needed");

  const category = await productService.createCategory(name);
  res.status(201).json(ok(category));
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const name = String(req.body.name || "").trim();
  const extractCategoryId = req.params.id as string;
  requireText(name, "Category name is needed");

  const category = await productService.updateCategory(extractCategoryId, name);
  res.json(ok(category));
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const search = String(req.query.search || "").trim();
  const products = await productService.getProducts(search);
  res.json(ok(products));
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.id as string;
  const product = await productService.getProductById(productId);
  res.json(ok(product));
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const title = String(req.body.title || "").trim();
  const description = String(req.body.description || "").trim();
  const category = String(req.body.category || "").trim();
  const brand = String(req.body.brand || "").trim();
  const price = Number(req.body.price);
  const salePercentage = Number(req.body.salePercentage || 0);
  const stock = Number(req.body.stock);
  const status = String(req.body.status || "active").trim();
  const colors = req.body.colors || [];
  const sizes = req.body.sizes || [];

  requireText(title, "Title is required");
  requireText(description, "Description is required");
  requireText(category, "Category is required");
  requireText(brand, "Brand is required");
  requireNumber(price, "Price is required");
  requireNumber(salePercentage, "Sale Percentage is required");
  requireNumber(stock, "Stock is required");

  const files = (req.files as Express.Multer.File[]) || [];
  const buffers = files.map(file => file.buffer);

  const user = await getDbUserFromReq(req);

  const product = await productService.createProduct({
    title,
    description,
    category,
    brand,
    price,
    salePercentage,
    stock,
    status,
    colors,
    sizes,
    createdBy: String(user._id),
    files: buffers,
  });

  res.status(201).json(ok(product));
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const productId = req.params.id as string;
  const title = String(req.body.title || "").trim();
  const description = String(req.body.description || "").trim();
  const category = String(req.body.category || "").trim();
  const brand = String(req.body.brand || "").trim();
  const price = Number(req.body.price);
  const salePercentage = Number(req.body.salePercentage || 0);
  const stock = Number(req.body.stock);
  const status = String(req.body.status || "active").trim() as "active" | "inactive";
  const colors = req.body.colors || [];
  const sizes = req.body.sizes || [];
  const coverImagePublicId = String(req.body.coverImagePublicId || "").trim();

  requireText(title, "Title is required");
  requireText(description, "Description is required");
  requireText(category, "Category is required");
  requireText(brand, "Brand is required");
  requireNumber(price, "Price is required");
  requireNumber(salePercentage, "Sale Percentage is required");
  requireNumber(stock, "Stock is required");

  const files = (req.files as Express.Multer.File[]) || [];
  const buffers = files.map(file => file.buffer);

  const product = await productService.updateProduct({
    productId,
    title,
    description,
    category,
    brand,
    price,
    salePercentage,
    stock,
    status,
    colors,
    sizes,
    coverImagePublicId,
    files: buffers,
  });

  res.json(ok(product));
});
