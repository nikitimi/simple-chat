import { doc, onSnapshot } from "firebase/firestore"
import Link from "next/link"
import { useEffect } from "react"
import { Center, Header, Main } from "~/components"
import {
  ChatHeader,
  ChatModal,
  MessageModal,
  Sidebar,
} from "~/components/Default"
import { useAuth, useMessage } from "~/contexts"
import { db } from "~/utils/firebase"
import { setContactList } from "~/utils/redux/actions/userActions"
import { useAppDispatch, useAppSelector } from "~/utils/redux/hooks"

export default function Home() {
  const dispatch = useAppDispatch()
  const { messageModal, chatHeader } = useAppSelector((s) => s.ui)
  const { id } = useAppSelector((s) => s.user)
  const { currentUser } = useAuth()
  const { chats } = useMessage()
  console.log(chats)

  useEffect(() => {
    let isMounted = true
    async function fetchCurrentUserData() {
      if (currentUser && id) {
        onSnapshot(doc(db, `/users/${id}`), async (document) => {
          const contacts = document.data()?.contacts
            ? document.data()?.contacts
            : []
          console.log(`Setting up Contact List: ${contacts}`)
          dispatch(setContactList(contacts))
        })
      }
    }
    if (isMounted) {
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
          <Sidebar blur={messageModal || chatHeader} />
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
