import { doc, runTransaction } from "firebase/firestore"
import { createContext, useContext, useState, useEffect } from "react"
import type { UserDataInterface } from "./types"
import { db } from "~/utils/firebase"
import Center from "./Center"
import Loading from "./Loading"

type UserContextTypes = {
  userId: string[]
  checkNewID: (pushNewLink: string) => void
  userData: UserDataInterface[]
}

const UserContext = createContext<UserContextTypes>({
  userId: [],
  checkNewID: () => null,
  userData: [],
})

export const useUser = () => useContext(UserContext)
export const UserProvider: React.FC<any> = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [userId, setNewId] = useState<string[]>([])
  const [userData, setUserData] = useState<UserDataInterface[]>([])
  const [loading, setLoading] = useState(true)

  const checkNewID = (uid: string) => {
    const userIndex = userId.findIndex((id) => id === uid)
    if (userIndex === -1) return setNewId((p) => [...p, uid])
    return console.log(`User already exist, found on index: ${userIndex}`)
  }

  async function fetchUser(uid: string) {
    try {
      await runTransaction(db, async (tsx) => {
        const userDataDoc = await tsx.get(doc(db, `/users/${uid}`))
        if (userDataDoc.exists()) {
          console.log("setting user")
          const newUserData = {
            ...userDataDoc.data(),
            userId: uid,
          } as UserDataInterface
          return setUserData((p) => [...p, newUserData])
        }
        console.log("user not found")
      })
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    let isMounted = true
    if (isMounted) {
      // Ensures that we get the latest value
      if (userId.length > 0) fetchUser(userId[userId.length - 1])
      setLoading(false)
    }
    return () => {
      console.log("User context Unmounted")
      isMounted = false
    }
  }, [userId])

  const value = {
    userId,
    checkNewID,
    userData,
  }

  return (
    <UserContext.Provider value={value}>
      {loading ? (
        <Center>
          <Loading />
        </Center>
      ) : (
        children
      )}
    </UserContext.Provider>
  )
}
export default UserContext
