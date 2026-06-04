
export interface User {
    id: number;
    user_code: string;
    full_name: string;
    password_hash: string;
    is_admin: boolean;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface SafeUser {
    id: number;
    user_code: string;
    full_name: string;
    is_admin: boolean;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface UserCreateInput {
    user_code: string;
    full_name: string;
    password: string;
    is_admin?: boolean;
    is_active?: boolean;
}

export interface UserLoginInput {
    user_code: string;
    password: string;
}