import { type Request, type Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/envelope";
import * as productService from "../../services/customer/product";

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await productService.getCategories();
  res.json(ok(categories));
});

export const getProducts = asyncHandler(
  async (
    req: Request<{}, {}, {}, productService.ProductAppliedFilterListQuery>,
    res: Response
  ) => {
    const filters = {
      category: (req.query.category || "").trim(),
      brand: (req.query.brand || "").trim(),
      color: (req.query.color || "").trim(),
      size: (req.query.size || "").trim(),
      sort: req.query.sort || "recent",
    };

    const products = await productService.getProducts(filters);
    res.json(ok(products));
  }
);

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const productId = String(req.params.id);
  const data = await productService.getProductById(productId);
  res.json(ok(data));
});
