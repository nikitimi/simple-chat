This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

Create a Firebase account

Replace the .env variables with the values
provided by Firebase

`[Note!] You shouldn't include .env files regardless if it is
production of development.`

Enable Firestore Database,
Authentication ~~and Storage~~

### `Set-up Authentication`
- Insert your domain in Authentication > Setting > Authorized Domains

### `Handling Queries`
- Create composite index in Firestore Database > Indexes > Add Index

#### Composite Indexes:


For history collection-group:


![Create Compo History](https://user-images.githubusercontent.com/75870962/232265428-5a4e4c76-d282-4aba-a204-501b63b0cab7.png)
![Create Compo History Fields](https://user-images.githubusercontent.com/75870962/232265430-6adb1977-3d1e-4e3d-9387-a9835b11f13f.png)
![Create Compo History Fields Colgroup](https://user-images.githubusercontent.com/75870962/232265449-9ea5691c-9e03-4834-b898-4917c0545908.png)


For chat collection:


![chats](https://user-images.githubusercontent.com/75870962/232265486-cd8a3968-3416-4c9c-ab44-e6c3a31767b2.png)
![chats participants](https://user-images.githubusercontent.com/75870962/232265488-72e64150-9c52-42b7-b033-b0c8d9e2740b.png)
![chats participants col](https://user-images.githubusercontent.com/75870962/232265490-9f998f66-56c2-4635-a12d-e096335ec23b.png)




### Known Issues:

##### 2023-04-16
- Chats renders previous data before rendering new array
- Chat heads doesn't update correctly unlike `preview` branch
- Context providers isn't efficient enough, needs logic reconsideration as some functionality is not working as expected
- UI Design, Chat heads tends to overlap the Chat modal in smaller screen
- Need to remove Redux as It doesn't support non-serializable data, moving to useContext instead
