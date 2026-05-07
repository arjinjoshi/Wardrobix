import { Banner, BannerDocument } from "../../models/Banner";
import { AppError } from "../../utils/AppError";
import { uploadManyBuffersToCloudinary } from "../../utils/cloudinary";

export type AdminBannerItem = {
  _id: string;
  imageUrl: string;
  imagePublicId: string;
  createdAt: string;
};

export function mapBanner(item: BannerDocument): AdminBannerItem {
  return {
    _id: String(item._id),
    imageUrl: item.imageUrl,
    imagePublicId: item.imagePublicId,
    createdAt: item.createdAt.toISOString(),
  };
}

const BANNER_FOLDER = "ecommerce-monster-video/banners";

export const getBanners = async () => {
  const items = await Banner.find().sort({ createdAt: -1 });
  return items.map(mapBanner);
};

export const createBanners = async (files: Buffer[], createdBy: string) => {
  if (!files.length) {
    throw new AppError(400, "At least one image is required");
  }

  const uploadedImages = await uploadManyBuffersToCloudinary(
    files,
    BANNER_FOLDER
  );

  const createFinalBanners = await Banner.insertMany(
    uploadedImages.map((item) => ({
      imageUrl: item.url,
      imagePublicId: item.publicId,
      createdBy: createdBy,
    }))
  );

  return createFinalBanners.map(mapBanner);
};
