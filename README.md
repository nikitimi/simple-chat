# What is this?
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

Add Me:
```
https://simple-chat-wheat.vercel.app/ogdMqUtY0JZf8dFMVfgo
```
- You can share yours by clicking the share button in `Dashboard > Share`
- Contact list will only appear in the compose button in `chats` route below create new message.

# Getting Started

## Firebase

### Project & Database set-up
- Create a project in [Firebase](https://console.firebase.google.com/) by clicking `Add Project`, and name it with your desired project name.
- Enable Firestore Database and copy the configuration setting values.
- Replace the .env variables with the values from configuration setting. 
`[Note!] You shouldn't include .env files regardless if it is production of development.`

###  Authentication set-up
- Insert your domain in `Authentication > Setting > Authorized Domains`

### Handling Queries
- Create composite index in `Firestore Database > Indexes > Add Index`
- Composite Indexes:
  - ![Create Compo History](https://user-images.githubusercontent.com/75870962/232265428-5a4e4c76-d282-4aba-a204-501b63b0cab7.png)
  - ![Create Compo History Fields](https://user-images.githubusercontent.com/75870962/232265430-6adb1977-3d1e-4e3d-9387-a9835b11f13f.png)
  - ![Create Compo History Fields Colgroup](https://user-images.githubusercontent.com/75870962/232265449-9ea5691c-9e03-4834-b898-4917c0545908.png)

  - ![chats](https://user-images.githubusercontent.com/75870962/232265486-cd8a3968-3416-4c9c-ab44-e6c3a31767b2.png)
  - ![chats participants](https://user-images.githubusercontent.com/75870962/232265488-72e64150-9c52-42b7-b033-b0c8d9e2740b.png)
  - ![chats participants col](https://user-images.githubusercontent.com/75870962/232265490-9f998f66-56c2-4635-a12d-e096335ec23b.png)

# Changelogs [SOLVED]:
### 2023-04-18 [reference](./README.md#2023-04-16)
- Chats renders previous data before rendering new array.
- Chat heads doesn't update correctly unlike `preview` branch.

# Known Issues:

### 2023-04-18
- UI Design needs a structure so the interactions between components would result the expected outcome.
- After deleting a conversation, a null `Chat Modal` persists, and sometimes the remaining user is referenced in the deleted `Chat Modal`

### 2023-04-16
- Chats renders previous data before rendering new array.
- Chat heads doesn't update correctly unlike `preview` branch.
- Context providers isn't efficient enough, needs logic reconsideration as some functionality is not working as expected.
- UI Design, Chat heads tends to overlap the Chat modal in smaller screen.
- Need to remove Redux as It doesn't support non-serializable data, moving to useContext instead.
