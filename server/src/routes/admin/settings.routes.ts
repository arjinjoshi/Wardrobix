import { Router } from "express";
import multer from "multer";
import { requireAdmin } from "../../middleware/auth";
import * as settingsController from "../../controllers/admin/settings";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldSize: 5 * 1024 * 1024,
    files: 10,
  },
});

export const adminSettingsRouter = Router();

adminSettingsRouter.use(requireAdmin);

adminSettingsRouter.get("/settings/banners", settingsController.getBanners);

adminSettingsRouter.post(
  "/settings/banners",
  upload.array("images", 10),
  settingsController.createBanners
);
