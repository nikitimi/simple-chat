import type { Auth, UserCredential } from "firebase/auth"
import { HTMLAttributes } from "react"

export type MainTypes = {
  title: string
  description: string
  className?: string
  children: React.ReactNode
}

export type EmailType = { email: string }
export type PasswordType = { password: string }
export type AuthTypes = {
  email: EmailType["email"]
  password: PasswordType["password"]
}
export type AuthContextValue = {
  currentUser: Auth["currentUser"] | null
  signin: (props: AuthTypes) => Promise<UserCredential | void>
  signup: (props: AuthTypes) => Promise<UserCredential | void>
  signout: () => Promise<void>
  // resetPassword: (props: EmailType) => Promise<void>
  // upEmail: (props: EmailType) => Promise<void>
  // upPassword: (props: PasswordType) => void
  googleSignIn: () => void
}

export interface TextfieldTypes extends HTMLAttributes<HTMLInputElement> {
  name: string
}
