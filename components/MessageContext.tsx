import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  where,
} from "firebase/firestore"
import { createContext, useContext, useEffect, useState } from "react"
import { db } from "~/utils/firebase"
import { ClientMessageTypes, MessageInterface } from "./types"
import { useUser } from "./UserContext"

type ChatInfoTypes = {
  messageId: string
  participants: string[]
  updatedAt: number
}
interface ChatsInterface {
  [x: string]: MessageInterface[]
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
  const { currentUserId, currentUserData } = useUser()
  const colRef = collection(db, "chats")
  const [chats, setChats] = useState<ChatsInterface[]>([])
  const [chatHeads, setChatHeads] = useState<string[]>([])
  const [chatHead, setChatHeadHook] = useState<string>("")
  const selectChatHead = (value: string) => setChatHeadHook(value)

  async function handleMessage(data: ClientMessageTypes) {
    if (currentUserData) {
      const { recipient } = data
      const { email, emailVerified, photoURL, displayName } = currentUserData
      const modifiedData: MessageInterface = {
        sender: { email, emailVerified, photoURL, displayName },
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

        await runTransaction(db, async (tsx) => {
          const { docs } = await getDocs(
            query(colRef, where("messageId", "==", messageId))
          )
          if (docs.length > 0) {
            tsx.update(doc(db, `/chats/${docs[0].id}`), {
              updatedAt: date.getTime(),
            })
            await addDoc(
              collection(db, `/chats/${docs[0].id}/history`),
              modifiedData
            )
          } else {
            const { id } = await addDoc(colRef, {
              participants: [recipient.email, email],
              updatedAt: date.getTime(),
              messageId,
            })
            await addDoc(collection(db, `/chats/${id}/history`), modifiedData)
          }
        })
      }
    }
  }

  async function fetchChats(chatId: string, data: ChatInfoTypes) {
    try {
      if (currentUserData) {
        const recipient = data.participants.filter(
          (v) => !v.includes(currentUserData.email)
        )[0]
        const chatQuery = query(
          collection(db, `/chats/${chatId}/history`),
          where(
            "recipient.email",
            "==",
            recipient ? recipient : currentUserData.email
          ),
          orderBy("sentTime", "desc"),
          limit(8)
        )
        const snap = await getDocs(chatQuery)
        // let objArr = []
        let array: MessageInterface[] = []
        snap.forEach((doc) => {
          array.push({ ...(doc.data() as MessageInterface) })
        })
        // objArr.push({ [chatId]: array.reverse() })
        setChats((p) => {
          let x = [...p, { [chatId]: array.reverse() }]
          const index = x.findIndex((obj) => Object.keys(obj)[0] === chatId)
          x[index] = { [chatId]: array }
          return x
        })
      }
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    let isMounted = true
    async function fetchChatHeads() {
      if (currentUserData && chatHeads.length === 0)
        try {
          onSnapshot(
            query(
              colRef,
              where("participants", "array-contains-any", [
                currentUserData.email,
              ]),
              orderBy("updatedAt", "desc"),
              limit(7)
            ),
            (snap) => {
              if (!snap.empty) {
                let array: string[] = []
                snap.forEach((document) => {
                  array.push(document.id)
                  fetchChats(document.id, document.data() as ChatInfoTypes)
                })
                setChatHeads(array)
              }
            }
          )
        } catch (err) {
          console.log(err)
        }
    }
    if (isMounted) {
      fetchChatHeads()
    }
    return () => {
      console.log("Chat heads unmounts")
      isMounted = false
    }
  }, [currentUserData])

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
