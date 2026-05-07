import { type Request, type Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/envelope";
import { getDbUserFromReq } from "../../middleware/auth";
import { requireText } from "../../utils/helpers";
import * as addressService from "../../services/customer/address";

export const getAddresses = asyncHandler(async (req: Request, res: Response) => {
  const dbUser = await getDbUserFromReq(req);
  const items = await addressService.getAddresses(String(dbUser._id));
  res.json(ok({ items }));
});

export const createAddress = asyncHandler(async (req: Request, res: Response) => {
  const dbUser = await getDbUserFromReq(req);
  const fullName = String(req.body.fullName || "").trim();
  const address = String(req.body.address || "").trim();
  const state = String(req.body.state || "").trim();
  const postalCode = String(req.body.postalCode || "").trim();
  const isDefault = req.body.isDefault === true;

  requireText(fullName, "Full name is required");
  requireText(address, "Address is required");
  requireText(state, "State is required");
  requireText(postalCode, "postal code is required");

  const items = await addressService.createAddress(String(dbUser._id), {
    fullName,
    address,
    state,
    postalCode,
    isDefault,
  });

  res.json(ok({ items }));
});

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const dbUser = await getDbUserFromReq(req);
  const addressId = String(req.params.addressId || "").trim();
  requireText(addressId, "Address id is required");

  const fullName = String(req.body.fullName || "").trim();
  const address = String(req.body.address || "").trim();
  const state = String(req.body.state || "").trim();
  const postalCode = String(req.body.postalCode || "").trim();
  const isDefault = req.body.isDefault === true;

  requireText(fullName, "Full name is required");
  requireText(address, "Address is required");
  requireText(state, "State is required");
  requireText(postalCode, "postal code is required");

  const items = await addressService.updateAddress(String(dbUser._id), addressId, {
    fullName,
    address,
    state,
    postalCode,
    isDefault,
  });

  res.json(ok({ items }));
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const dbUser = await getDbUserFromReq(req);
  const addressId = String(req.params.addressId || "").trim();
  requireText(addressId, "Address id is required");

  const items = await addressService.deleteAddress(String(dbUser._id), addressId);

  res.json(ok({ items }));
});
