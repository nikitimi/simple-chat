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
  const { chats, chatHead, chatHeads, selectChatHead } = useMessage()
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
    if (isMounted) {
      chatHeads.forEach((v) => {
        const chatData = chats.filter(({ chatId }) => chatId === v)[0]
        if (chatData) setChatHeadState((p) => [...p, chatData.data[0]])
      })
    }
    return () => {
      console.log("Unmounting Active CHats")
      isMounted = false
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats, chatHead])

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
        {chatHeads.map((value, i) => {
          const recipient = chatHeadState[i]?.recipient
          const message = recipient ? chatHeadState[i].message : "foobar"
          try {
            return (
              <button
                key={i}
                onClick={handleClick(chatHeads[i])}
                className="p-3 shadow-sm flex"
              >
                <div className="relative min-w-fit rounded-full overflow-hidden">
                  <Image
                    priority
                    width={DIMENSION}
                    height={DIMENSION}
                    className={`${
                      chatHeadState.length > 0
                        ? "bg-transparent"
                        : "bg-slate-200 animate-load"
                    } transition-colors`}
                    src={recipient ? recipient.photoURL : "/favicon.ico"}
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
                    {recipient ? recipient.displayName : "Foobar"}
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
