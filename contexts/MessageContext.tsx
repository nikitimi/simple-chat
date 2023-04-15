import {
  addDoc,
  and,
  collection,
  doc,
  DocumentData,
  documentId,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore"
import { createContext, useContext, useEffect, useState } from "react"
import { chatsCollectionRef, db } from "~/utils/firebase"
import { ClientMessageTypes, MessageInterface } from "../components/types"
import { useAuth } from "./AuthContext"
import { useUser } from "./UserContext"

type ChatInfoTypes = {
  messageId: string
  participants: string[]
  updatedAt: number
}
export interface ChatsInterface {
  data: MessageInterface[]
  chatId: string
}
type MessageContextTypes = {
  chats: ChatsInterface[]
  chatHeads: string[]
  chatHead: string | null
  handleMessage: (data: ClientMessageTypes) => Promise<void>
  selectChatHead: (value: string) => void
}

const MessageContext = createContext<MessageContextTypes>({
  chats: [],
  chatHeads: [],
  chatHead: null,
  handleMessage: async () => {},
  selectChatHead: () => null,
})

export const useMessage = () => useContext(MessageContext)
export const MessageProvider: React.FC<any> = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { currentUserId } = useUser()
  const { currentUser } = useAuth()
  const [chats, setChats] = useState<ChatsInterface[]>([])
  const [chatHeads, setChatHeads] = useState<string[]>([])
  const [chatHead, setChatHeadHook] = useState<string>("")

  function selectChatHead(value: string) {
    setChatHeadHook(value)
  }

  function resetMessageData() {
    setChats([])
    setChatHeads([])
    setChatHeadHook("")
  }

  useEffect(() => {
    let isMounted = true
    async function fetchChatHeads() {
      if (currentUser && chatHeads.length === 0)
        try {
          onSnapshot(
            query(
              chatsCollectionRef,
              where("participants", "array-contains", currentUser.email),
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
                console.log(`Setting array at chat Heads: ${chatHeadsArray}`)
                setChatHeads(chatHeadsArray)
              }
            }
          )
        } catch (err) {
          console.log(err)
        }
    }
    if (isMounted) {
      resetMessageData()
      fetchChatHeads()
    }
    return () => {
      console.log("Chat heads unmounts")
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
        const participants = data.participants

        const snap = await chatDocQuery(participants)
        if (!snap.empty) {
          const historyQuery = query(
            collection(doc(chatsCollectionRef, snap.docs[0].id), "history"),
            orderBy("sentTime", "desc"),
            limit(10)
          )
          let array: MessageInterface[] = []
          onSnapshot(historyQuery, (historySnap) => {
            historySnap.forEach((chatDocument) => {
              console.log({ mes: chatDocument.data().message })
              array.push({ ...(chatDocument.data() as MessageInterface) })
            })
            setChats((p) => {
              //TODO: fix Push error seen in ChatModal.tsx
              let placeholder = [{ data: array, chatId }]
              const ind = placeholder.findIndex(
                ({ chatId }) => chatId === chatId
              )
              placeholder[ind] = { data: array, chatId }
              return placeholder
            })
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
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
