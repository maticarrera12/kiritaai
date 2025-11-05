import { z } from 'zod'

// Sign In Schema
export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Sign Up Schema
export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
})



export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})


export const resetPasswordSchema = z.object({
  password: z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
})

export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
})

export const profileUpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
   newPassword: z.string().min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  revokeOtherSessions: z.boolean(),
})

// Types
export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type ProfileUpdatePasswordInput = z.infer<typeof profileUpdatePasswordSchema>