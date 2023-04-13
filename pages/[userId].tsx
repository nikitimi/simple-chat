import { doc, runTransaction } from "firebase/firestore"
import { InferGetServerSidePropsType } from "next"
import Link from "next/link"
import React from "react"
import Center from "~/components/Center"
import { UserDataTypes } from "~/components/types"

import { db } from "~/utils/firebase"
import { useAppSelector } from "~/utils/redux/hooks"

const UserID = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const { userId, data } = props
  const DIMENSION = 32
  // const { push } = useRouter()
  // const { currentUser } = useAuth()
  const { id } = useAppSelector((s) => s.user)

  if (data) {
    const { displayName, email, photoUrl } = data

    return (
      <Center>
        <Link href="/" className="underline absolute top-2 left-2">
          Go back
        </Link>
        <h1>{email}</h1>
        <h3>{displayName}</h3>
        {id !== userId && (
          <>
            {/* <button
            onClick={async (e: MouseEvent<HTMLButtonElement>) => {
              if (!currentUser) return push("/signin")
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
              })
              button.removeAttribute("disabled")
            }}
          >
            Add to Contact
          </button> */}
          </>
        )}
      </Center>
    )
  }
  return <Center>404 User not found</Center>
}

export const getServerSideProps = async (ctx: {
  params: { userId: string }
}) => {
  const { userId } = ctx.params

  async function fetchUserInfo() {
    const docRef = doc(db, `/users/${userId}`)
    return await runTransaction(db, async (tsx) => {
      const userDoc = await tsx.get(docRef)
      return userDoc.exists() && (userDoc.data() as UserDataTypes)
    })
  }
  const data = await fetchUserInfo()

  return { props: { data, userId } }
}

export default UserID
