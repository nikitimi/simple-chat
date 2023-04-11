import React from "react"

const Center = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid text-center place-content-center h-screen max-h-full bg-green-50">
      {children}
    </div>
  )
}

export default Center
