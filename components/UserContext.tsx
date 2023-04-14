import { doc, onSnapshot, runTransaction } from "firebase/firestore"
import { createContext, useContext, useEffect, useState } from "react"
import { db } from "~/utils/firebase"
import Center from "./Center"
import Loading from "./Loading"
import type { UserDataInterface, UserDataTypes } from "./types"

interface CurrentUserInterface extends UserDataTypes {
  contacts: UserDataTypes[]
}

type UserContextTypes = {
  userId: string[]
  userData: UserDataInterface[]
  checkUserID: (userId: string) => void
  setCurrentUserId: (cuid: string) => void
  currentUserId: string | null
  currentUserData: CurrentUserInterface | null
}

const UserContext = createContext<UserContextTypes>({
  userId: [],
  userData: [],
  checkUserID: () => null,
  setCurrentUserId: () => null,
  currentUserId: null,
  currentUserData: null,
})

export const useUser = () => useContext(UserContext)
export const UserProvider: React.FC<any> = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [userId, setNewId] = useState<string[]>([])
  const [userData, setUserData] = useState<UserDataInterface[]>([])
  const [currentUserId, setCUID] = useState<string | null>(null)
  const [currentUserData, setCurrentUserData] =
    useState<CurrentUserInterface | null>(null)
  const [loading, setLoading] = useState(true)

  const checkUserID = (uid: string) => {
    const userIndex = userId.findIndex((id) => id === uid)
    if (userIndex === -1) return setNewId((p) => [...p, uid])
    return console.log(`User already exist, found on index: ${userIndex}`)
  }
  const setCurrentUserId = (uid: string) => {
    setCUID(uid)
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
      console.log("Users unmounted")
      isMounted = false
    }
  }, [userId])

  useEffect(() => {
    let isMounted = true
    if (currentUserId)
      onSnapshot(doc(db, `/users/${currentUserId}`), (doc) => {
        setCurrentUserData(doc.data() as CurrentUserInterface)
      })
    return () => {
      console.log("Current user unmounted")
      isMounted = true
    }
  }, [currentUserId])

  const value = {
    userId,
    userData,
    checkUserID,
    setCurrentUserId,
    currentUserId,
    currentUserData,
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
