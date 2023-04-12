import {
  doc,
  type DocumentData,
  getDoc,
  DocumentSnapshot,
  updateDoc,
  arrayUnion,
  runTransaction,
} from "firebase/firestore"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { MouseEvent, useEffect, useState } from "react"
import Center from "~/components/Center"
import { db } from "~/utils/firebase"
import { useAppSelector } from "~/utils/redux/hooks"

type StateTypes = {
  displayName: string
  email: string
  photoUrl: string
  contacts: string[]
}

const UserID = () => {
  const DIMENSION = 32
  const { id } = useAppSelector((s) => s.user)
  const { query } = useRouter()
  const [{ displayName, email, contacts, photoUrl }, setState] = useState<
    StateTypes | DocumentData
  >({
    displayName: "",
    email: "",
    photoUrl: "",
    contacts: [],
  })
  const userId = typeof query.userId === "string" ? query.userId : ""

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userDoc: DocumentSnapshot<DocumentData> = await getDoc(
          doc(db, `/users/${userId}`)
        )
        if (userDoc.exists()) {
          const rest: StateTypes | DocumentData = userDoc.data()
          setState(rest)
        }
      } catch (err) {
        console.log(err)
      }
    }
    fetchUserInfo()
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Center>
      <Link href="/" className="underline absolute top-2 left-2">
        Go back
      </Link>
      {/* <Image
        src={photoUrl}
        height={DIMENSION}
        width={DIMENSION}
        alt="ProfPic"
      /> */}
      <h1>{email}</h1>
      <h3>{displayName}</h3>
      {id !== userId && (
        <>
          <button
            onClick={async (e: MouseEvent<HTMLButtonElement>) => {
              const button: HTMLButtonElement = e.currentTarget
              await runTransaction(db, async (tsx) => {
                button.setAttribute("disabled", "true")
                const docRef = doc(db, `/users/${id}`)
                const fetchDoc = await tsx.get(docRef)
                let contactArr: string[] =
                  fetchDoc.data()?.contacts === undefined
                    ? []
                    : fetchDoc.data()?.contacts
                if (!contactArr.includes(email))
                  tsx.update(docRef, {
                    contacts: arrayUnion(email),
                  })
                else
                  console.log(
                    `You've aready added this user in your contact list`
                  )
                return button.removeAttribute("disabled")
              })
            }}
          >
            Add to Contact
          </button>
          {/* <label>Mutual Contacts</label>
          {contacts.map((v: string) => (
            <p key={v}>{v}</p>
          ))} */}
        </>
      )}
    </Center>
  )
}

export default UserID
