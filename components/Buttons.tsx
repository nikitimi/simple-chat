import React from "react"
interface MinimizeTypes extends React.HTMLAttributes<HTMLButtonElement> {
  name: string
}
export const Minimize = ({ name, ...rest }: MinimizeTypes) => {
  return (
    <button {...rest} className="rounded-md px-2 bg-red-500 text-white">
      {name}
    </button>
  )
}
