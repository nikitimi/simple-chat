import {
  addDoc,
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  runTransaction,
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
  const { currentUserId } = useUser()
  const { currentUser } = useAuth()
  const [chats, setChats] = useState<ChatsInterface[]>([])
  const [chatHeads, setChatHeads] = useState<string[]>([])
  const [chatHead, setChatHeadHook] = useState<string>("")
  // const [noChatDocExist, ChatDocExist] = useState(true)

  function selectChatHead(value: string) {
    setChatHeadHook(value)
  }

  function resetMessageData() {
    setChats([])
    setChatHeads([])
    setChatHeadHook("")
    // ChatDocExist(true)
  }

  useEffect(() => resetMessageData, [currentUser])

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
        const docRef = doc(chatsCollectionRef, messageId)
        const timeUpdate = {
          updatedAt: date.getTime(),
        }
        const codument = await getDoc(docRef)
        console.log(codument.exists())
      }
    }
  }

  async function fetchChats(chatId: string, data: ChatInfoTypes) {
    try {
      if (currentUser) {
        const recipient = data.participants.filter(
          (v) => !v.includes(`${currentUser.email}`)
        )[0]
        const chatQuery = query(
          collection(db, `/chats/${chatId}/history`),
          where("type", "==", "text"),
          orderBy("sentTime", "desc"),
          limit(8)
        )
        const snap = await getDocs(chatQuery)
        console.log(recipient, currentUser.email)
        let array: MessageInterface[] = []
        snap.forEach((doc) => {
          array.push({ ...(doc.data() as MessageInterface) })
        })
        setChats((p) => {
          let prevState = [...p, { [chatId]: array }]
          const index = prevState.findIndex(
            (obj) => Object.keys(obj)[0] === chatId
          )
          prevState[index] = { [chatId]: array }
          return prevState
        })
      }
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    let isMounted = true
    async function fetchChatHeads() {
      if (currentUser && chatHeads.length === 0)
        try {
          onSnapshot(
            query(
              chatsCollectionRef,
              where("participants", "array-contains-any", [currentUser.email]),
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
      fetchChatHeads()
    }
    return () => {
      console.log("Chat heads unmounts")
      isMounted = false
    }
  }, [currentUser])

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
