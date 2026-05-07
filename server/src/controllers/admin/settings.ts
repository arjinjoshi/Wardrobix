import { type Request, type Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/envelope";
import { getDbUserFromReq } from "../../middleware/auth";
import * as settingsService from "../../services/admin/settings";

export const getBanners = asyncHandler(async (req: Request, res: Response) => {
  const items = await settingsService.getBanners();
  res.json(ok({ items }));
});

export const createBanners = asyncHandler(async (req: Request, res: Response) => {
  const dbUser = await getDbUserFromReq(req);
  const files = (req.files || []) as Express.Multer.File[];
  const buffers = files.map(file => file.buffer);

  const items = await settingsService.createBanners(buffers, String(dbUser._id));
  res.json(ok({ items }));
});
