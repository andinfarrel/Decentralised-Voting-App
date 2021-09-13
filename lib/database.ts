import Gun from 'gun'
import 'gun/sea'
import 'gun/axe'
import 'gun/lib/not'

import { createContext, Dispatch, SetStateAction } from 'react';
import { IGunChainReference } from 'gun/types/chain';

const gunUrl: string = process.env.NEXT_PUBLIC_GUNDB ? process.env.NEXT_PUBLIC_GUNDB : 'https://localhost:3030'

const db = Gun({
  peers: [gunUrl]
})

interface UserContextProps {
  user: IGunChainReference<Record<string, any>, any, false>,
  username: string
  setUsername? : Dispatch<SetStateAction<string>>
}

export const user = db.user().recall({ sessionStorage: true })

const UserContext = createContext<UserContextProps>({ user: user, username: ''})

// const SEA = Gun.SEA

export { db, UserContext }