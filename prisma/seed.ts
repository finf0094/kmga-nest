import { PrismaClient } from '@prisma/client';
import { genSaltSync, hashSync } from 'bcrypt';

const prisma = new PrismaClient();

export async function main() {
    try {
        const user = await prisma.user.upsert({
            where: {
                email: 'admin@gmail.com',
            },
            create: {
                email: 'admin@gmail.com',
                password: hashSync('tete9291', genSaltSync(10)),
            },
            update: {
                email: 'admin@gmail.com',
                password: hashSync('tete9291', genSaltSync(10)),
            },
        });

        console.log('Success user created:', user.email);
    } catch (err) {
        console.error('Error during creating user', err);
    }
}
