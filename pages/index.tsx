import { collection, onSnapshot } from "firebase/firestore"
import Link from "next/link"
import { type MouseEvent, useState, useEffect, useRef } from "react"
import { Main } from "~/components"
import { useAuth } from "~/components/AuthContext"
import { Minimize } from "~/components/Buttons"
import Center from "~/components/Center"
import { Header } from "~/components/Header"
import { db } from "~/utils/firebase"
import { toggleModal } from "~/utils/redux/actions/uiActions"
import { setContactList } from "~/utils/redux/actions/userActions"
import { useAppDispatch, useAppSelector } from "~/utils/redux/hooks"

export default function Home() {
  const dispatch = useAppDispatch()
  const { messageModal } = useAppSelector((s) => s.ui)
  const { currentUser } = useAuth()

  useEffect(() => {
    if (currentUser)
      onSnapshot(collection(db, "users"), (snap) => {
        let array: string[] = []
        snap.docs.map((doc) => array.push(doc.data().email))
        dispatch(setContactList(array))
      })
  }, [dispatch, currentUser])

  return (
    <Main title="home" description="This is a landing page">
      <Header blur={messageModal} />
      {currentUser && <MessagingModal />}
      {currentUser ? (
        <SideBar blur={messageModal} />
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
  return (
    <section
      className={`${
        blur ? "blur-sm" : ""
      } h-screen max-h-full bg-yellow-400 w-1/4 text-center duration-300 ease`}
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
    </section>
  )
}

const MessagingModal = () => {
  const divRef = useRef<HTMLDivElement>(null)
  const [recipient, setRecipient] = useState("")
  const { contactList } = useAppSelector((s) => s.user)
  const { messageModal, submitContactMessage } = useAppSelector((s) => s.ui)
  const dispatch = useAppDispatch()

  return messageModal ? (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-200
    w-1/2 shadow-md rounded-md p-4"
    >
      <Minimize
        onClick={() => dispatch(toggleModal("messageModal"))}
        name="-"
      />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const message = e.currentTarget.querySelector("textarea")
          console.log(message?.value, recipient)
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
