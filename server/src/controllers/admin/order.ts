import { ok } from "node:assert";
import { asyncHandler } from "../../utils/asyncHandler";
import * as orderService from "../../services/admin/order"
import { requireText } from "../../utils/helpers";
import { AppError } from "../../utils/AppError";

export const createOrder = asyncHandler(async (req, res) => {
    // Calling the service with the same name
    const items = await orderService.createOrder();
  
    res.json(
      ok({
        items,
      })
    );
  });


  export const updateOrder = asyncHandler(async (req, res) => {
    const orderId = String(req.params.orderId || "").trim();
    const orderStatus = String(req.body.orderStatus || "").trim() as orderService.AdminOrderStatus;
  
    // Basic input validation
    requireText(orderId, "Order Id is required");
    requireText(orderStatus, "orderStatus is required");
  
    if (!orderService.ALLOWED_ORDER_STATUSES.includes(orderStatus)) {
      throw new AppError(400, "Invalid order status");
    }
  
    // Delegate the heavy lifting to the service
    const updatedOrder = await orderService.updateOrder(orderId, orderStatus);
  
    res.json(
      ok({
        _id: String(updatedOrder._id),
        orderStatus: updatedOrder.orderStatus,
        deliveredAt: updatedOrder.deliveredAt,
        returnedAt: updatedOrder.returnedAt,
      }),
    );
  });