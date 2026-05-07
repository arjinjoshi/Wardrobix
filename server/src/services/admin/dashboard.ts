import { Category } from "../../models/Category";
import { Order } from "../../models/Order";
import { Product } from "../../models/Product";


type TotalSaleRow = {
    _id: null;
    totalSales: number;
  };

export const getDashboardStats = async () => {
  const [
    totalProducts,
    totalCategories,
    totalOrders,
    totalReturnedOrders,
    salesRows,
  ] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: "returned" }),
    Order.aggregate<TotalSaleRow>([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } },
    ]),
  ]);

  return {
    totalProducts,
    totalCategories,
    totalSales: salesRows[0]?.totalSales || 0,
    totalOrders,
    totalReturnedOrders,
  };
};