import React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { useAuth } from "~/components/AuthContext"
import { Loading } from "~/components"
import Center from "~/components/Center"

const Signin = () => {
  const DIMENSION = 32
  const { currentUser, googleSignIn } = useAuth()
  const { push } = useRouter()

  if (currentUser) push("/")

  return (
    <Center>
      {currentUser ? (
        <Loading />
      ) : (
        <>
          <Link href="/" className="underline absolute top-2 left-2">
            Go back
          </Link>
          <h3 className="text-2xl">Sign in with:</h3>
          <button
            onClick={() => googleSignIn()}
            className="flex justify-center items-center
      px-2 py-1 rounded-xl border hover:border-blue-500
      hover:scale-110 duration-300 ease shadow-md"
          >
            <Image
              src="/google.svg"
              width={DIMENSION}
              height={DIMENSION}
              alt="google-signin-logo"
            />
            <span>Google</span>
          </button>
        </>
      )}
    </Center>
  )
}

export default Signin
