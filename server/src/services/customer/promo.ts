import { AppError } from "../../utils/AppError";
import { Promo } from "../../models/Promo";

export const applyPromo = async (code: string, orderValue: number) => {
  const promo = await Promo.findOne({ code });

  if (!promo) {
    throw new AppError(404, "Promo not found");
  }

  const now = new Date();

  if (now < promo.startsAt) {
    throw new AppError(400, "Promo code is not activated");
  }

  if (now > promo.endsAt) {
    throw new AppError(400, "Promo code is expired");
  }

  if (promo.count < 1) {
    throw new AppError(400, "Promo code limit is already excedded");
  }

  if (orderValue < promo.minimumOrderValue) {
    throw new AppError(
      400,
      `Minimum order value for this promo is ${promo.minimumOrderValue}`
    );
  }

  return {
    code: promo.code,
    percentage: promo.percentage,
    count: promo.count,
    minimumOrderValue: promo.minimumOrderValue,
  };
};
