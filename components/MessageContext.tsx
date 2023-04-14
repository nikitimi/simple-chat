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

type MessageContextTypes = {
  handleMessage: (data: ClientMessageTypes) => Promise<void>
}

const MessageContext = createContext<MessageContextTypes>({
  handleMessage: async () => {},
})

export const useMessage = () => useContext(MessageContext)
export const MessageProvider: React.FC<any> = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { currentUserId, currentUserData, checkUserID } = useUser()
  const colRef = collection(db, "chats")

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

  useEffect(() => {
    let isMounted = true
    async function fetchChats() {
      try {
        if (currentUserData) {
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
              if (!snap.empty)
                snap.forEach((document) => {
                  // console.log(document.id)
                  checkUserID(document.id)
                })
            }
          )
        }
      } catch (err) {
        console.log(err)
      }
    }
    if (isMounted) {
      fetchChats()
    }
    return () => {
      console.log("Chat heads unmounts")
      isMounted = false
    }
  }, [checkUserID, colRef, currentUserData])

  const value = {
    handleMessage,
  }

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  )
}
export default MessageContext
