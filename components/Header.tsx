import Link from "next/link"
import { useAuth } from "./AuthContext"

export const Header = ({ blur }: { blur: boolean }) => {
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
        blur ? "blur-sm" : ""
      } bg-slate-50 border-b border-slate-200 p-4 capitalize duration-300 ease`}
    >
      <nav>
        <ul className="flex flex-row justify-around items-center">
          {paths.map(({ value, name }) => {
            return (
              <li key={name}>
                <Link href={`/${value}`}>{name}</Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}
