import {
  doc,
  collection,
  getDoc,
  updateDoc,
  arrayUnion,
  setDoc,
  addDoc,
  runTransaction,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
} from "firebase/firestore"
import { useRef, useState } from "react"
import { chatColName } from "~/pages"
import { db } from "~/utils/firebase"
import { toggleModal } from "~/utils/redux/actions/uiActions"
import { setChatHeads } from "~/utils/redux/actions/userActions"
import { useAppSelector, useAppDispatch } from "~/utils/redux/hooks"
import { useAuth } from "../AuthContext"
import { Minimize } from "../Buttons"
import type { MessageTypes } from "../types"

const MessageModal = () => {
  const { currentUser } = useAuth()
  const dispatch = useAppDispatch()
  const { id } = useAppSelector((s) => s.user)
  const { contactList } = useAppSelector((s) => s.user)
  const { messageModal, submitContactMessage } = useAppSelector((s) => s.ui)
  const divRef = useRef<HTMLDivElement>(null)
  const [recipient, setRecipient] = useState("")
  const sender = currentUser?.email ? currentUser.email : ""

  async function handleSend(data: MessageTypes) {
    const { recipient, sender, message } = data
    if (message !== "") {
      const createdId = `${id}${recipient}`
      const docRef = doc(collection(db, chatColName), createdId)
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
    }
  }

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
          const message = e.currentTarget.querySelector("textarea")

          handleSend({
            recipient,
            sender,
            sentTime: new Date().getTime(),
            message: message ? message.value : "",
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

export default MessageModal
