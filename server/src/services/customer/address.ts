import { User } from "../../models/User";
import { AppError } from "../../utils/AppError";
import { requireFound } from "../../utils/helpers";

export type AddressItem = {
  _id?: string;
  fullName: string;
  address: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

export function mapAddress(item: AddressItem) {
  return {
    _id: String(item._id || ""),
    fullName: item.fullName,
    address: item.address,
    state: item.state,
    postalCode: item.postalCode,
    isDefault: item.isDefault,
  };
}

export const getAddresses = async (userId: string) => {
  const user = await User.findById(userId);
  const foundUser = requireFound(user, "User not found", 404);

  const addresses = (foundUser.addresses || []) as AddressItem[];

  return [...addresses]
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
    .map(mapAddress);
};

type CreateAddressData = {
  fullName: string;
  address: string;
  state: string;
  postalCode: string;
  isDefault?: boolean;
};

export const createAddress = async (userId: string, data: CreateAddressData) => {
  const user = await User.findById(userId);
  const foundUser = requireFound(user, "User not found", 404);

  const addresses = (foundUser.addresses || []) as AddressItem[];

  const shouldMarkAsDefault = data.isDefault === true || addresses.length === 0;

  if (shouldMarkAsDefault) {
    addresses.forEach((item) => {
      item.isDefault = false;
    });
  }

  addresses.push({
    fullName: data.fullName,
    address: data.address,
    state: data.state,
    postalCode: data.postalCode,
    isDefault: shouldMarkAsDefault,
  });

  await foundUser.save();

  return [...addresses]
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
    .map(mapAddress);
};

export const updateAddress = async (
  userId: string,
  addressId: string,
  data: CreateAddressData
) => {
  const user = await User.findById(userId);
  const foundUser = requireFound(user, "User not found", 404);

  const addresses = (foundUser.addresses || []) as AddressItem[];

  const getAddressTheUserWantToEdit = addresses.find(
    (currentAddress) => String(currentAddress._id) === addressId
  );

  if (!getAddressTheUserWantToEdit) {
    throw new AppError(404, "Address not found");
  }

  const shouldMarkAsDefault = data.isDefault === true || addresses.length === 0;

  if (shouldMarkAsDefault) {
    addresses.forEach((item) => {
      item.isDefault = false;
    });
  }

  getAddressTheUserWantToEdit.fullName = data.fullName;
  getAddressTheUserWantToEdit.address = data.address;
  getAddressTheUserWantToEdit.state = data.state;
  getAddressTheUserWantToEdit.postalCode = data.postalCode;

  if (shouldMarkAsDefault) {
    getAddressTheUserWantToEdit.isDefault = true;
  }

  await foundUser.save();

  return [...(foundUser.addresses as AddressItem[])]
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
    .map(mapAddress);
};

export const deleteAddress = async (userId: string, addressId: string) => {
  const user = await User.findById(userId);
  const foundUser = requireFound(user, "User not found", 404);

  const addresses = (foundUser.addresses || []) as AddressItem[];

  const addressToBeDeletedIndex = addresses.findIndex(
    (currentAddress) => String(currentAddress._id) === addressId
  );

  if (addressToBeDeletedIndex < 0) {
    throw new AppError(404, "Address not found");
  }

  const wasDefault = addresses[addressToBeDeletedIndex].isDefault;

  addresses.splice(addressToBeDeletedIndex, 1);

  if (
    wasDefault &&
    addresses.length > 0 &&
    !addresses.some((address) => address.isDefault)
  ) {
    addresses[0].isDefault = true;
  }

  await foundUser.save();

  return [...(foundUser.addresses as AddressItem[])]
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
    .map(mapAddress);
};
