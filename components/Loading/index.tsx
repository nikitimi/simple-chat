import Head from "next/head"
import { colorChildren } from "./theme"
import { Animation } from "./Animation"

const Loading = () => {
  const DIMENSION = 80
  return (
    <div className="absolute-center">
      <Head>
        <link rel="icon" type="image/x-icon" href="/favicon.svg" />
      </Head>
      <div className={`relative ${colorChildren("default")}`}>
        <Animation isChild />
      </div>
    </div>
  )
}

export default Loading
