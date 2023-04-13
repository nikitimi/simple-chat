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

export type UserDataTypes = {
  contacts: string[]
  displayName: string
  email: string
  emailVerified: boolean
  lastOnline: number
  photoUrl: string
}

export interface UserDataInterface {
  data: UserDataTypes
  userId: string
}

export type AuthContextValue = {
  currentUser: Auth["currentUser"]
  signin: (props: AuthTypes) => Promise<UserCredential | void>
  signup: (props: AuthTypes) => Promise<UserCredential | void>
  signout: () => Promise<void>
  // resetPassword: (props: EmailType) => Promise<void>
  // upEmail: (props: EmailType) => Promise<void>
  // upPassword: (props: PasswordType) => void
  googleSignIn: () => void
}

export type HistoryTypes = {
  message: string
  recipient: string
  sender: string
  sentTime: number
}

export type ChatIDDataTypes = {
  participants?: string[]
  updatedAt?: number
}
export type MessageTypes = {
  recipient: string
  sender: string
  sentTime: number
  message: string
}

export interface TextfieldTypes extends HTMLAttributes<HTMLInputElement> {
  name: string
  dataList?: any[]
}
