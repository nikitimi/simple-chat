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

export type UserMessageHeader = {
  displayName: string
  email: string
  emailVerified: boolean
  photoURL: string
}

export interface UserDataTypes extends UserMessageHeader {
  description?: string
  lastOnline: number
}

export interface UserDataInterface extends UserDataTypes {
  contacts: UserDataTypes[]
  userId: string
}

export type AuthContextTypes = {
  currentUser: Auth["currentUser"]
  signin: (props: AuthTypes) => Promise<UserCredential | void>
  signup: (props: AuthTypes) => Promise<UserCredential | void>
  signout: () => Promise<void>
  // resetPassword: (props: EmailType) => Promise<void>
  // upEmail: (props: EmailType) => Promise<void>
  // upPassword: (props: PasswordType) => void
  googleSignIn: () => void
}

export type ClientMessageTypes = {
  recipient: UserMessageHeader
  message: string
  sentTime: number
}
export interface MessageInterface extends ClientMessageTypes {
  sender: UserMessageHeader
  type: string
}

export type ChatIDDataTypes = {
  participants?: string[]
  updatedAt?: number
}

export interface TextfieldTypes extends HTMLAttributes<HTMLInputElement> {
  name: string
  dataList?: any[]
}
