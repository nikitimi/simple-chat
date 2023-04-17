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
  handleMessage: (data: ClientMessageTypes) => Promise<void>
  selectChatHead: (value: string) => void
}

const MessageContext = createContext<MessageContextTypes>({
  chats: {},
  chatHeads: [],
  chatHead: null,
  handleMessage: async () => {},
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

  function selectChatHead(value: string) {
    console.log(value)
    setChatHead(value)
  }

  function resetMessageData() {
    setChats({})
    setChatHeads([])
    setChatHead("")
  }

  async function handleMessage(data: ClientMessageTypes) {
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
        const snap = await chatDocQuery([
          recipient.email,
          `${currentUser.email}`,
        ])
        if (!snap.empty) console.log(snap.docs[0].id)
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

  async function fetchChats(chatId: string, data: ChatInfoTypes) {
    try {
      if (currentUser) {
        console.log(`Setting array at chat Heads: ${chatId}`)
        const participants = data.participants
        const snap = await chatDocQuery(participants)

        if (!snap.empty) {
          const historyQuery = query(
            collection(doc(chatsCollectionRef, snap.docs[0].id), "history"),
            orderBy("sentTime", "desc"),
            limit(10)
          )
          onSnapshot(historyQuery, (historySnap) => {
            let chatHead: ChatsTypes = { [chatId]: [] }
            historySnap.forEach((chatDocument) => {
              chatHead[chatId].push({
                ...(chatDocument.data() as MessageInterface),
              })
            })
            //TODO: fix Push error seen in ChatModal.tsx
            setChats((p) => ({ ...p, ...chatHead }))
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
            fetchChats(document.id, document.data() as ChatInfoTypes)
          })
          setChatHeads(chatHeadsArray)
        }
      },
      (err) => {
        console.log(err)
      }
    )

    return () => {
      console.log("Chat heads unmounts")
      if (currentUser) unsub
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    if (isMounted) resetMessageData
    return () => {
      console.log("Resetting Message context")
      isMounted = false
    }
  }, [currentUser])

  async function chatDocQuery(participants: string[]) {
    const chatDocumentQuery = query(
      chatsCollectionRef,
      where("participants", "==", participants),
      orderBy("updatedAt", "desc"),
      limit(5)
    )
    return await getDocs(chatDocumentQuery)
  }

  const value = {
    chats,
    chatHeads,
    chatHead,
    handleMessage,
    selectChatHead,
  }

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  )
}
export default MessageContext
