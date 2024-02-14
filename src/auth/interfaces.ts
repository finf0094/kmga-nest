import { Token } from '@prisma/client';
import { UserResponse } from '@user/responses';

export interface Tokens {
    accessToken: string;
    refreshToken: Token;
    user: UserResponse;
}

export interface JwtPayload {
    id: string;
    email: string;
    roles: string[];
}
