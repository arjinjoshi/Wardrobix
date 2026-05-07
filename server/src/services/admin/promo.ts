import { Promo } from "../../models/Promo";
import { AppError } from "../../utils/AppError";
import { Types } from "mongoose";

type PromoDbItem = {
  _id?: Types.ObjectId;
  code: string;
  percentage: number;
  count: number;
  minimumOrderValue: number;
  startsAt: Date;
  endsAt: Date;
  createdAt?: Date;
};

export function mapPromo(item: PromoDbItem) {
  return {
    _id: String(item._id || ""),
    code: item.code,
    percentage: item.percentage,
    count: item.count,
    minimumOrderValue: item.minimumOrderValue,
    startsAt: item.startsAt,
    endsAt: item.endsAt,
    createdAt: item.createdAt,
  };
}

export const getAllPromos = async () => {
  const promos = await Promo.find().sort({ createdAt: -1 });
  return promos.map((item) => mapPromo(item.toObject()));
};

type CreatePromoData = {
  code: string;
  percentage: number;
  count: number;
  minimumOrderValue: number;
  startsAt: Date;
  endsAt: Date;
};

export const createPromo = async (payload: CreatePromoData) => {
  const existingPromo = await Promo.findOne({ code: payload.code });
  if (existingPromo) {
    throw new AppError(400, "Promo code already exists");
  }

  await Promo.create(payload);
  return await getAllPromos();
};

export const updatePromo = async (promoId: string, payload: CreatePromoData) => {
  const promo = await Promo.findById(promoId);
  if (!promo) {
    throw new AppError(404, "Promo not found");
  }

  const existingPromo = await Promo.findOne({
    code: payload.code,
    _id: { $ne: promo._id },
  });

  if (existingPromo) {
    throw new AppError(400, "Promo code already exists");
  }

  promo.code = payload.code;
  promo.percentage = payload.percentage;
  promo.count = payload.count;
  promo.minimumOrderValue = payload.minimumOrderValue;
  promo.startsAt = payload.startsAt;
  promo.endsAt = payload.endsAt;

  await promo.save();
  return await getAllPromos();
};

export const deletePromo = async (promoId: string) => {
  const promo = await Promo.findById(promoId);
  if (!promo) {
    throw new AppError(404, "Promo not found");
  }

  await Promo.findByIdAndDelete(promoId);
  return await getAllPromos();
};
