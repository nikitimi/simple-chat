import "~/styles/globals.css"
import type { AppProps } from "next/app"
import { AuthProvider, useAuth } from "~/components/AuthContext"
import { useEffect } from "react"
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore"
import { db } from "~/utils/firebase"
import { Provider } from "react-redux"
import store from "~/utils/redux/store"
import { UserProvider, useUser } from "~/components/UserContext"
import { MessageProvider } from "~/components/MessageContext"
export { reportWebVitals } from "next-axiom"

export default function App({ ...rest }: AppProps) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <UserProvider>
          <MessageProvider>
            <MainComponent {...rest} />
          </MessageProvider>
        </UserProvider>
      </AuthProvider>
    </Provider>
  )
}

const MainComponent = ({ Component, pageProps }: AppProps) => {
  const { currentUser } = useAuth()
  const { setCurrentUserId } = useUser()

  useEffect(() => {
    let isMounted = true
    async function fetchCurrentUserData() {
      try {
        const snap = await getDocs(
          query(
            collection(db, "users"),
            where("email", "==", currentUser?.email)
          )
        )
        if (!snap.empty) {
          const docId = snap.docs[0].id
          await updateDoc(doc(db, `/users/${docId}`), {
            lastOnline: new Date().getTime(),
          })
          setCurrentUserId(docId)
        }
      } catch (err) {
        console.log(err)
      }
    }
    if (isMounted) {
      console.log("Fetching current id!")
      fetchCurrentUserData()
    }
    return () => {
      isMounted = false
    }
  }, [currentUser, setCurrentUserId])

  return <Component {...pageProps} />
}
