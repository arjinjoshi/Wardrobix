import { type Request, type Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/envelope";
import * as homeService from "../../services/customer/home";

export const getHomeData = asyncHandler(async (_req: Request, res: Response) => {
  const data = await homeService.getHomeData();
  res.json(ok(data));
});
