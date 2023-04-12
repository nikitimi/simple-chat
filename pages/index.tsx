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
      <Header />
      {currentUser ? (
        <SideBar />
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

const SideBar = () => {
  const divRef = useRef<HTMLDivElement>(null)
  const [recipient, setRecipient] = useState("")
  const { contactList } = useAppSelector((s) => s.user)
  const { messageModal, submitContactMessage } = useAppSelector((s) => s.ui)
  const dispatch = useAppDispatch()
  return (
    <section className="h-screen max-h-full bg-yellow-400 w-1/4">
      <button onClick={() => dispatch(toggleModal("messageModal"))}>
        Compose a message
      </button>
      {messageModal && (
        <div className=" grid place-content-center bg-orange-200">
          <Minimize
            onClick={() => dispatch(toggleModal("messageModal"))}
            name="-"
          />
          <form>
            <div ref={divRef}>
              <input
                type="text"
                value={recipient}
                onChange={(e) => {
                  const input = divRef.current?.querySelector("input")
                  const div = divRef.current?.querySelector("#suggest")
                  if (input && div && contactList) {
                    const filtered = contactList.filter((value) =>
                      value.includes(input.value)
                    )
                    const buttons = filtered.map((value, i) => {
                      const button = document.createElement("button")
                      button.setAttribute("key", `${i}`)
                      button.textContent = value
                      return button
                    })
                    const parent = document.createElement("div")
                    parent.setAttribute("id", "suggest")
                    parent.setAttribute(
                      "class",
                      "flex flex-col overflow-y-auto"
                    )
                    parent.append(...buttons)
                    buttons.forEach((button) =>
                      button.addEventListener("click", (e) => {
                        e.preventDefault()
                        dispatch(toggleModal("submitContactMessage"))
                        setRecipient(button.innerText)
                        parent.classList.remove("flex")
                        parent.classList.add("hidden")
                      })
                    )
                    div.replaceWith(parent)
                  }
                  dispatch(toggleModal("submitContactMessage"))
                  setRecipient(e.target.value)
                }}
              />
              <div className="flex flex-col" id="suggest">
                <button />
              </div>
            </div>
          </form>
          <textarea name="content" />
          <button disabled={!submitContactMessage}>Send</button>
          {/* </form> */}
        </div>
      )}
    </section>
  )
}
