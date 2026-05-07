import { type Request, type Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/envelope";
import { getDbUserFromReq } from "../../middleware/auth";
import { requireText } from "../../utils/helpers";
import { AppError } from "../../utils/AppError";
import * as cartWishlistService from "../../services/customer/cart-wishlist";

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const dbUser = await getDbUserFromReq(req);
  const data = await cartWishlistService.getCartResponse(String(dbUser._id));
  res.json(ok(data));
});

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const dbUser = await getDbUserFromReq(req);

  const productId = String(req.body.productId || "").trim();
  const quantity = Number(req.body.quantity || 1);
  const colorValue = String(req.body.color || "").trim();
  const sizeValue = String(req.body.size || "").trim();

  requireText(productId, "Product id is required");

  if (Number.isNaN(quantity) || quantity < 1) {
    throw new AppError(400, "Quantity must be at least 1");
  }

  const data = await cartWishlistService.addToCart(
    String(dbUser._id),
    productId,
    quantity,
    colorValue,
    sizeValue
  );

  res.json(ok(data));
});

export const increaseCartItem = asyncHandler(async (req: Request, res: Response) => {
  const dbUser = await getDbUserFromReq(req);
  const productId = String(req.params.productId || "").trim();
  const colorValue = String(req.query.color || "").trim();
  const sizeValue = String(req.query.size || "").trim();

  requireText(productId, "Product id is required");

  const data = await cartWishlistService.increaseCartItem(
    String(dbUser._id),
    productId,
    colorValue,
    sizeValue
  );

  res.json(ok(data));
});

export const decreaseCartItem = asyncHandler(async (req: Request, res: Response) => {
  const dbUser = await getDbUserFromReq(req);
  const productId = String(req.params.productId || "").trim();
  const colorValue = String(req.query.color || "").trim();
  const sizeValue = String(req.query.size || "").trim();

  requireText(productId, "Product id is required");

  const data = await cartWishlistService.decreaseCartItem(
    String(dbUser._id),
    productId,
    colorValue,
    sizeValue
  );

  res.json(ok(data));
});

export const deleteCartItem = asyncHandler(async (req: Request, res: Response) => {
  const dbUser = await getDbUserFromReq(req);
  const productId = String(req.params.productId || "").trim();
  const colorValue = String(req.query.color || "").trim();
  const sizeValue = String(req.query.size || "").trim();

  requireText(productId, "Product id is required");

  const data = await cartWishlistService.deleteCartItem(
    String(dbUser._id),
    productId,
    colorValue,
    sizeValue
  );

  res.json(ok(data));
});

export const syncCart = asyncHandler(async (req: Request, res: Response) => {
  const dbUser = await getDbUserFromReq(req);

  const incomingItems = Array.isArray(req.body.items)
    ? (req.body.items as cartWishlistService.SyncCartItemInput[])
    : [];

  const data = await cartWishlistService.syncCart(String(dbUser._id), incomingItems);

  res.json(ok(data));
});

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const dbUser = await getDbUserFromReq(req);
  const data = await cartWishlistService.getWishlistResponse(String(dbUser._id));
  res.json(ok(data));
});

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  const dbUser = await getDbUserFromReq(req);
  const productId = String(req.body.productId || "").trim();

  requireText(productId, "Product id is required");

  const data = await cartWishlistService.addToWishlist(String(dbUser._id), productId);

  res.json(ok(data));
});

export const deleteFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  const dbUser = await getDbUserFromReq(req);
  const productId = String(req.params.productId || "").trim();

  requireText(productId, "Product id is required");

  const data = await cartWishlistService.deleteFromWishlist(String(dbUser._id), productId);

  res.json(ok(data));
});
