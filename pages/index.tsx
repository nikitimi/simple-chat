import {
  addDoc,
  collection,
  type DocumentData,
  getDocs,
  query,
  where,
  getDoc,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore"
import Link from "next/link"
import {
  type MouseEvent,
  useState,
  type ChangeEvent,
  useEffect,
  useRef,
} from "react"
import { Main } from "~/components"
import { useAuth } from "~/components/AuthContext"
import Center from "~/components/Center"
import Textfield from "~/components/Textfield"
import { db } from "~/utils/firebase"

export const Header = () => {
  const { currentUser } = useAuth()
  const paths = currentUser
    ? [
        { value: "#", name: "home" },
        { value: "dashboard", name: "dashboard" },
      ]
    : [
        { value: "#", name: "home" },
        { value: "signin", name: "signin" },
      ]
  return (
    <header className="bg-yellow-500 p-4 capitalize">
      <nav>
        <ul className="flex flex-row justify-around items-center">
          {paths.map(({ value, name }) => {
            return (
              <li key={name}>
                <Link href={`/${value}`}>{name}</Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}

export default function Home() {
  const inpRef = useRef<HTMLInputElement>(null)
  const { currentUser } = useAuth()
  const [users, setUsers] = useState<{ email: string }[]>([])
  const [{ messagingContainer }, setModal] = useState({
    messagingContainer: false,
  })

  useEffect(() => {
    if (currentUser)
      onSnapshot(collection(db, "users"), (snap) => {
        snap.docs.map((doc) =>
          setUsers((p) => [...p, { email: doc.data().email }])
        )
      })
  }, [currentUser])

  const handleModal =
    (props: "messagingContainer") => (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      setModal((p) => ({ ...p, [props]: !p[props] }))
    }
  console.log(users)
  return (
    <Main title="home" description="This is a landing page">
      <Header />
      <Center>
        {currentUser ? (
          <>
            <button onClick={handleModal("messagingContainer")}>
              Compose a message
            </button>
            {messagingContainer && (
              <div className="absolute h-3/4 inset-0 bg-yellow-200">
                <button onClick={handleModal("messagingContainer")}>-</button>
                <form
                  onSubmit={(e: MouseEvent<HTMLFormElement>) => {
                    e.preventDefault()
                    const form = e.currentTarget
                    const input = form.querySelector("input")
                    const textarea = form.querySelector("textarea")
                    const submit = form.querySelector("button")
                    const existing = users.filter(
                      ({ email }) => email === inpRef.current?.value
                    )[0]
                    if (existing) submit?.setAttribute("disabled", "false")

                    const inputText = input?.value.trim()
                    const textareText = textarea?.value.trim()

                    if (inputText && textareText) {
                      if (input && textarea) {
                        console.log(inputText, textareText)
                        setModal((p) => ({ ...p, messagingContainer: false }))
                      }
                    }
                  }}
                >
                  <h3>Message</h3>
                  <Textfield ref={inpRef} name="to">
                    {users.map(({ email }, i) => (
                      <option key={i}>{email}</option>
                    ))}
                  </Textfield>
                  <textarea name="content" />
                  <button disabled={true}>Send</button>
                </form>
              </div>
            )}
          </>
        ) : (
          <h2>
            Sign in to start messaging{" "}
            <span className="underline">
              <Link href="/signin">Click to Sign in</Link>
            </span>
          </h2>
        )}
      </Center>
    </Main>
  )
}
