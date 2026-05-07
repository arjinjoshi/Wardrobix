

import { clerkClient } from "@clerk/express";
import { User } from "../../models/User";
import { AppError } from "../../utils/AppError";


export const syncUserWithDB = async (clerkUserId: string) => {
  // 1. Fetch user from Clerk
  const clerkUser = await clerkClient.users.getUser(clerkUserId);

  // 2. Extract Identity Info
  const emailObj = clerkUser.emailAddresses.find(
    (item) => item.id === clerkUser.primaryEmailAddressId
  ) || clerkUser.emailAddresses[0];
  
  const email = emailObj?.emailAddress;
  const fullName = [clerkUser.firstName, clerkUser.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const name = fullName || clerkUser.username;

  // 3. Determine Role Logic
  const raw = process.env.ADMIN_EMAILS || "";
  const adminEmails = new Set(
    raw.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean)
  );

  const existingUser = await User.findOne({ clerkUserId });
  const shouldBeAdmin = email ? adminEmails.has(email.toLowerCase()) : false;

  const nextRole = existingUser?.role === "admin" 
    ? "admin" 
    : (shouldBeAdmin ? "admin" : (existingUser?.role || "user"));

  // 4. DB Operation 
  return await User.findOneAndUpdate(
    { clerkUserId },
    { clerkUserId, email, name, role: nextRole },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

export const getDbUserByClerkId = async (clerkUserId: string) => {
    const dbUser = await User.findOne({ clerkUserId });
  
    if (!dbUser) {
      throw new AppError(404, "User is not found in DB");
    }
  
    return dbUser;
  };