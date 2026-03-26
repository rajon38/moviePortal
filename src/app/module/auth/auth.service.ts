import status from "http-status";
import { UserStatus, Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { IChangePasswordPayload, ILoginUserPayload, IRegisterPayload, IUpdateProfilePayload } from "./auth.interface";

const register = async (payload: IRegisterPayload) => {
    const { name, email, password } = payload;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });
    
    if (existingUser) {
        throw new AppError(status.CONFLICT, "Email already registered");
    }
    
    try {
        // Call better-auth API
        const authResponse = await auth.api.signUpEmail({
            body: {
                name,
                email,
                password,
            },
        });
        
        // Handle better-auth response
        if (!authResponse || !authResponse.user) {
            console.error("Better Auth signup failed:", authResponse);
            throw new AppError(status.BAD_REQUEST, "Failed to register user with auth provider");
        }
        
        // Create or update user record in database
        const user = await prisma.$transaction(async (tx) => {
            // Check if user exists (in case of race condition)
            const existingDbUser = await tx.user.findUnique({
                where: { id: authResponse.user!.id },
            });
            
            if (existingDbUser) {
                return existingDbUser;
            }
            
            return await tx.user.create({
                data: {
                    id: authResponse.user!.id,
                    name: authResponse.user!.name,
                    email: authResponse.user!.email,
                    role: authResponse.user!.role as Role,
                    status: authResponse.user!.status as UserStatus,
                    emailVerified: authResponse.user!.emailVerified || false,
                    isDeleted: authResponse.user!.isDeleted || false,
                },
            });
        });
        
        const accessToken = tokenUtils.getAccessToken({
            userId: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            status: user.status,
            isDeleted: user.isDeleted,
            emailVerified: user.emailVerified,
        });
        
        const refreshToken = tokenUtils.getRefreshToken({
            userId: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            status: user.status,
            isDeleted: user.isDeleted,
            emailVerified: user.emailVerified,
        });
        
        return {
            user,
            accessToken,
            refreshToken,
            token: (authResponse as Record<string, unknown>).token || null,
        };
    } catch (error) {
        // If Prisma error, delete created user from better-auth
        if (error instanceof AppError) {
            throw error;
        }
        
        // Try to clean up if user was created in better-auth
        try {
            const createdUser = await prisma.user.findUnique({
                where: { email },
            });
            if (createdUser) {
                await prisma.user.delete({
                    where: { id: createdUser.id },
                });
            }
        } catch (cleanupError) {
            console.error("Error during cleanup:", cleanupError);
        }
        
        console.error("Error during registration:", error);
        const errorMessage = error instanceof Error ? error.message : "Registration failed";
        throw new AppError(status.INTERNAL_SERVER_ERROR, errorMessage);
    }
}

const login = async (payload: ILoginUserPayload) => {
    const { email, password } = payload;
    const data = await auth.api.signInEmail({
        body: {
            email,
            password
        }
    })
    if (!data.user) {
        throw new AppError(status.BAD_REQUEST, "Invalid email or password");
    }
    if (data.user.status === UserStatus.BLOCKED) {
        throw new AppError(status.FORBIDDEN, "Your account has been blocked. Please contact support.");
    }
    if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
        throw new AppError(status.NOT_FOUND, "Your account has been deleted. Please contact support.");
    }
    const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    })

    const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    })
    return {
        accessToken,
        refreshToken,
        ...data
    };
}

const getMe = async (user : IRequestUser) => {
    const isUserExists = await prisma.user.findUnique({
        where : {
            id : user.userId,
        }
    })

    if (!isUserExists) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    return isUserExists;
}

const getNewToken = async (refreshToken : string, sessionToken : string) => {

    const isSessionTokenExists = await prisma.session.findUnique({
        where : {
            token : sessionToken,
        },
        include : {
            user : true,
        }
    })

    if(!isSessionTokenExists){
        throw new AppError(status.UNAUTHORIZED, "Invalid session token");
    }

    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET)


    if(!verifiedRefreshToken.success && verifiedRefreshToken.error){
        throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
    }

    const data = verifiedRefreshToken.data as JwtPayload;

    const newAccessToken = tokenUtils.getAccessToken({
        userId: data.userId,
        role: data.role,
        name: data.name,
        email: data.email,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified,
    });

    const newRefreshToken = tokenUtils.getRefreshToken({
        userId: data.userId,
        role: data.role,
        name: data.name,
        email: data.email,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified,
    });

    const {token} = await prisma.session.update({
        where : {
            token : sessionToken
        },
        data : {
            token : sessionToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
            updatedAt: new Date(),
        }
    })

    return {
        accessToken : newAccessToken,
        refreshToken : newRefreshToken,
        sessionToken : token,
    }

}

