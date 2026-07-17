import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    try {
        const email = 'testuser_' + Date.now() + '@example.com';
        const password = 'password123';
        
        console.log("Registering user:", email);
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                workspaces: {
                    create: {
                        name: 'Default Workspace'
                    }
                }
            },
            include: {
                workspaces: true
            }
        });
        console.log("Registration successful:", user);

        console.log("Logging in user:", email);
        const fetchedUser = await prisma.user.findUnique({
            where: { email },
            include: { workspaces: true }
        });
        
        if (!fetchedUser) {
            console.error("User not found!");
            return;
        }

        const isMatch = await bcrypt.compare(password, fetchedUser.password);
        if (!isMatch) {
            console.error("Password mismatch!");
            return;
        }

        console.log("Login successful:", fetchedUser);

    } catch (e) {
        console.error("Error occurred:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
