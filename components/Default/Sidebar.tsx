import Image from "next/image"
import { useEffect, useState } from "react"
import { toggleModal } from "~/utils/redux/actions/uiActions"
import { useAppDispatch, useAppSelector } from "~/utils/redux/hooks"
import { useMessage } from "../../contexts/MessageContext"
import type { MessageInterface, UserMessageHeader } from "../types"

const SideBar = ({ blur }: { blur: boolean }) => {
  const DIMENSION = 80
  const dispatch = useAppDispatch()
  const { messageModal, chatHeader } = useAppSelector((s) => s.ui)
  const { chats, chatHeads, selectChatHead } = useMessage()
  const [chatHeadState, setChatHeadState] = useState<MessageInterface[]>([])

  const handleClick =
    (chatHead: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      const baseStyle = "p-3 shadow-sm flex"
      const activeStyle = `bg-blue-300 ${baseStyle}`
      const inactiveStyle = `even:bg-slate-100 bg-slate-50 ${baseStyle}`
      const currentButton = e.currentTarget
      const buttons = currentButton.parentElement?.querySelectorAll("button")
      buttons?.forEach((button) => {
        button.removeAttribute("class")
        button.setAttribute("class", inactiveStyle)
      })
      currentButton.removeAttribute("class")
      currentButton.setAttribute("class", activeStyle)
      selectChatHead(chatHead)
    }

  useEffect(() => {
    let isMounted = true
    if (chatHeads) {
      let placeHolderArr: MessageInterface[] = []
      chatHeads.forEach((v) => {
        const chatFiltered = chats.filter((obj) => Object.keys(obj)[0] === v)[0]
        if (chatFiltered) placeHolderArr.push(Object.values(chatFiltered)[0][0])
      })
      setChatHeadState(placeHolderArr)
    }
    return () => {
      console.log("Unmounting Active CHats")
      isMounted = false
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats])
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
        {chatHeadState.length > 0 &&
          chatHeadState.map((value, i) => {
            const photoURL =
              chatHeadState.length > 0
                ? value?.recipient.photoURL
                : "/favicon.ico"
            const displayName =
              chatHeadState.length > 0 ? value?.recipient.displayName : "foobar"
            const message =
              chatHeadState.length > 0 && value ? value.message : "foobar"
            try {
              return (
                <button
                  key={i}
                  onClick={handleClick(chatHeads[i])}
                  className="p-3 shadow-sm flex"
                >
                  <div className="relative min-w-fit rounded-full overflow-hidden">
                    <Image
                      width={DIMENSION}
                      height={DIMENSION}
                      className={`${
                        chatHeadState.length > 0
                          ? "bg-transparent"
                          : "bg-slate-200 animate-load"
                      } transition-colors`}
                      src={photoURL}
                      alt=""
                    />
                  </div>
                  <div>
                    <h3
                      className={`${
                        chatHeadState.length > 0
                          ? "text-black"
                          : "text-slate-200 bg-slate-200 animate-load"
                      } font-semibold text-center transition-colors`}
                    >
                      {displayName}
                    </h3>
                    <p
                      className={`${
                        chatHeadState.length > 0
                          ? "text-slate-400"
                          : "text-slate-200 bg-slate-200 animate-load"
                      }`}
                    >{`${message.substring(0, 4)}...`}</p>
                  </div>
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
