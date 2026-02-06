import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import {
    hashPassword,
    signAccessToken,
    signRefreshToken,
    setAuthCookies,
} from '@/lib/auth'

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, password } = registerSchema.parse(body)

        // 1. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { message: 'An account with this email already exists' },
                { status: 400 }
            )
        }

        // 2. Hash password
        const passwordHash = await hashPassword(password)

        // 3. Create user with WRITER role
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: 'WRITER',
            },
        })

        // 4. Generate tokens
        const accessToken = signAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        })

        const refreshToken = signRefreshToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        })

        // 5. Store refresh token in DB
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                expiresAt,
                userId: user.id,
            },
        })

        // 6. Create response
        const response = NextResponse.json({
            message: 'Registration successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        })

        // 7. Set auth cookies
        setAuthCookies(response, accessToken, refreshToken)

        return response
    } catch (error) {
        console.error('Registration error:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Validation error', errors: error.issues },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
