import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore"
import type { AppProps } from "next/app"
import { useEffect } from "react"
import { Provider } from "react-redux"
import {
  AuthProvider,
  MessageProvider,
  useAuth,
  UserProvider,
  useUser,
} from "~/contexts"
import "~/styles/globals.css"
import { db } from "~/utils/firebase"
import store from "~/utils/redux/store"
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
          console.log(`Fetching Id: ${docId}!`)
        }
      } catch (err) {
        console.log(err)
      }
    }
    if (isMounted) {
      fetchCurrentUserData()
    }
    return () => {
      isMounted = false
    }
    /* TODO: currentUser?.email and setCurrentUserId
    react-hooks/exhaustive-deps */
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <Component {...pageProps} />
}
