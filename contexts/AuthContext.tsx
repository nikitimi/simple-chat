import {
  useContext,
  useState,
  useEffect,
  createContext,
  type ReactNode,
} from "react"
import { auth, db } from "~/utils/firebase"
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
import type { AuthContextTypes, AuthTypes } from "../components/types"
import { Loading } from "../components"
import { getDocs, query, collection, where, addDoc } from "firebase/firestore"
import Center from "../components/Center"

const AuthContext = createContext<AuthContextTypes>({
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
      const userCol = collection(db, "users")
      const sign = signInWithPopup(auth, new GoogleAuthProvider())
      const { user } = await sign
      sign.then((result: UserCredential) => {
        const credential = GoogleAuthProvider.credentialFromResult(result)
        if (credential !== null) {
          signInWithCredential(auth, credential)
        }
      })
      const snap = await getDocs(
        query(userCol, where("email", "==", user.email))
      )
      if (snap.empty) {
        const { displayName, photoURL, email, emailVerified } = user
        // By default adding self into contact so you can send message to yourself
        await addDoc(userCol, {
          contacts: [{ displayName, photoURL, email, emailVerified }],
          displayName,
          photoURL,
          email,
          emailVerified,
        })
      }
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
      {loading ? (
        <Center>
          <Loading />
        </Center>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}
export default AuthContext
