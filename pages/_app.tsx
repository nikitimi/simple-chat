import "~/styles/globals.css"
import type { AppProps } from "next/app"
import { AuthProvider, useAuth } from "~/components/AuthContext"
import { useEffect } from "react"
import { useAppDispatch } from "~/utils/redux/hooks"
import { setCurrentId } from "~/utils/redux/actions/userActions"
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
import { UserProvider } from "~/components/UserContext"

export default function App({ ...rest }: AppProps) {
  return (
    <Provider store={store}>
      <UserProvider>
        <AuthProvider>
          <MainComponent {...rest} />
        </AuthProvider>
      </UserProvider>
    </Provider>
  )
}

const MainComponent = ({ Component, pageProps }: AppProps) => {
  const { currentUser } = useAuth()
  const dispatch = useAppDispatch()

  useEffect(() => {
    let isMounted = true

    const fetchUser = async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db, "users"),
            where("email", "==", currentUser?.email)
          )
        )
        if (!snap.empty)
          snap.forEach(async (document) => {
            await updateDoc(doc(db, `/users/${document.id}`), {
              lastOnline: new Date().getTime(),
            })
            // console.log(document.id)
            dispatch(setCurrentId(document.id))
          })
      } catch (err) {
        console.log(err)
      }
    }
    if (isMounted) {
      // console.log("ID mounted!")
      fetchUser()
    }
    return () => {
      isMounted = false
    }
  }, [dispatch, currentUser])
  return <Component {...pageProps} />
}
