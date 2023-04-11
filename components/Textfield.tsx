import React, { forwardRef, type Ref } from "react"
import type { TextfieldTypes } from "./types"

const Textfield = forwardRef<HTMLInputElement, TextfieldTypes>(
  ({ name, children }, ref: Ref<HTMLInputElement>) => {
    return (
      <div>
        <label htmlFor={name}>{name}</label>
        <input id={name} ref={ref} type="text" list={`search-${name}`} />
        <datalist id={`search-${name}`}>{children}</datalist>
      </div>
    )
  }
)

Textfield.displayName = "Textfield"
export default Textfield
