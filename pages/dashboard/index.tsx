import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import React from "react"
import { Loading } from "~/components"
import { useAuth } from "~/components/AuthContext"
import Center from "~/components/Center"
import { useAppSelector } from "~/utils/redux/hooks"

const Dashboard = () => {
  const DIMENSION = 80
  const { id } = useAppSelector((s) => s.user)
  const { currentUser, signout } = useAuth()
  const { push } = useRouter()

  if (!currentUser) push("/")

  if (currentUser) {
    const { email, displayName, photoURL } = currentUser
    return (
      <Center>
        <Link href="/" className="underline absolute top-2 left-2">
          Go back
        </Link>
        <div className="rounded-full overflow-hidden w-fit mx-auto">
          <Image
            src={photoURL ? photoURL : ""}
            width={DIMENSION}
            height={DIMENSION}
            alt="profile-pic"
          />
        </div>
        <h1>{displayName}</h1>
        <h3>{email}</h3>
        <button
          onClick={async () => await signout()}
          className="w-full max-w-fit mx-auto capitalize rounded-xl px-2 py-1 border bg-red-500 text-white shadow-md hover:scale-110 duration-300 ease"
        >
          signout
        </button>
        <button
          className="w-full max-w-fit mx-auto capitalize rounded-xl px-2 py-1 border bg-yellow-400 text-white shadow-md hover:scale-110 duration-300 ease"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault()

            navigator.clipboard.writeText(`${window.location.host}/${id}`)
          }}
        >
          Share
        </button>
      </Center>
    )
  }
  return (
    <Center>
      <Loading />
    </Center>
  )
}

export default Dashboard
