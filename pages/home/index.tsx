import {
  addDoc,
  collection,
  type DocumentData,
  getDocs,
  query,
  where,
  getDoc,
  onSnapshot,
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
  const paths = currentUser ? ["home", "dashboard"] : ["home", "signin"]
  return (
    <header className="bg-yellow-500 p-4 capitalize">
      <nav>
        <ul className="flex flex-row justify-around items-center">
          {paths.map((v) => {
            return (
              <li key={v}>
                <Link href={`/${v}`}>{v}</Link>
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
  const [{ contactContainer, messagingContainer }, setModal] = useState({
    contactContainer: false,
    messagingContainer: false,
  })
  const userCol = collection(db, "users")

  useEffect(() => {
    onSnapshot(userCol, (snap) => {
      snap.docs.map((doc) =>
        setUsers((p) => [...p, { email: doc.data().email }])
      )
    })
  }, [userCol])

  const fetchUser = async () => {
    if (currentUser) {
      let array: DocumentData = []
      const { email, displayName } = currentUser
      const snap = await getDocs(query(userCol, where("email", "==", email)))
      if (
        snap.empty
        // && process.env.NODE_ENV === "production"
      )
        addDoc(userCol, {
          email,
          displayName,
        })
    }
  }
  fetchUser()

  const handleModal =
    (props: "contactContainer" | "messagingContainer") =>
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      setModal((p) => ({ ...p, [props]: !p[props] }))
    }

  return (
    <Main title="home" description="This is a landing page">
      <Header />
      <Center>
        {currentUser ? (
          <>
            <button onClick={handleModal("contactContainer")}>
              Create new contact
            </button>
            {contactContainer && (
              <div className="absolute h-3/4 inset-0 bg-yellow-200">
                <button onClick={handleModal("contactContainer")}>-</button>
                <h3>Contact</h3>
                <input
                  onChange={(e) => console.log(e.target.value)}
                  type="text"
                />
              </div>
            )}
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
                    {users
                      .filter(({ email }) =>
                        email.includes(
                          inpRef.current ? inpRef.current.value : ""
                        )
                      )

                      .map(({ email }, i) => (
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
