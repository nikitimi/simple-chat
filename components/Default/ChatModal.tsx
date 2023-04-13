import {
  doc,
  collection,
  getDoc,
  runTransaction,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  QueryDocumentSnapshot,
  DocumentData,
  deleteDoc,
  DocumentSnapshot,
  DocumentReference,
} from "firebase/firestore"
import { useState, useEffect } from "react"
import { chatColName } from "~/pages"
import { db } from "~/utils/firebase"
import { toggleModal } from "~/utils/redux/actions/uiActions"
import { setChatHeads } from "~/utils/redux/actions/userActions"
import { useAppSelector, useAppDispatch } from "~/utils/redux/hooks"
import { useAuth } from "../AuthContext"
import { Minimize } from "../Buttons"
import { ChatIDDataTypes, HistoryTypes, MessageTypes } from "../types"

interface ChatTypes extends ChatIDDataTypes {
  history: HistoryTypes[]
}

const ChatModal = ({ blur }: { blur: boolean }) => {
  const { currentUser } = useAuth()
  const dispatch = useAppDispatch()
  const { messageModal, chatHeader, chatModal } = useAppSelector((s) => s.ui)
  const recipient = chatModal.substring(20, chatModal.length)
  const sender = currentUser?.email ? currentUser.email : ""
  const [message, setMessage] = useState("")
  const [chatData, setChatData] = useState<ChatTypes>()
  const chatModalEmpty = chatModal === ""
  const messageData = {
    recipient,
    sender,
    sentTime: new Date().getTime(),
    message,
  }

  async function handleSend(data: MessageTypes) {
    const { recipient, sender, message } = data
    if (message !== "") {
      if (chatModal) {
        const docRef = doc(collection(db, chatColName), chatModal)
        const fetchChat = await getDoc(docRef)

        const createMessage = async (
          data: MessageTypes,
          docRef: DocumentReference<DocumentData>,
          docSnap: DocumentSnapshot<DocumentData>
        ) => {
          await runTransaction(db, async (tsx) => {
            if (docSnap.exists()) {
              dispatch(setChatHeads(null))
              tsx.update(docRef, {
                updatedAt: new Date().getTime(),
              })
            } else {
              tsx.set(docRef, {
                participants: [recipient, sender],
                updatedAt: new Date().getTime(),
              })
            }
            await addDoc(collection(docRef, "history"), data)
          })
        }
        createMessage(data, docRef, fetchChat)
        setMessage("")
      }
    }
  }

  useEffect(() => {
    let isMounted = true
    const getChatModal = async () => {
      try {
        if (!chatModalEmpty) {
          onSnapshot(
            query(
              collection(db, `/chats/${chatModal}/history`),
              where("recipient", "==", recipient),
              orderBy("sentTime", "desc"),
              limit(7)
            ),
            (snap) => {
              let his: HistoryTypes[] = []
              if (!snap.empty)
                snap.forEach(
                  (doc: QueryDocumentSnapshot<HistoryTypes> | DocumentData) => {
                    his.push(doc.data())
                  }
                )
              setChatData({ history: his.reverse() })
            }
          )
          const chatIdData: ChatIDDataTypes | DocumentData = await getDoc(
            doc(db, `/chats/${chatModal}`)
          )
          setChatData((p) => ({ ...p, ...chatIdData.data() }))
        }
      } catch (err) {
        console.log(err)
      }
    }
    if (isMounted) {
      console.log("Chat Modal mounted!")
      getChatModal()
    }
    return () => {
      isMounted = false
    }
  }, [chatModal, chatModalEmpty, recipient])

  return (
    <div
      className={`${
        blur ? "custom-blur" : ""
      } w-full min-h-1/2 max-h-screen bg-slate-50 duration-300 ease`}
    >
      {chatData && (
        <div className="bg-yellow-400 relative text-center py-2 px-1">
          <button
            disabled={messageModal || chatHeader}
            onClick={() => dispatch(toggleModal("chatHeader"))}
          >
            <h1>{recipient}</h1>
          </button>
        </div>
      )}
      <div className="flex flex-col h-full overflow-y-scroll">
        {chatData?.history.map(
          ({ message, sentTime, sender }: HistoryTypes, i: number) => {
            const sentT = new Date()
            sentT.setTime(sentTime)
            const time = `${sentT.getHours()}:${sentT.getMinutes()}`
            return (
              <div
                key={i}
                className={`${
                  sender === currentUser?.email
                    ? "bg-blue-400 text-white ml-auto"
                    : "bg-slate-200 text-black mr-auto"
                } w-fit rounded-md px-4 py-2 m-2`}
              >
                <p>{message}</p>
                <p>{time}</p>
              </div>
            )
          }
        )}
      </div>
      {chatData && (
        <div className="fixed bottom-0 w-4/5 right-0">
          <form>
            <textarea
              required
              name="content"
              value={message}
              onChange={(e) => {
                const text: HTMLTextAreaElement = e.currentTarget
                setMessage(text.value)
              }}
              onKeyDown={async (e) => {
                if (
                  e.code === "Enter" ||
                  e.code === "NumpadEnter" ||
                  e.code === "Return" ||
                  e.code === "Done"
                ) {
                  e.preventDefault()
                  handleSend(messageData)
                }
              }}
              className="w-full resize-none p-4 rounded-md focus:opacity-100 outline-none border duration-300 ease focus:border-blue-500 hover:opacity-100 opacity-10"
              placeholder="Enter a message..."
            />
          </form>
          <button
            disabled={message === ""}
            className={`${
              message === ""
                ? "bg-slate-300 text-slate-400"
                : "bg-green-400 text-white"
            } rounded-md fixed z-10 right-2 bottom-10 px-2 py-1 `}
            onClick={() => handleSend(messageData)}
          >
            Send
          </button>
        </div>
      )}
    </div>
  )
}

const ChatHeader = () => {
  const { chatHeader, chatModal } = useAppSelector((s) => s.ui)
  const dispatch = useAppDispatch()
  return chatHeader ? (
    <div
      className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-100
      w-1/2 shadow-md rounded-md p-4"
    >
      <button onClick={() => dispatch(toggleModal("chatHeader"))}>x</button>
      <h1>ChatHeader</h1>
      <Minimize
        name="Delete Chat"
        onClick={() => deleteDoc(doc(db, `/chats/${chatModal}`))}
      />
    </div>
  ) : (
    <></>
  )
}

export { ChatHeader }
export default ChatModal
