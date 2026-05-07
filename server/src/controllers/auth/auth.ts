import { getAuth } from "@clerk/express";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/AppError";
import { ok } from "../../utils/envelope";
import * as authService from "../../services/auth/auth"

export const createUser = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);

    if (!userId) {
      throw new AppError(401, "User is not logged in.");
    }
  
    // Delegate business logic to the service
    const user = await authService.syncUserWithDB(userId);

    res.status(200).json(
        ok({
          user: {
            id: user._id,
            clerkUserId: user.clerkUserId,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        })
      );
  })

  export const fetchMe = asyncHandler(async (req, res) => {
    const { userId } = getAuth(req);
  
    if (!userId) {
      throw new AppError(401, "User is not logged in. Means unauth user!!");
    }
  
 
    const dbUser = await authService.getDbUserByClerkId(userId);
  
    res.status(200).json(
      ok({
        user: {
          id: dbUser._id,
          clerkUserId: dbUser.clerkUserId,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
        },
      }),
    );
  });