import {
  arrayUnion,
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore"
import Image from "next/image"
import Link from "next/link"
import { type MouseEvent, useState, useEffect, useRef } from "react"
import { Main } from "~/components"
import { useAuth } from "~/components/AuthContext"
import { Minimize } from "~/components/Buttons"
import Center from "~/components/Center"
import { Header } from "~/components/Header"
import { db } from "~/utils/firebase"
import { toggleModal } from "~/utils/redux/actions/uiActions"
import {
  setChatHeads,
  setChatModal,
  setContactList,
} from "~/utils/redux/actions/userActions"
import { useAppDispatch, useAppSelector } from "~/utils/redux/hooks"

export const chatColName = "chats"

export default function Home() {
  const dispatch = useAppDispatch()
  const { messageModal } = useAppSelector((s) => s.ui)
  const { currentUser } = useAuth()

  useEffect(() => {
    let isMounted = true
    if (currentUser && isMounted) {
      onSnapshot(collection(db, "users"), (snap) => {
        let array: string[] = []
        snap.docs.map((doc) => array.push(doc.data().email))
        dispatch(setContactList(array))
      })
    }
    return () => {
      isMounted = false
    }
  }, [dispatch, currentUser])

  return (
    <Main title="home" description="This is a landing page">
      <Header blur={messageModal} />
      {currentUser && <MessagingModal />}
      {currentUser ? (
        <div className="flex">
          <SideBar blur={messageModal} />
          <ChatModal blur={messageModal} />
        </div>
      ) : (
        <Center>
          <h2>
            Sign in to start messaging{" "}
            <span className="underline">
              <Link href="/signin">Click to Sign in</Link>
            </span>
          </h2>
        </Center>
      )}
    </Main>
  )
}

const SideBar = ({ blur }: { blur: boolean }) => {
  const dispatch = useAppDispatch()
  const { messageModal } = useAppSelector((s) => s.ui)
  const { chatHeads } = useAppSelector((s) => s.user)
  const { currentUser } = useAuth()
  const colRef = collection(db, chatColName)

  useEffect(() => {
    let isMounted = true
    const fetchChats = async () => {
      const checkChats = await getDocs(colRef)
      if (currentUser && !checkChats.empty && isMounted) {
        onSnapshot(
          query(
            colRef,
            where("participants", "array-contains-any", [currentUser.email]),
            limit(7)
          ),
          (snap) => {
            let chatHeadsHolder: string[] = []
            if (!snap.empty)
              snap.forEach((document) => {
                chatHeadsHolder.push(document.id)
              })
            dispatch(setChatHeads(chatHeadsHolder))
          }
        )
      }
    }
    fetchChats()
    return () => {
      isMounted = false
    }
  }, [colRef, currentUser, dispatch])

  return (
    <section
      className={`${
        blur ? "blur-sm" : ""
      } min-h-screen max-h-full bg-slate-50 border-r border-slate-200 w-1/4 text-center duration-300 ease`}
    >
      <label htmlFor="create-message">Create a Message</label>
      <button
        disabled={messageModal}
        id="create-message"
        className="bg-green-500 text-white px-2 py-1 rounded-md w-full"
        onClick={() => dispatch(toggleModal("messageModal"))}
      >
        +
      </button>
      <div className="grid justify-center gap-4">
        {chatHeads?.map((v) => {
          const DIMENSION = 64
          return (
            <div
              className="bg-transparent shadow-md w-full max-w-fit px-4 py-2 overflow-hidden rounded-full"
              key={v}
            >
              <button
                className="text-3xl"
                onClick={async () => {
                  dispatch(setChatModal(v))
                }}
              >
                {v.substring(v.length - 10, v.length - 11).toUpperCase()}
                {/* <Image
                  src="/vercel.svg"
                  height={DIMENSION}
                  width={DIMENSION}
                  alt="user-icon"
                /> */}
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}

const ChatModal = ({ blur }: { blur: boolean }) => {
  type ChatTypes = {
    history: {
      message: string
      recipient: string
      sender: string
      sentTime: number
    }[]
    participants: string[]
    updatedAt: number
  }

  const { currentUser } = useAuth()
  const { chatModal } = useAppSelector((s) => s.ui)
  const { id } = useAppSelector((s) => s.user)
  const [chat, setChat] = useState<ChatTypes | DocumentData>()
  const [message, setMessage] = useState("")
  const recipient = chat?.participants.filter(
    (value: string) => !(value === currentUser?.email)
  )[0]
    ? chat?.participants.filter(
        (value: string) => !(value === currentUser?.email)
      )[0]
    : currentUser?.email

  useEffect(() => {
    let isMounted = true
    if (chatModal && isMounted) {
      const getChatModal = () => {
        onSnapshot(doc(db, `/chats/${chatModal}`), (snap) => {
          setChat(snap.data())
        })
      }
      getChatModal()
    }
    return () => {
      isMounted = false
    }
  }, [chatModal])
  return (
    <div
      className={`${
        blur ? "blur-sm" : ""
      } w-full min-h-screen max-h-full bg-slate-50`}
    >
      {chat && (
        <div className="bg-yellow-400 text-center py-2 px-1">{recipient}</div>
      )}
      <div className="flex gap-1 flex-col m-2">
        {chat?.history.map(
          (
            { message, sentTime, sender }: ChatTypes["history"][number],
            i: number
          ) => {
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
                } w-fit rounded-md px-4 py-2`}
              >
                <p>{message}</p>
                <p>{time}</p>
              </div>
            )
          }
        )}
      </div>
      {chat && (
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
                if (e.code === "Enter" || e.code === "NumpadEnter") {
                  e.preventDefault()
                  if (chatModal) {
                    const docRef = doc(collection(db, chatColName), chatModal)
                    const fetchChat = await getDoc(docRef)

                    const data = {
                      recipient,
                      sender: currentUser?.email,
                      sentTime: new Date().getTime(),
                      message,
                    }

                    if (fetchChat.exists()) {
                      updateDoc(docRef, {
                        updatedAt: new Date().getTime(),
                        history: arrayUnion({ ...data }),
                      })
                    } else
                      setDoc(docRef, {
                        participants: [recipient, currentUser?.email],
                        updatedAt: new Date().getTime(),
                        history: arrayUnion({ ...data }),
                      })
                    setMessage("")
                  }
                }
              }}
              className="w-full resize-none p-4 rounded-md focus:opacity-100 outline-none border duration-300 ease focus:border-blue-500 hover:opacity-100 opacity-10"
              placeholder="Enter a message..."
            />
          </form>
        </div>
      )}
    </div>
  )
}

const MessagingModal = () => {
  const divRef = useRef<HTMLDivElement>(null)
  const [recipient, setRecipient] = useState("")
  const { contactList } = useAppSelector((s) => s.user)
  const { messageModal, submitContactMessage } = useAppSelector((s) => s.ui)
  const { id } = useAppSelector((s) => s.user)
  const dispatch = useAppDispatch()
  const { currentUser } = useAuth()

  return messageModal ? (
    <div
      className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-100
    w-1/2 shadow-md rounded-md p-4"
    >
      <Minimize
        onClick={() => dispatch(toggleModal("messageModal"))}
        name="-"
      />
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const createdId = `${id}${recipient}`
          const docRef = doc(collection(db, chatColName), createdId)
          const message = e.currentTarget.querySelector("textarea")
          const fetchChat = await getDoc(docRef)

          const data = {
            recipient,
            sender: currentUser?.email,
            sentTime: new Date().getTime(),
            message: message?.value,
          }

          if (fetchChat.exists()) {
            updateDoc(docRef, {
              updatedAt: new Date().getTime(),
              history: arrayUnion({ ...data }),
            })
          } else
            setDoc(docRef, {
              participants: [recipient, currentUser?.email],
              updatedAt: new Date().getTime(),
              history: arrayUnion({ ...data }),
            })
          setRecipient("")
          dispatch(toggleModal("messageModal"))
        }}
      >
        <div className="grid" ref={divRef}>
          <input
            required
            type="text"
            placeholder="recipient..."
            className="w-full p-4 rounded-md"
            value={recipient}
            onChange={(e) => {
              const input = divRef.current?.querySelector("input")
              const div = divRef.current?.querySelector("#suggest")
              if (input && div && contactList) {
                const filtered = contactList.filter((value) =>
                  value.toLowerCase().includes(input.value.toLowerCase())
                )
                const buttons = filtered.map((value, i) => {
                  const button = document.createElement("button")
                  button.setAttribute("key", `${i}`)
                  button.classList.add("bg-blue-400")
                  button.textContent = value
                  return button
                })
                const parent = document.createElement("div")
                parent.setAttribute("id", "suggest")
                parent.setAttribute("class", "flex flex-col overflow-y-auto")
                parent.append(...buttons)
                buttons.forEach((button) =>
                  button.addEventListener("click", (e) => {
                    e.preventDefault()
                    dispatch(toggleModal("submitContactMessage", true))
                    setRecipient(button.innerText)
                    parent.classList.remove("flex")
                    parent.classList.add("hidden")
                  })
                )
                div.replaceWith(parent)
              }
              dispatch(toggleModal("submitContactMessage", false))
              setRecipient(e.target.value)
            }}
          />
          <div className="flex flex-col" id="suggest">
            <button />
          </div>
        </div>
        <textarea
          required
          name="content"
          className="w-full resize-none p-4 rounded-md"
          placeholder="message"
        />
        <button
          disabled={!submitContactMessage}
          className={`${
            !submitContactMessage
              ? "bg-slate-300 text-slate-500"
              : "bg-green-500 text-white"
          } rounded-md border px-2 w-full`}
        >
          Send
        </button>
      </form>
    </div>
  ) : (
    <></>
  )
}
