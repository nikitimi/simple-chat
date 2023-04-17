import { doc, collection, writeBatch, getDocs } from "firebase/firestore"
import Image from "next/image"
import { useState, useEffect } from "react"
import { chatsCollectionRef, db } from "~/utils/firebase"
import { toggleModal } from "~/utils/redux/actions/uiActions"
import { useAppSelector, useAppDispatch } from "~/utils/redux/hooks"
import { useAuth } from "../../contexts/AuthContext"
import { Minimize } from "../Buttons"
import { useMessage } from "../../contexts/MessageContext"
import { MessageInterface } from "../types"
import React from "react"

const ChatModal = ({ blur }: { blur: boolean }) => {
  const DIMENSION = 80
  const { currentUser } = useAuth()
  const { chatHead, chats, handleMessage } = useMessage()
  const dispatch = useAppDispatch()
  const { messageModal, chatHeader } = useAppSelector((s) => s.ui)
  const [message, setMessage] = useState("")
  const [userActiveChats, setActiveChats] = useState<MessageInterface[] | null>(
    null
  )

  async function handleSendMessageEvents() {
    const { recipient, ...rest } = {
      recipient: userActiveChats && userActiveChats[0].recipient,
      sentTime: new Date().getTime(),
      message,
    }

    if (recipient) {
      handleMessage({
        recipient: recipient,
        ...rest,
      })
      setMessage("")
    }
  }

  useEffect(() => {
    let isMounted = true
    if (isMounted && chatHead) {
      const chatData = chats[chatHead]
      if (chatData) setActiveChats(chatData)
    }
    return () => {
      // console.log("Unmounting active chats")
      isMounted = false
    }
  }, [chatHead, chats])

  return (
    <div
      className={`${
        blur ? "custom-blur" : ""
      } w-full min-h-1/2 max-h-screen bg-slate-50 duration-300 ease`}
    >
      {userActiveChats && (
        <div className="relative h-fit text-center py-2 px-1">
          <button
            className="bg-slate-200 w-full"
            disabled={messageModal || chatHeader}
            onClick={() => dispatch(toggleModal("chatHeader"))}
          >
            <div className="relative w-fit rounded-full overflow-hidden">
              <Image
                width={DIMENSION}
                height={DIMENSION}
                src={userActiveChats[0].recipient.photoURL}
                alt="ava-photo"
              />
            </div>
            <h1>{userActiveChats[0].recipient.displayName}</h1>
          </button>
        </div>
      )}
      <div className="flex flex-col-reverse h-min overflow-y-scroll">
        {userActiveChats &&
          userActiveChats.map(({ message, sentTime, sender }, i) => {
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
          })}
      </div>
      {userActiveChats && (
        <div className="fixed bottom-2 w-2/3 right-4">
          <form>
            <textarea
              onKeyDown={(e) => {
                switch (e.code) {
                  case "NumpadEnter":
                  case "Enter":
                    return handleSendMessageEvents
                  default:
                    return
                }
              }}
              required
              name="content"
              value={message}
              onChange={(e) => {
                const text: HTMLTextAreaElement = e.currentTarget
                setMessage(text.value)
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
            onClick={() => handleSendMessageEvents}
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
        onClick={async () => {
          const batch = writeBatch(db)
          const chatIdRef = doc(chatsCollectionRef, `${chatHead}`)
          const historyColRef = collection(chatIdRef, `history`)
          const snap = await getDocs(historyColRef)
          snap.forEach((document) =>
            batch.delete(doc(historyColRef, document.id))
          )
          batch.delete(chatIdRef)
          batch.commit()
        }}
      />
    </div>
  ) : (
    <></>
  )
}

export { ChatHeader }
export default ChatModal
