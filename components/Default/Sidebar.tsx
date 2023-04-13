import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore"
import { useEffect, useState } from "react"
import { chatColName } from "~/pages"
import { db } from "~/utils/firebase"
import { toggleModal } from "~/utils/redux/actions/uiActions"
import { setChatHeads, setChatModal } from "~/utils/redux/actions/userActions"
import { useAppDispatch, useAppSelector } from "~/utils/redux/hooks"
import { useAuth } from "../AuthContext"

const SideBar = ({ blur }: { blur: boolean }) => {
  const dispatch = useAppDispatch()
  const { messageModal, chatHeader } = useAppSelector((s) => s.ui)
  const { chatHeads } = useAppSelector((s) => s.user)
  const { currentUser } = useAuth()
  const colRef = collection(db, chatColName)
  const [counter, setCounter] = useState(-1)

  useEffect(() => {
    let isMounted = true

    const fetchChats = async () => {
      try {
        const chatHeadsDocs = await getDocs(colRef)
        if (currentUser && !chatHeadsDocs.empty && !chatHeads) {
          console.log("chatHeads")
          onSnapshot(
            query(
              colRef,
              where("participants", "array-contains-any", [currentUser.email]),
              orderBy("updatedAt", "desc"),
              limit(7)
            ),
            (snap) => {
              let chatHeadsHolder: string[] = []
              if (!snap.empty)
                snap.forEach((document) => {
                  console.log(document.id)
                  chatHeadsHolder.push(document.id)
                })
              setCounter(counter + 1)
              dispatch(setChatHeads(chatHeadsHolder))
            }
          )
        }
      } catch (err) {
        console.log(err)
      }
    }
    if (isMounted) {
      console.log("Sidebar mounted!")
      fetchChats()
    }
    return () => {
      isMounted = false
    }
  }, [colRef, dispatch, chatHeads, counter, currentUser])

  // console.log(counter)
  return (
    <section
      className={`${
        blur ? "custom-blur" : ""
      } min-h-[93vh] bg-slate-50 border-r border-slate-200 w-1/4 text-center duration-300 ease`}
    >
      <label htmlFor="create-message">Create a Message</label>
      <button
        disabled={messageModal || chatHeader}
        id="create-message"
        className="bg-green-500 text-white px-2 py-1 rounded-md w-full"
        onClick={() => dispatch(toggleModal("messageModal"))}
      >
        +
      </button>
      <div className="grid justify-center grid-rows-7 gap-4">
        {chatHeads?.map((v, i) => {
          const color = "bg-blue-300"
          return (
            <div
              className={`${
                counter > 0 && i === 0 ? color : ""
              } shadow-md w-full max-w-fit px-4 py-2 overflow-hidden rounded-full`}
              key={v}
            >
              <button
                disabled={messageModal || chatHeader}
                className="text-3xl"
                onClick={async (e) => {
                  const button: HTMLButtonElement = e.currentTarget
                  button.parentElement?.parentElement
                    ?.querySelectorAll("button")
                    .forEach((button) => {
                      button.parentElement?.classList.remove(color)
                    })
                  button.parentElement?.classList.add(color)
                  console.log("chatModals")
                  dispatch(setChatModal(v))
                }}
              >
                {v.substring(20, v.length)}
                {/* <Image
                    src="/vercel.svg"
                    height={32}
                    width={32}
                    alt="user-icon"
                  /> */}
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default SideBar