const changePassword = async (payload : IChangePasswordPayload, sessionToken : string) =>{
    const session = await auth.api.getSession({
        headers : new Headers({
            Authorization : `Bearer ${sessionToken}`
        })
    })

    if(!session){
        throw new AppError(status.UNAUTHORIZED, "Invalid session token");
    }

    const {currentPassword, newPassword} = payload;

    const result = await auth.api.changePassword({
        body :{
            currentPassword,
            newPassword,
            revokeOtherSessions: true,
        },
        headers : new Headers({
            Authorization : `Bearer ${sessionToken}`
        })
    })

    //conditional check to set needPasswordChange to false if the user is changing password for the first time after admin reset the password or after forget password flow
    if(session.user.needPasswordChange){
        await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                needPasswordChange: false,
            }
        })
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
        email: session.user.email,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
        email: session.user.email,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified,
    });
    

    return {
        ...result,
        accessToken,
        refreshToken,
    }
}

const logoutUser = async (sessionToken : string) => {
    const result = await auth.api.signOut({
        headers : new Headers({
            Authorization : `Bearer ${sessionToken}`
        })
    })

    return result;
}

const verifyEmail = async (email : string, otp : string) => {

    const result = await auth.api.verifyEmailOTP({
        body:{
            email,
            otp,
        }
    })

    if(result.status && !result.user.emailVerified){
        await prisma.user.update({
            where : {
                email,
            },
            data : {
                emailVerified: true,
            }
        })
    }
}

const forgetPassword = async (email : string) => {
    const isUserExist = await prisma.user.findUnique({
        where : {
            email,
        }
    })

    if(!isUserExist){
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    if(!isUserExist.emailVerified){
        throw new AppError(status.BAD_REQUEST, "Email not verified");
    }

    if(isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED){
        throw new AppError(status.NOT_FOUND, "User not found"); 
    }

    await auth.api.requestPasswordResetEmailOTP({
        body:{
            email,
        }
    })
}

const resetPassword = async (email : string, otp : string, newPassword : string) => {
    const isUserExist = await prisma.user.findUnique({
        where: {
            email,
        }
    })

    if (!isUserExist) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    if (!isUserExist.emailVerified) {
        throw new AppError(status.BAD_REQUEST, "Email not verified");
    }

    if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    await auth.api.resetPasswordEmailOTP({
        body:{
            email,
            otp,
            password : newPassword,
        }
    })

    //conditional check to set needPasswordChange to false if the user is changing password for the first time after admin reset the password or after forget password flow
    if (isUserExist.needPasswordChange) {
        await prisma.user.update({
            where: {
                id: isUserExist.id,
            },
            data: {
                needPasswordChange: false,
            }
        })
    }

    await prisma.session.deleteMany({
        where:{
            userId : isUserExist.id,
        }
    })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const googleLoginSuccess = async (session : Record<string, any>) =>{
    const isExists = await prisma.user.findUnique({
        where : {
            id : session.user.id,
        }
    })

    if(!isExists){
        await prisma.user.create({
            data : {
                id : session.user.id,
                name : session.user.name,
                email : session.user.email,
            }
        
        })
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
    });

    return {
        accessToken,
        refreshToken,
    }
}

const updateProfile = async (user: IRequestUser, payload: IUpdateProfilePayload) => {
    const { name, image } = payload;

    const result = await prisma.user.update({
        where: {
            id: user.userId,
        },
        data: {
            name,
            image,
        }
    })

    return result;
}

export const AuthService = {
    register,
    login,
    getMe,
    getNewToken,
    changePassword,
    logoutUser,
    verifyEmail,
    forgetPassword,
    resetPassword,
    googleLoginSuccess,
    updateProfile,
}