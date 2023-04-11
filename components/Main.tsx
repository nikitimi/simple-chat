import Head from "next/head"
import React from "react"
import type { MainTypes } from "./types"

const Main = ({ title, description, className, children }: MainTypes) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={className ? className : ""}>{children}</main>
    </>
  )
}

export default Main
