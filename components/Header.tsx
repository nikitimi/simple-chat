import Link from "next/link"
import { useAuth } from "./AuthContext"

export const Header = () => {
  const { currentUser } = useAuth()
  const paths = currentUser
    ? [
        { value: "#", name: "home" },
        { value: "dashboard", name: "dashboard" },
      ]
    : [
        { value: "#", name: "home" },
        { value: "signin", name: "signin" },
      ]
  return (
    <header className="bg-yellow-500 p-4 capitalize">
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
