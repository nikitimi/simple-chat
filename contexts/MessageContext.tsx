import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore"
import { createContext, useContext, useEffect, useState } from "react"
import { chatsCollectionRef, db } from "~/utils/firebase"
import type { ClientMessageTypes, MessageInterface } from "../components/types"
import { useAuth } from "./AuthContext"
import { useUser } from "./UserContext"

export type ChatInfoTypes = {
  messageId: string
  participants: string[]
  updatedAt: number
}
export type ChatsTypes = {
  [id: string]: MessageInterface[]
}
export type MessageContextTypes = {
  chats: ChatsTypes
  chatHeads: string[]
  chatHead: string | null
  sendMessage: (data: ClientMessageTypes) => Promise<void>
  selectChatHead: (value: string) => void
}

const MessageContext = createContext<MessageContextTypes>({
  chats: {},
  chatHeads: [],
  chatHead: null,
  sendMessage: async () => {},
  selectChatHead: () => null,
})

export const useMessage = () => useContext(MessageContext)
export const MessageProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const { currentUser } = useAuth()
  const { currentUserId } = useUser()
  const [chats, setChats] = useState<ChatsTypes>({})
  const [chatHead, setChatHead] = useState<string>("")
  const [chatHeads, setChatHeads] = useState<string[]>([])

  function resetMessageContext() {
    setChats({})
    setChatHeads([])
    setChatHead("")
  }

  function selectChatHead(value: string) {
    setChatHead(value)
  }

  async function chatQueryData(participants: string[]) {
    const chatDocumentQuery = query(
      chatsCollectionRef,
      where("participants", "==", participants),
      orderBy("updatedAt", "desc"),
      limit(5)
    )
    return await getDocs(chatDocumentQuery)
  }

  async function sendMessage(data: ClientMessageTypes) {
    if (currentUser) {
      const { recipient } = data
      const { email, emailVerified, photoURL, displayName } = currentUser
      const modifiedData: MessageInterface = {
        sender: {
          email: `${email}`,
          emailVerified,
          photoURL: `${photoURL}`,
          displayName: `${displayName}`,
        },
        type: "text",
        ...data,
      }
      const date = new Date()
      const recipientQuery = query(
        collection(db, "users"),
        where("email", "==", recipient.email)
      )
      const { docs } = await getDocs(recipientQuery)
      if (docs.length > 0) {
        const recipientId = docs[0].id
        const messageId = `${recipientId}${currentUserId}`
        const snap = await chatQueryData([
          recipient.email,
          `${currentUser.email}`,
        ])
        if (snap.empty) {
          const addChatDocument = await addDoc(chatsCollectionRef, {
            participants: [recipient.email, currentUser.email],
            messageId,
            updatedAt: date.getTime(),
          })
          const historyColRef = collection(
            doc(chatsCollectionRef, addChatDocument.id),
            "history"
          )
          await addDoc(historyColRef, modifiedData)
        } else {
          await updateDoc(doc(chatsCollectionRef, snap.docs[0].id), {
            updatedAt: date.getTime(),
          })
          const historyColRef = collection(
            doc(chatsCollectionRef, snap.docs[0].id),
            "history"
          )
          await addDoc(historyColRef, modifiedData)
        }
      }
    }
  }

  async function fetchChatData(chatId: string, data: ChatInfoTypes) {
    try {
      if (currentUser) {
        console.log(`Setting up chat head array [index]:${chatId}`)
        const participants = data.participants
        const snap = await chatQueryData(participants)

        if (!snap.empty) {
          const historyQuery = query(
            collection(doc(chatsCollectionRef, snap.docs[0].id), "history"),
            orderBy("sentTime", "desc"),
            limit(10)
          )
          onSnapshot(historyQuery, (historySnap) => {
            let chatHeadObj: ChatsTypes = { [chatId]: [] }
            let latestChatHead: string | null = null

            historySnap.forEach((chatDocument) => {
              chatHeadObj[chatId].push({
                ...(chatDocument.data() as MessageInterface),
              })
            })
            setChats((p) => {
              latestChatHead = Object.keys(chatHeadObj)[0]
              return { ...p, ...chatHeadObj }
            })
            setChatHeads((p) => [...p])
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    const unsub = onSnapshot(
      query(
        chatsCollectionRef,
        where(
          "participants",
          "array-contains",
          currentUser && currentUser.email
        ),
        orderBy("updatedAt", "desc"),
        limit(7)
      ),
      (snap) => {
        if (!snap.empty) {
          let chatHeadsArray: string[] = []
          snap.forEach((document) => {
            chatHeadsArray.push(document.id)
            fetchChatData(document.id, document.data() as ChatInfoTypes)
          })
          console.log("Chat heads mounts")
          setChatHeads(chatHeadsArray)
        }
      },
      (err) => {
        console.log(err)
      }
    )

    return () => {
      if (currentUser) unsub
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    if (isMounted) resetMessageContext
    return () => {
      console.log("Resetting message context")
      isMounted = false
    }
  }, [currentUser])

  const values = {
    chats,
    chatHeads,
    chatHead,
    sendMessage,
    selectChatHead,
  }

  return (
    <MessageContext.Provider value={values}>{children}</MessageContext.Provider>
  )
}

export default MessageContext
