import {
  addDoc,
  collection,
  type DocumentData,
  getDocs,
  query,
  where,
  getDoc,
} from "firebase/firestore"
import Link from "next/link"
import { type MouseEvent, useState, type ChangeEvent } from "react"
import { Main } from "~/components"
import { useAuth } from "~/components/AuthContext"
import Center from "~/components/Center"
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
  const { currentUser } = useAuth()
  const [users, setUsers] = useState<{ email: string }[]>([])
  const [{ contactContainer, messagingContainer }, setModal] = useState({
    contactContainer: false,
    messagingContainer: false,
  })
  const userCol = collection(db, "users")

  const fetchUser = async () => {
    if (currentUser) {
      let array: DocumentData = []
      const { email, displayName } = currentUser
      const snap = await getDocs(query(userCol, where("email", "==", email)))
      if (snap.empty && process.env.NODE_ENV === "production")
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
                <h3>Message</h3>
                <input
                  placeholder="To"
                  onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                    const inp: HTMLInputElement = e.currentTarget
                    const snap = await getDocs(
                      query(
                        userCol,
                        where("email", "array-contains-any", inp.value)
                      )
                    )
                    if (!snap.empty) snap.forEach((e) => console.log(e.data()))
                  }}
                  type="text"
                />
                <input
                  placeholder="Content"
                  onChange={(e) => console.log(e.target.value)}
                  type="text"
                />
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
