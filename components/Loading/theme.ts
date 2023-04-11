export const colorChildren = (props: "default" | "discord") => {
  switch (props) {
    case "default":
      return "bg-night-owl-dark-1 text-night-owl-secondary"
    case "discord":
      return "bg-discord-dark-1 text-discord-secondary"

    default:
      return
  }
}
export const colorFooter = (props: "default" | "discord") => {
  switch (props) {
    case "default":
      return "bg-night-owl-dark-2 text-night-owl-primary"
    case "discord":
      return "bg-discord-dark-2 text-discord-primary"

    default:
      return
  }
}
export const colorHeader = (props: "default" | "discord") => {
  switch (props) {
    case "default":
      return "bg-night-owl-dark-3 text-night-owl-accent-2"
    case "discord":
      return "bg-discord-dark-3 text-discord-accent-2"

    default:
      return
  }
}
export const colorButton = (props: "default" | "discord") => {
  switch (props) {
    case "default":
      return "bg-night-owl-dark-3 text-night-owl-primary"
    case "discord":
      return "bg-discord-dark-3 text-discord-primary"

    default:
      return
  }
}
export const colorTextfield = (props: "default" | "discord") => {
  switch (props) {
    case "default":
      return "bg-night-owl-dark-3 text-night-owl-primary"
    case "discord":
      return "bg-discord-dark-3 text-discord-primary"

    default:
      return
  }
}
export const colorSelect = (props: "default" | "discord") => {
  switch (props) {
    case "default":
      return "bg-night-owl-dark-3 text-night-owl-accent-3"
    case "discord":
      return "bg-discord-dark-3 text-discord-accent-3"

    default:
      return
  }
}
