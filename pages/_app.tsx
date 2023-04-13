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

export default function App({ ...rest }: AppProps) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <MainComponent {...rest} />
      </AuthProvider>
    </Provider>
  )
}

const MainComponent = ({ Component, pageProps }: AppProps) => {
  const { currentUser } = useAuth()
  const dispatch = useAppDispatch()

  useEffect(() => {
    let isMounted = true
    if (currentUser && isMounted) {
      const fetchUser = async () => {
        try {
          const snap = await getDocs(
            query(
              collection(db, "users"),
              where("email", "==", currentUser.email)
            )
          )
          if (!snap.empty)
            snap.forEach((document) => {
              updateDoc(doc(db, `/users/${document.id}`), {
                lastOnline: new Date().getTime(),
              })
              dispatch(setCurrentId(document.id))
            })
        } catch (err) {
          console.log(err)
        }
      }
      fetchUser()
    }
    return () => {
      isMounted = false
    }
  }, [dispatch, currentUser])
  return <Component {...pageProps} />
}
