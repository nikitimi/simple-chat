import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { Loading, Center } from "~/components"
import MessageModal from "~/components/Chat/MessageModal"
import { useUser } from "~/contexts"

const UserID = () => {
  const { query, push } = useRouter()
  const {
    userData,
    checkUserID,
    currentUserId,
    handleAddToContacts,
    promptMessage,
  } = useUser()
  const [modal, toggleModal] = useState(false)
  const userId = typeof query.userId === "string" ? query.userId : ""
  const isProfileTheUser = currentUserId === userId
  const addContactBtnStyle = "add-contacts-button" // button-style-name-init
  const disContactBtnStyle = "add-contacts-button-disabled" // button-style-name-init

  const contactButton = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // button-style
    const button: HTMLButtonElement = e.currentTarget
    button.setAttribute("disabled", "true")
    button.classList.add(disContactBtnStyle)
    button.classList.remove(addContactBtnStyle)

    await handleAddToContacts(userId)
    // button-style
    button.classList.add(addContactBtnStyle)
    button.classList.remove(disContactBtnStyle)
    button.removeAttribute("disabled")
  }

  useEffect(() => {
    let isMounted = true
    if (isMounted) {
      console.log(`Checking User Ids`)
      checkUserID(userId)
    }
    return () => {
      isMounted = false
    }
  }, [checkUserID, userId])

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
          onClick={contactButton}
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
            promptMessage === "" ? "opacity-0" : "opacity-100"
          } prompt bg-yellow-200`}
        >
          {promptMessage}
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
