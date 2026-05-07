import { type Request, type Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/envelope";
import { getDbUserFromReq } from "../../middleware/auth";
import { requireText } from "../../utils/helpers";
import * as checkoutService from "../../services/customer/checkout";

export const createSession = asyncHandler(async (req: Request, res: Response) => {
  const dbUser = await getDbUserFromReq(req);
  const addressId = String(req.body.addressId || "").trim();
  const promoCode = String(req.body.promoCode || "").trim().toUpperCase();
  const returnUrl = String(req.body.returnUrl || "").trim();
  const websiteUrl = String(req.body.websiteUrl || "").trim();

  requireText(addressId, "Address is required");
  requireText(returnUrl, "returnUrl is required");
  requireText(websiteUrl, "websiteUrl is required");

  const data = await checkoutService.createSession(
    String(dbUser._id),
    addressId,
    promoCode,
    returnUrl,
    websiteUrl
  );

  res.json(ok(data));
});

export const confirmCheckout = asyncHandler(async (req: Request, res: Response) => {
  const dbUser = await getDbUserFromReq(req);
  const pidx = String(req.body.pidx || "").trim();

  requireText(pidx, "pidx is required");

  const data = await checkoutService.confirmCheckout(
    String(dbUser._id),
    pidx
  );

  res.json(ok(data));
});
