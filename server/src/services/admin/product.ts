import { Category } from "../../models/Category";
import { Product } from "../../models/Product";
import { AppError } from "../../utils/AppError";
import { uploadManyBuffersToCloudinary } from "../../utils/cloudinary";

type UploadedImage = {
  url: string;
  publicId: string;
  isCover: boolean;
};

export const getCategories = async () => {
  return await Category.find({}).sort({ name: 1 });
};

export const createCategory = async (name: string) => {
  return await Category.create({ name });
};

export const updateCategory = async (categoryId: string, name: string) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new AppError(404, "Category not found");
  }
  category.name = name;
  await category.save();
  return category;
};

export const getProducts = async (search: string) => {
  const query: Record<string, unknown> = {};
  if (search) {
    query.title = { $regex: search, $options: "i" };
  }
  return await Product.find(query).populate("category", "name").sort({ createdAt: -1 });
};

export const getProductById = async (productId: string) => {
  const product = await Product.findById(productId).populate("category", "name");
  if (!product) {
    throw new AppError(404, "Product not found");
  }
  return product;
};

type CreateProductData = {
  title: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  salePercentage: number;
  stock: number;
  status: string;
  colors: string[];
  sizes: string[];
  createdBy: string;
  files: Buffer[];
};

export const createProduct = async (data: CreateProductData) => {
  const existingCategory = await Category.findById(data.category);
  if (!existingCategory) {
    throw new AppError(404, "Category not found");
  }

  if (!data.files.length) {
    throw new AppError(400, "Atleast one image is needed");
  }

  const uploadedImages = await uploadManyBuffersToCloudinary(data.files);

  const images = uploadedImages.map((img, index) => ({
    url: img.url,
    publicId: img.publicId,
    isCover: index === 0,
  }));

  const product = await Product.create({
    title: data.title,
    description: data.description,
    category: data.category,
    brand: data.brand,
    images,
    colors: data.colors,
    sizes: data.sizes,
    price: data.price,
    salePercentage: data.salePercentage,
    stock: data.stock,
    status: data.status,
    createdBy: data.createdBy,
  });

  return await Product.findById(product._id).populate("category", "name");
};

type UpdateProductData = {
  productId: string;
  title: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  salePercentage: number;
  stock: number;
  status: "active" | "inactive";
  colors: string[];
  sizes: string[];
  coverImagePublicId: string;
  files: Buffer[];
};

export const updateProduct = async (data: UpdateProductData) => {
  const existingCategoryDoc = await Category.findById(data.category);
  if (!existingCategoryDoc) {
    throw new AppError(404, "Category not found");
  }

  const productDoc = await Product.findById(data.productId);
  if (!productDoc) {
    throw new AppError(404, "Product not found");
  }

  const uploadNewImages = await uploadManyBuffersToCloudinary(data.files);

  const newlyAddedImages = uploadNewImages.map((image) => ({
    url: image.url,
    publicId: image.publicId,
    isCover: false,
  }));

  let existingImages: UploadedImage[] = productDoc.images.map(
    (img: UploadedImage) => ({
      url: img.url,
      publicId: img.publicId,
      isCover: img.isCover,
    })
  );

  const mergedImages: UploadedImage[] = [
    ...existingImages,
    ...newlyAddedImages,
  ];

  if (!mergedImages.length) {
    throw new AppError(400, "Atleast one img is needed");
  }

  const finalImages: UploadedImage[] = mergedImages.map(
    (image: UploadedImage, index) => ({
      url: image.url,
      publicId: image.publicId,
      isCover: data.coverImagePublicId
        ? image.publicId === data.coverImagePublicId
        : index === 0,
    })
  );

  productDoc.title = data.title;
  productDoc.description = data.description;
  productDoc.category = existingCategoryDoc._id;
  productDoc.brand = data.brand;
  productDoc.colors = data.colors;
  productDoc.sizes = data.sizes;
  productDoc.price = data.price;
  productDoc.salePercentage = data.salePercentage;
  productDoc.stock = data.stock;
  productDoc.status = data.status;
  productDoc.set("images", finalImages);

  await productDoc.save();

  return await Product.findById(productDoc._id).populate("category", "name");
};
