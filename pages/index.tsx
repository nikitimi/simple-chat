import { doc, onSnapshot } from "firebase/firestore"
import Link from "next/link"
import { useEffect } from "react"
import { Main } from "~/components"
import { useAuth } from "~/components/AuthContext"
import Center from "~/components/Center"
import { ChatHeader, ChatModal } from "~/components/Default"
import MessageModal from "~/components/Default/MessageModal"
import SideBar from "~/components/Default/Sidebar"
import { Header } from "~/components/Header"
import { db } from "~/utils/firebase"
import { setContactList } from "~/utils/redux/actions/userActions"
import { useAppDispatch, useAppSelector } from "~/utils/redux/hooks"

export const chatColName = "chats"

export default function Home() {
  const dispatch = useAppDispatch()
  const { messageModal, chatHeader } = useAppSelector((s) => s.ui)
  const { id } = useAppSelector((s) => s.user)
  const { currentUser } = useAuth()

  useEffect(() => {
    let isMounted = true
    async function fetchCurrentUserData() {
      if (currentUser && id) {
        onSnapshot(doc(db, `/users/${id}`), async (document) => {
          const contacts = document.data()?.contacts
            ? document.data()?.contacts
            : []
          console.log("contact_lists", id)
          dispatch(setContactList(contacts))
        })
      }
    }
    if (isMounted) {
      console.log("CurrentUser data mounted!")
      fetchCurrentUserData()
    }
    return () => {
      isMounted = false
    }
  }, [dispatch, currentUser, id])

  return (
    <Main title="Chats" description="This is a landing page">
      <Header blur={messageModal || chatHeader} />
      {currentUser && <ChatHeader />}
      {currentUser && <MessageModal />}
      {currentUser ? (
        <div className="flex">
          <SideBar blur={messageModal || chatHeader} />
          <ChatModal blur={messageModal || chatHeader} />
        </div>
      ) : (
        <Center>
          <h2>
            {`Sign in to start messaging `}
            <span className="underline">
              <Link href="/signin">Click to Sign in</Link>
            </span>
          </h2>
        </Center>
      )}
    </Main>
  )
}
