import Gun from 'gun'
import 'gun/sea';
import 'gun/axe';
import 'gun/lib/not'

const gunUrl: string = process.env.NEXT_PUBLIC_GUNDB ? process.env.NEXT_PUBLIC_GUNDB : 'https://localhost:3030'

const db = Gun({
  peers: [gunUrl]
})

const user = db.user().recall({ sessionStorage: true })
const SEA = Gun.SEA

export { db, user, SEA }