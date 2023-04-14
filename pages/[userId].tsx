import { arrayUnion, doc, runTransaction } from "firebase/firestore"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { Loading } from "~/components"
import { useAuth } from "~/components/AuthContext"
import Center from "~/components/Center"
import MessageModal from "~/components/Default/MessageModal"
import { UserDataInterface, UserDataTypes } from "~/components/types"
import { useUser } from "~/components/UserContext"

import { db } from "~/utils/firebase"
import { useAppSelector } from "~/utils/redux/hooks"

const UserID = () => {
  const { query, push } = useRouter()
  const { currentUser } = useAuth()
  const { userData, checkNewID } = useUser()
  const [message, setMessage] = useState<string | null>(null)
  const [modal, toggleModal] = useState(false)
  const { id } = useAppSelector((s) => s.user)
  const userId = typeof query.userId === "string" ? query.userId : ""
  const isProfileTheUser = id === userId
  const addContactBtnStyle = "add-contacts-button" // button-style-name-init
  const disContactBtnStyle = "add-contacts-button-disabled" // button-style-name-init

  const handleAddToContact =
    (uid: string) => async (e: React.MouseEvent<HTMLButtonElement>) => {
      const button: HTMLButtonElement = e.currentTarget
      const currentUserRef = doc(db, `/users/${id}`)
      // button-style
      button.setAttribute("disabled", "true")
      button.classList.add(disContactBtnStyle)
      button.classList.remove(addContactBtnStyle)

      if (!currentUser) return setMessage("You need to sign in first")
      if (isProfileTheUser)
        return setMessage("You're this user.. Badum, awkward")

      if (message === null)
        await runTransaction(db, async (tsx) => {
          console.log("transaction runs")
          const currentUserDoc = await tsx.get(currentUserRef)
          const { contacts, userId, ...rest } =
            currentUserDoc.data() as UserDataInterface
          if (contacts.filter(({ email }) => email === rest.email))
            return setMessage(`You've already added this user`)
          tsx.update(currentUserRef, {
            contacts: arrayUnion(rest),
          })
          // button-style
          button.classList.add(addContactBtnStyle)
          button.classList.remove(disContactBtnStyle)
          button.removeAttribute("disabled")
        })
    }

  useEffect(() => {
    let isMounted = true
    if (isMounted) checkNewID(userId)
    return () => {
      isMounted = false
    }
  }, [checkNewID, userId])

  if (isProfileTheUser) {
    push("/dashboard")
    return <></>
  }
  if (userData.length > 0) {
    const { email, displayName, photoURL } = userData.filter(
      (u) => u.userId === userId
    )[0]

    return (
      <Center>
        <Link href="/" className="underline absolute top-2 left-2">
          Go back
        </Link>
        <div className="rounded-full overflow-hidden w-24 h-24 relative">
          <Image
            className="object-contain"
            src={photoURL}
            fill
            alt="user-avatar"
          />
        </div>
        <h1>{email}</h1>
        <h3>{displayName}</h3>
        <button
          className={isProfileTheUser ? "hidden" : addContactBtnStyle}
          onClick={handleAddToContact(userId)}
          disabled={isProfileTheUser}
        >
          Add to Contact
        </button>
        <button
          className="fixed right-0"
          onClick={() => toggleModal((p) => !p)}
        >
          Message
        </button>
        <p
          className={`${
            message ? "opacity-100" : "opacity-0"
          } prompt bg-yellow-200`}
        >
          {message}
        </p>
        {modal && <MessageModal />}
      </Center>
    )
  }
  return (
    <Center>
      <Loading />
    </Center>
  )
}

export default UserID
