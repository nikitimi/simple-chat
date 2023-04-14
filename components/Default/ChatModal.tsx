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
import Image from "next/image"
import { useState, useEffect } from "react"
import { chatColName } from "~/pages"
import { db } from "~/utils/firebase"
import { toggleModal } from "~/utils/redux/actions/uiActions"
import { setChatHeads } from "~/utils/redux/actions/userActions"
import { useAppSelector, useAppDispatch } from "~/utils/redux/hooks"
import { useAuth } from "../AuthContext"
import { Minimize } from "../Buttons"
import { useMessage } from "../MessageContext"
import type { ChatIDDataTypes, MessageInterface } from "../types"

interface ChatTypes extends ChatIDDataTypes {
  history?: MessageInterface[]
}

const ChatModal = ({ blur }: { blur: boolean }) => {
  const { currentUser } = useAuth()
  const { chatHead, chats, handleMessage } = useMessage()
  const dispatch = useAppDispatch()
  const { messageModal, chatHeader, chatModal } = useAppSelector((s) => s.ui)
  const [message, setMessage] = useState("")
  const userActiveChats = chats.filter(
    (obj) => Object.keys(obj)[0] === chatHead
  )[0]

  const userActiveData = userActiveChats
    ? Object.values(userActiveChats)[0][0].recipient
    : null
  const messageData = {
    recipient: userActiveData,
    sentTime: new Date().getTime(),
    message,
  }
  const DIMENSION = 80

  return (
    <div
      className={`${
        blur ? "custom-blur" : ""
      } w-full min-h-1/2 max-h-screen bg-slate-50 duration-300 ease`}
    >
      {userActiveData && (
        <div className="relative h-fit text-center py-2 px-1">
          <button
            className="absolute inset-x-0 bg-slate-200"
            disabled={messageModal || chatHeader}
            onClick={() => dispatch(toggleModal("chatHeader"))}
          >
            <div className="relative w-fit rounded-full overflow-hidden">
              <Image
                width={DIMENSION}
                height={DIMENSION}
                src={userActiveData.photoURL}
                alt="ava-photo"
              />
            </div>
            <h1>{userActiveData.displayName}</h1>
          </button>
        </div>
      )}
      <div className="flex flex-col h-min overflow-y-scroll">
        {userActiveChats &&
          Object.values(userActiveChats)[0].map(
            ({ message, sentTime, sender }, i) => {
              const sentT = new Date()
              sentT.setTime(sentTime)
              const time = `${sentT.getHours()}:${sentT.getMinutes()}`
              return (
                <div
                  key={i}
                  className={`${
                    sender.email === currentUser?.email
                      ? "bg-blue-400 text-white ml-auto"
                      : "bg-slate-200 text-black mr-auto"
                  } w-min rounded-md px-4 py-2 m-2 `}
                >
                  <p>{message}</p>
                  <p>{time}</p>
                </div>
              )
            }
          )}
      </div>
      {userActiveData && (
        <div className="fixed bottom-2 w-2/3 right-4">
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
                  const { recipient, ...rest } = messageData
                  handleMessage({
                    recipient: recipient
                      ? recipient
                      : {
                          email: "",
                          emailVerified: false,
                          photoURL: "/user.png",
                          displayName: "foobar",
                        },
                    ...rest,
                  })
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
            } rounded-md fixed z-10 right-6 bottom-10 px-2 py-1 `}
            onClick={() => {
              const { recipient, ...rest } = messageData
              handleMessage({
                recipient: recipient
                  ? recipient
                  : {
                      email: "",
                      emailVerified: false,
                      photoURL: "/user.png",
                      displayName: "foobar",
                    },
                ...rest,
              })
              setMessage("")
            }}
          >
            Send
          </button>
        </div>
      )}
    </div>
  )
}

const ChatHeader = () => {
  const { chatHeader } = useAppSelector((s) => s.ui)
  const dispatch = useAppDispatch()
  const { chatHead } = useMessage()
  return chatHeader ? (
    <div
      className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-100
      w-1/2 shadow-md rounded-md p-4"
    >
      <button onClick={() => dispatch(toggleModal("chatHeader"))}>x</button>
      <h1>ChatHeader</h1>
      <Minimize
        name="Delete Chat"
        onClick={() => deleteDoc(doc(db, `/chats/${chatHead}`))}
      />
    </div>
  ) : (
    <></>
  )
}

export { ChatHeader }
export default ChatModal
