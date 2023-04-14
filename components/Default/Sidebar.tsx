import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore"
import Image from "next/image"
import { useEffect, useState } from "react"
import { chatColName } from "~/pages"
import { db } from "~/utils/firebase"
import { toggleModal } from "~/utils/redux/actions/uiActions"
import { setChatHeads, setChatModal } from "~/utils/redux/actions/userActions"
import { useAppDispatch, useAppSelector } from "~/utils/redux/hooks"
import { useAuth } from "../AuthContext"
import { useMessage } from "../MessageContext"

const SideBar = ({ blur }: { blur: boolean }) => {
  const dispatch = useAppDispatch()
  const { messageModal, chatHeader } = useAppSelector((s) => s.ui)
  const { chats, chatHeads, chatHead, selectChatHead } = useMessage()

  const handleClick =
    (chatHead: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      const style = "bg-blue-300"
      const altStyle = "even:bg-slate-100"
      const currentButton = e.currentTarget
      const buttons = currentButton.parentElement?.querySelectorAll("button")
      buttons?.forEach((button) => {
        button.classList.add("even:bg-slate-100")
        button.classList.remove(style)
      })
      currentButton.classList.toggle(altStyle)
      currentButton.classList.add(style)
      selectChatHead(chatHead)
    }

  return (
    <section
      className={`${
        blur ? "custom-blur" : ""
      } min-h-[93vh] bg-slate-50 border-r border-slate-200 w-2/5 text-center duration-300 ease`}
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
      <div className="grid grid-rows-7">
        {chatHeads.map((v, i) => {
          // TODO: need to figure out the Array with 0 length
          try {
            const data = chats.filter(
              (obj) => Object.keys(obj)[0] === chatHeads[i]
            )[0]
            const objHolder = data && Object.values(data)[0][0].recipient
            const displayName = data ? objHolder.displayName : "Foobar"
            const photoURL = data ? objHolder.photoURL : "/favicon.ico"
            const DIMENSION = 80

            return (
              <button
                key={v}
                onClick={handleClick(chatHeads[i])}
                className="bg-slate-50 p-3 shadow-sm flex"
              >
                <div className="relative min-w-fit rounded-full overflow-hidden">
                  <Image
                    width={DIMENSION}
                    height={DIMENSION}
                    className={`${
                      data ? "bg-transparent" : "bg-slate-200 animate-load"
                    } transition-colors`}
                    src={photoURL}
                    alt="ava-photo"
                  />
                </div>
                <h3
                  className={`${
                    data
                      ? "text-black"
                      : "text-slate-200 bg-slate-200 animate-load"
                  } grow font-semibold text-center transition-colors`}
                >
                  {displayName}
                </h3>
              </button>
            )
          } catch (err) {
            console.log(err)
          }
        })}
      </div>
      <div className="grid justify-center grid-rows-7 gap-4"></div>
    </section>
  )
}

export default SideBar
