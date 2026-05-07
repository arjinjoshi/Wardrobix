import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import * as cartWishlistController from "../../controllers/customer/cart-wishlist";

export const customerCartWishlistRouter = Router();

customerCartWishlistRouter.use(requireAuth);

customerCartWishlistRouter.get("/cart", cartWishlistController.getCart);
customerCartWishlistRouter.post("/cart/items", cartWishlistController.addToCart);
customerCartWishlistRouter.patch("/cart/items/:productId/increase", cartWishlistController.increaseCartItem);
customerCartWishlistRouter.patch("/cart/items/:productId/decrease", cartWishlistController.decreaseCartItem);
customerCartWishlistRouter.delete("/cart/items/:productId", cartWishlistController.deleteCartItem);
customerCartWishlistRouter.post("/cart/sync", cartWishlistController.syncCart);

customerCartWishlistRouter.get("/wishlist", cartWishlistController.getWishlist);
customerCartWishlistRouter.post("/wishlist/items", cartWishlistController.addToWishlist);
customerCartWishlistRouter.delete("/wishlist/items/:productId", cartWishlistController.deleteFromWishlist);
