import { Role } from "../../generated/prisma/enums"
import { envVars } from "../config/env";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma"

export const seedSuperAdmin = async () => {
    try {
        const existingSuperAdmin = await prisma.user.findFirst({
            where: {
                role: Role.SUPER_ADMIN,
            }
        })
        if (existingSuperAdmin) {
            console.log("Super admin already exists. Skipping seeding.");
            return;
        }
        const superAdmin = await auth.api.signUpEmail({
            body:{
                email: envVars.SUPER_ADMIN_EMAIL,
                password: envVars.SUPER_ADMIN_PASSWORD,
                name: "Super Admin",
                role: Role.SUPER_ADMIN,
                needPasswordChange: false,
                rememberMe: false,
            }
        })

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: {
                    id: superAdmin.user.id,
                },
                data: {
                    emailVerified: true,
                }
            })

            await tx.admin.create({
                data: {
                    userId: superAdmin.user.id,
                    name: "Super Admin",
                    email: superAdmin.user.email,
                }
            })
        });
        const createdSuperAdmin = await prisma.admin.findFirst({
            where: {
                email: envVars.SUPER_ADMIN_EMAIL,
            },
            include: {
                user: true,
            }
        })
        console.log("Super admin seeded successfully:", createdSuperAdmin);
    } catch (error) {
        console.error("Error seeding super admin:", error);
        await prisma.user.delete({
            where: {
                email: envVars.SUPER_ADMIN_EMAIL,
            }
        });
    }
}