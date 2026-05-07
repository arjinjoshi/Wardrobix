import { Category } from "../../models/Category";
import { Product } from "../../models/Product";
import { requireFound } from "../../utils/helpers";

export type ProductSort = "recent" | "price-low" | "price-high";

export type ProductAppliedFilterListQuery = {
  category?: string;
  brand?: string;
  color?: string;
  size?: string;
  sort?: ProductSort;
};

export const getCategories = async () => {
  return await Category.find({}).sort({ name: 1 });
};

export const getProducts = async (filters: ProductAppliedFilterListQuery) => {
  const { category, brand, color, size, sort = "recent" } = filters;

  const query: Record<string, unknown> = {
    status: "active",
  };

  if (category) {
    query.category = category;
  }
  if (brand) {
    query.brand = brand;
  }
  if (color) {
    query.colors = color;
  }
  if (size) {
    query.sizes = size;
  }

  let sortOption: Record<string, 1 | -1> = { createdAt: -1 };

  if (sort === "price-low") {
    sortOption = { price: 1 };
  }

  if (sort === "price-high") {
    sortOption = { price: -1 };
  }

  return await Product.find(query).populate("category", "name").sort(sortOption);
};

export const getProductById = async (productId: string) => {
  const product = await Product.findOne({
    _id: productId,
    status: "active",
  }).populate("category", "name");

  const foundProduct = requireFound(product, "Product not found", 404);

  const relatedProducts = await Product.find({
    _id: { $ne: foundProduct._id },
    category: foundProduct.category,
    status: "active",
  })
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .limit(4);

  return {
    product: foundProduct,
    relatedProducts,
  };
};
