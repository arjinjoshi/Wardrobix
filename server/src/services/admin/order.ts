import { Types } from "mongoose";
import { Order, OrderStatus, PaymentStatus } from "../../models/Order";
import { requireFound } from "../../utils/helpers";
import { Product } from "../../models/Product";


export const ALLOWED_ORDER_STATUSES = [
    "placed",
    "shipped",
    "delivered",
    "returned",
  ] as const;
  
  export type AdminOrderStatus = (typeof ALLOWED_ORDER_STATUSES)[number];
  
  export type AdminOrderRow = {
    _id: Types.ObjectId;
    customerName: string;
    customerEmail: string;
    totalItems: number;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    paidAt?: Date | null;
    deliveredAt?: Date | null;
    returnedAt?: Date | null;
    createdAt: Date;
  };

export const getOrder = async () => {
  const orders = await Order.find()
    .select(
      "customerName customerEmail totalItems totalAmount paymentStatus orderStatus paidAt deliveredAt returnedAt createdAt"
    )
    .sort({ createdAt: -1 })
    .lean<AdminOrderRow[]>();

    // console.log(orders);

  return orders.map((orderItem) => ({
    _id: String(orderItem._id),
    code: String(orderItem._id).slice(-8).toUpperCase(),
    customerName: orderItem.customerName,
    customerEmail: orderItem.customerEmail,
    totalItems: orderItem.totalItems,
    totalAmount: orderItem.totalAmount,
    paymentStatus: orderItem.paymentStatus,
    orderStatus: orderItem.orderStatus,
    paidAt: orderItem.paidAt,
    deliveredAt: orderItem.deliveredAt,
    returnedAt: orderItem.returnedAt,
    createdAt: orderItem.createdAt,
  }));
};



export const updateOrder = async (orderId: string, orderStatus: AdminOrderStatus) => {
    // 1. Fetch the order
    const order = await Order.findById(orderId);
    const foundOrder = requireFound(order, "Order not found", 404);
  
    // 2. Handle specific business logic for 'returned' status
    if (orderStatus === "returned" && foundOrder.orderStatus !== "returned") {
      for (const item of foundOrder.items) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } }
        );
      }
      // Update returned timestamp if applicable
      foundOrder.returnedAt = new Date();
    }
  
    // 3. Handle specific business logic for 'delivered' status
    if (orderStatus === "delivered" && !foundOrder.deliveredAt) {
      foundOrder.deliveredAt = new Date();
    }
  
    // 4. Save changes
    foundOrder.orderStatus = orderStatus;
    await foundOrder.save();
  
    return foundOrder;
  };