import { Types } from "mongoose";
import { Product, ProductSize } from "../../models/Product";
import { User } from "../../models/User";
import { Cart } from "../../models/Cart";
import { AppError } from "../../utils/AppError";
import { Promo } from "../../models/Promo";
import { Order } from "../../models/Order";
import { requireFound } from "../../utils/helpers";
import { initiateKhaltiPayment, toSubUnits, verifyKhaltiPayment } from "../../utils/khalti";

type UserAddressRow = {
  _id: Types.ObjectId;
  fullName: string;
  address: string;
  state: string;
  postalCode: string;
};

type CheckoutUserRow = {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  addresses: UserAddressRow[];
};

type CartRow = {
  items: Array<{
    product: Types.ObjectId;
    quantity: number;
    color?: string;
    size?: ProductSize;
  }>;
};

type ProductRow = {
  _id: Types.ObjectId;
  price: number;
  salePercentage: number;
  stock: number;
  status: "active" | "inactive";
};

type PromoRow = {
  code: string;
  percentage: number;
  count: number;
  minimumOrderValue: number;
  startsAt: Date;
  endsAt: Date;
};

export const createSession = async (
  userId: string,
  addressId: string,
  promoCode: string,
  returnUrl: string,
  websiteUrl: string
) => {
  const [user, cart] = await Promise.all([
    User.findById(userId)
      .select("name email addresses")
      .lean<CheckoutUserRow | null>(),

    Cart.findOne({ user: userId }).select("items").lean<CartRow | null>(),
  ]);

  const foundUser = requireFound(user, "user not found", 404);
  const foundCart = requireFound(cart, "Cart not found", 404);

  if (!foundCart.items.length) {
    throw new AppError(400, "Cart is empty");
  }

  const selectedAddress = foundUser.addresses.find(
    (item) => String(item._id) === addressId
  );

  if (!selectedAddress) {
    throw new AppError(404, "Address not found!!");
  }

  const products = await Product.find({
    _id: { $in: foundCart.items.map((item) => item.product) },
  })
    .select("price salePercentage stock status")
    .lean<ProductRow[]>();

  const productMap = new Map(products.map((item) => [String(item._id), item]));

  let totalItems = 0;
  let subTotal = 0;

  const items = foundCart.items.map((cartItem) => {
    const product = productMap.get(String(cartItem.product));

    if (!product || product.status !== "active") {
      throw new AppError(400, "One or more cart items are not avaibale");
    }

    if (product.stock < cartItem.quantity) {
      throw new AppError(400, "Cart items are out of stock");
    }

    const finalPrice = product.salePercentage
      ? Math.round(
          product.price - (product.price * product.salePercentage) / 100
        )
      : product.price;

    totalItems += cartItem.quantity;
    subTotal += finalPrice * cartItem.quantity;

    return {
      product: cartItem.product,
      quantity: cartItem.quantity,
    };
  });

  let appliedPromoCode = "";
  let discountAmount = 0;

  if (promoCode) {
    const promo = await Promo.findOne({ code: promoCode })
      .select("code percentage count minimumOrderValue startsAt endsAt")
      .lean<PromoRow | null>();

    const foundPromo = requireFound(promo, "Promo not found", 404);
    const now = new Date();

    if (
      now < foundPromo.startsAt ||
      now > foundPromo.endsAt ||
      foundPromo.count < 1
    ) {
      throw new AppError(400, "promo code is not active");
    }

    if (subTotal < foundPromo.minimumOrderValue) {
      throw new AppError(
        400,
        "Minimum order value for this promo is not at the threesold"
      );
    }

    appliedPromoCode = foundPromo.code;
    discountAmount = Math.round((subTotal * foundPromo.percentage) / 100);
  }

  const totalAmount = Math.max(subTotal - discountAmount, 0);

  const deliveryAddress = [
    selectedAddress.address,
    selectedAddress.state,
    selectedAddress.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  const orderReceipt = `Order_${Date.now()}`;

  const order = await Order.create({
    user: userId,
    customerName: foundUser.name || selectedAddress.fullName,
    customerEmail: foundUser.email || "",
    items,
    totalItems,
    deliveryName: selectedAddress.fullName,
    deliveryAddress,
    promoCode: appliedPromoCode,
    discountAmount,
    totalAmount,
    paymentStatus: "pending",
    orderStatus: "placed",
    razorpayOrderId: "migrated_to_khalti",
  });

  // Initiate Khalti Payment
  const khaltiResponse = await initiateKhaltiPayment({
    return_url: returnUrl,
    website_url: websiteUrl,
    amount: toSubUnits(totalAmount),
    purchase_order_id: String(order._id),
    purchase_order_name: orderReceipt,
    customer_info: {
      name: foundUser.name || selectedAddress.fullName,
      email: foundUser.email || "customer@example.com",
    },
  });

  order.khaltiPidx = khaltiResponse.pidx;
  await order.save();

  return {
    khalti: {
      pidx: khaltiResponse.pidx,
      payment_url: khaltiResponse.payment_url,
    },
    order: {
      _id: String(order._id),
      totalItems,
      discountAmount,
      totalAmount,
    },
  };
};

export const confirmCheckout = async (
  userId: string,
  pidx: string
) => {
  const order = await Order.findOne({ khaltiPidx: pidx, user: userId });
  const foundOrder = requireFound(order, "Order not found", 404);

  if (foundOrder.paymentStatus === "paid") {
    return { _id: String(foundOrder._id) };
  }

  const khaltiVerifyResponse = await verifyKhaltiPayment(pidx);

  if (khaltiVerifyResponse.status !== "Completed") {
    throw new AppError(400, `Payment status is ${khaltiVerifyResponse.status}`);
  }

  for (const item of foundOrder.items) {
    const updated = await Product.updateOne(
      {
        _id: item.product,
        stock: { $gte: item.quantity },
      },
      {
        $inc: { stock: -item.quantity },
      }
    );

    if (!updated.matchedCount) {
      throw new AppError(400, "One or more cart items are out of stock");
    }
  }

  if (foundOrder.promoCode) {
    await Promo.updateOne(
      {
        code: foundOrder.promoCode,
        count: { $gt: 0 },
      },
      {
        $inc: { count: -1 },
      }
    );
  }

  await Cart.updateOne({ user: userId }, { $set: { items: [] } });

  foundOrder.paymentStatus = "paid";
  foundOrder.paymentId = khaltiVerifyResponse.transaction_id || pidx;
  foundOrder.paidAt = new Date();
  await foundOrder.save();

  return { _id: String(foundOrder._id) };
};
