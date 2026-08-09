import { firebaseAuth } from "../../config/firebase";
import { prisma } from "database";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export class AuthService {
  async verifyAndLogin(idToken: string, requestedRole: string = "CUSTOMER") {
    // 1. Verify token with Firebase
    let decodedToken: any;
    try {
      decodedToken = await firebaseAuth.verifyIdToken(idToken);
    } catch (error) {
      if (env.NODE_ENV === 'development') {
        if (idToken.startsWith("dev-mock-token-")) {
          const mockPhone = idToken.split("dev-mock-token-")[1];
          decodedToken = { phone_number: mockPhone, uid: "dev-uid-" + mockPhone };
        } else {
          decodedToken = { phone_number: "+919999999999", uid: "dev-uid" };
        }
      } else {
        throw new Error("Invalid token");
      }
    }

    let phone = decodedToken.phone_number || null;
    const email = decodedToken.email || null;
    const firebaseUid = decodedToken.uid;
    const name = decodedToken.name || null;
    const avatarUrl = decodedToken.picture || null;

    if (!firebaseUid) {
      throw new Error("Invalid token: No UID found");
    }

    // 2. Check if user exists, or create
    const role = requestedRole === "SHOPKEEPER" ? "SHOPKEEPER" : "CUSTOMER";

    // Try finding by firebaseUid first, then email, then phone
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { firebaseUid },
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : [])
        ]
      }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid,
          email,
          phone,
          name,
          avatarUrl,
          role,
        },
      });

      // If customer, initialize an empty cart
      if (role === "CUSTOMER") {
        await prisma.cart.create({
          data: {
            userId: user.id,
          }
        });
      }
    } else {
      // Update existing user with new info if any
      const updates: any = {};
      if (!user.firebaseUid) updates.firebaseUid = firebaseUid;
      if (!user.email && email) updates.email = email;
      if (!user.phone && phone) updates.phone = phone;
      if (!user.name && name) updates.name = name;
      if (!user.avatarUrl && avatarUrl) updates.avatarUrl = avatarUrl;
      
      // Upgrade role if requested
      if (role === "SHOPKEEPER" && user.role === "CUSTOMER") {
        updates.role = "SHOPKEEPER";
      }

      if (Object.keys(updates).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updates,
        });
      }
    }

    // 3. Issue our own JWT
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
      },
      accessToken,
    };
  }
}
