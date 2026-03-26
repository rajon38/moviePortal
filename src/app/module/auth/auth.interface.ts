export interface ILoginUserPayload {
    email: string;
    password: string;
}

export interface IRegisterPayload {
    name: string;
    email: string;
    password: string;
}

export interface IChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export interface IUpdateProfilePayload {
    name?: string;
    image?: string;
}