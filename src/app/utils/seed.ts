import { Role } from "../../generated/prisma/enums";
import { envVars } from "../config/env";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export const seedAdmin = async () => {
  try {
    // ✅ Check by email (better than role)
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: envVars.ADMIN_EMAIL,
      },
    });

    if (existingAdmin) {
      console.log("✅ Admin already exists. Skipping seeding.");
      return;
    }

    // ✅ Create admin via auth system
    const admin = await auth.api.signUpEmail({
      body: {
        email: envVars.ADMIN_EMAIL,
        password: envVars.ADMIN_PASSWORD,
        name: "Admin",
        role: Role.ADMIN,
        needPasswordChange: false,
        rememberMe: false,
      },
    });

    // ✅ Mark email verified
    await prisma.user.update({
      where: {
        id: admin.user.id,
      },
      data: {
        emailVerified: true,
      },
    });

    console.log("🚀 Admin seeded successfully:", admin.user.email);
  } catch (error) {
    console.error("❌ Error seeding admin:", error);

    // optional cleanup
    try {
      await prisma.user.delete({
        where: {
          email: envVars.ADMIN_EMAIL,
        },
      });
    } catch {
      console.log("Cleanup skipped");
    }
  }
};