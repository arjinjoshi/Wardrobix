import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import * as addressController from "../../controllers/customer/address";

export const customerAddressRouter = Router();

customerAddressRouter.use(requireAuth);

customerAddressRouter.get("/addresses", addressController.getAddresses);
customerAddressRouter.post("/addresses", addressController.createAddress);
customerAddressRouter.patch("/addresses/:addressId", addressController.updateAddress);
customerAddressRouter.delete("/addresses/:addressId", addressController.deleteAddress);
