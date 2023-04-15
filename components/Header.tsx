import Link from "next/link"
import { useAppSelector } from "~/utils/redux/hooks"
import { useAuth } from "~/contexts"

const Header = ({ blur }: { blur: boolean }) => {
  const { messageModal, chatHeader } = useAppSelector((s) => s.ui)
  const { currentUser } = useAuth()
  const paths = currentUser
    ? [
        { value: "", name: "chats" },
        { value: "dashboard", name: "dashboard" },
      ]
    : [
        { value: "", name: "chats" },
        { value: "signin", name: "signin" },
      ]
  return (
    <header
      className={`${
        blur ? "custom-blur" : ""
      } bg-slate-50 border-b border-slate-200 p-4 capitalize duration-300 ease`}
    >
      <nav>
        <ul className="flex flex-row justify-around items-center">
          {paths.map(({ value, name }) => {
            return (
              <li key={name}>
                <Link
                  href={`/${value}`}
                  className={messageModal || chatHeader ? "cursor-default" : ""}
                  onClick={(e) => {
                    if (messageModal || chatHeader) e.preventDefault()
                  }}
                >
                  {name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}
export default Header
