import {
  useContext,
  useState,
  useEffect,
  createContext,
  type ReactNode,
} from "react"
import { auth } from "~/utils/firebase"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
  type Auth,
  signInWithCredential,
} from "firebase/auth"
import type { AuthContextValue, AuthTypes } from "./types"
import { Loading } from "./"

const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  signin: async () => {},
  signup: async () => {},
  signout: async () => {},
  googleSignIn: async () => {},
})

export const useAuth = () => useContext(AuthContext)
export const AuthProvider: React.FC<any> = ({
  children,
}: {
  children: ReactNode
}) => {
  const [currentUser, setCurrentUser] = useState<Auth["currentUser"]>(null)
  const [loading, setLoading] = useState(true)

  const signup = async ({ email, password }: AuthTypes) => {
    return await createUserWithEmailAndPassword(auth, email, password)
  }
  const signin = async ({ email, password }: AuthTypes) => {
    return await signInWithEmailAndPassword(auth, email, password)
  }
  const signout = async () => {
    return await signOut(auth)
  }
  const googleSignIn = async () => {
    try {
      return await signInWithPopup(auth, new GoogleAuthProvider()).then(
        (result: UserCredential) => {
          const credential = GoogleAuthProvider.credentialFromResult(result)
          if (credential !== null) {
            signInWithCredential(auth, credential)
            console.log(currentUser)
          }
        }
      )
    } catch (err) {
      console.log(err)
    }
  }

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setCurrentUser(user)
    setLoading(false)
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => unsubscribe, [])

  const value = {
    currentUser,
    signin,
    signup,
    signout,
    googleSignIn,
  }
  return (
    <AuthContext.Provider value={value}>
      {loading ? <Loading /> : children}
    </AuthContext.Provider>
  )
}
export default AuthContext
