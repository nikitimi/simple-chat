import Image from "next/image"
import { useEffect, useState } from "react"
import { toggleModal } from "~/utils/redux/actions/uiActions"
import { useAppDispatch, useAppSelector } from "~/utils/redux/hooks"
import { useMessage } from "../../contexts/MessageContext"
import type { MessageInterface, UserMessageHeader } from "../types"

const SideBar = ({ blur }: { blur: boolean }) => {
  const dispatch = useAppDispatch()
  const { messageModal, chatHeader } = useAppSelector((s) => s.ui)
  const { chats, chatHead, chatHeads, selectChatHead } = useMessage()
  const [chatHeadState, setChatHeadState] = useState<MessageInterface[]>([])
  // Styles
  const baseStyle = "p-3 shadow-sm flex"
  const activeStyle = `bg-blue-300 ${baseStyle}`
  const inactiveStyle = `even:bg-slate-100 bg-slate-50 ${baseStyle}`
  const buttons = document.querySelectorAll("#chat-head")

  function removeButtonStyles(selectedTarget: HTMLElement | Element) {
    buttons.forEach((button) => {
      button.removeAttribute("class")
      button.setAttribute("class", inactiveStyle)
    })
    if (selectedTarget) {
      // console.log(selectedTarget)
      selectedTarget.removeAttribute("class")
      selectedTarget.setAttribute("class", activeStyle)
    }
  }

  const handleClick =
    (chatHead: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      const button: HTMLButtonElement = e.currentTarget
      selectChatHead(chatHead)
      setTimeout(() => removeButtonStyles(button))
    }

  useEffect(() => {
    let isMounted = true
    if (isMounted) {
      chatHeads.forEach((v) => {
        const chatData = chats[v]
        if (chatData) setChatHeadState((p) => [...p, chatData[0]])
      })
      removeButtonStyles(buttons[0])
    }
    return () => {
      console.log("Unmounting sidebar")
      isMounted = false
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats, chatHead, chatHeads])

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
          const DIMENSION = 80

          const recipient = chats[value]?.[0].recipient
          const message = recipient ? chats[value][0].message : "foobar"
          try {
            return (
              <button
                id="chat-head"
                key={i}
                onClick={handleClick(chatHeads[i])}
                onLoad={(e) =>
                  e.currentTarget.setAttribute("class", inactiveStyle)
                }
                disabled={!recipient && true}
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
                <div className="flex flex-col grow items-start justify-center">
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
