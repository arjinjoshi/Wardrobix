import { type Request, type Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/envelope";
import { requireText } from "../../utils/helpers";
import { AppError } from "../../utils/AppError";
import * as promoService from "../../services/admin/promo";

function parsePromoPayload(req: Request) {
  const code = String(req.body.code || "")
    .trim()
    .toUpperCase();
  const percentage = Number(req.body.percentage);
  const count = Number(req.body.count);
  const minimumOrderValue = Number(req.body.minimumOrderValue);
  const startsAt = new Date(req.body.startsAt);
  const endsAt = new Date(req.body.endsAt);

  requireText(code, "promo code is required");

  if (Number.isNaN(percentage) || percentage < 1 || percentage > 100) {
    throw new AppError(400, "Percentage must be between 1 and 10");
  }

  if (!Number.isInteger(count) || count < 1) {
    throw new AppError(400, "Promo count must be atleast 1");
  }

  if (Number.isNaN(minimumOrderValue) || minimumOrderValue < 0) {
    throw new AppError(400, "Promo count must be atleast 0 or more");
  }

  if (Number.isNaN(startsAt.getTime())) {
    throw new AppError(400, "Valid start time is required");
  }
  if (Number.isNaN(endsAt.getTime())) {
    throw new AppError(400, "Valid end time is required");
  }

  if (endsAt <= startsAt) {
    throw new AppError(400, "End time should be after start time");
  }

  return {
    code,
    percentage,
    count,
    minimumOrderValue,
    startsAt,
    endsAt,
  };
}

export const getAllPromos = asyncHandler(async (_req: Request, res: Response) => {
  const items = await promoService.getAllPromos();
  res.json(ok({ items }));
});

export const createPromo = asyncHandler(async (req: Request, res: Response) => {
  const payload = parsePromoPayload(req);
  const items = await promoService.createPromo(payload);
  res.json(ok({ items }));
});

export const updatePromo = asyncHandler(async (req: Request, res: Response) => {
  const promoId = String(req.params.promoId || "").trim();
  requireText(promoId, "Promo Id is needed here");

  const payload = parsePromoPayload(req);
  const items = await promoService.updatePromo(promoId, payload);
  res.json(ok({ items }));
});

export const deletePromo = asyncHandler(async (req: Request, res: Response) => {
  const promoId = String(req.params.promoId || "").trim();
  requireText(promoId, "Promo Id is needed here");

  const items = await promoService.deletePromo(promoId);
  res.json(ok({ items }));
});
