import Gun from 'gun'
import 'gun/sea'
import 'gun/axe'
import 'gun/lib/not'

const gunUrl: string = process.env.NEXT_PUBLIC_GUNDB ? process.env.NEXT_PUBLIC_GUNDB : 'https://localhost:3030/gun'

const db = Gun({
  peers: [gunUrl]
})

const gunUser = db.user()

export { db, gunUser }