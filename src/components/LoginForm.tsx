import { NextComponentType } from 'next'
import { useState } from 'react'
import { useAuth } from '@app/hooks/use-auth';

const LoginForm: NextComponentType = () => {
  const { currentUser, login, signOut, signUp } = useAuth()

  const [usernameForm, setusernameForm] = useState('')
  const [passwordForm, setpasswordForm] = useState('')

  // @ts-ignore
  if (currentUser.is) {
    return (
      <></>
    )
  } else {
    return (
      <div className="flex flex-col space-y-4 p-8">
        <div className="flex flex-col space-y-4 text-lg lg:text-xl">
          <label>username</label>
          <input onChange={e => setusernameForm(e.target.value)} type="text" className="bg-black border-white border-2 rounded-md p-2"/>
        </div>
        <div className="flex flex-col space-y-4 text-lg lg:text-xl">
          <label>password</label>
          <input onChange={e => setpasswordForm(e.target.value)} type="password" className="bg-black border-white border-2 rounded-md p-2"/>
        </div>
        <div className="flex flex-row justify-evenly space-x-4 pt-2">
          <button onClick={() => login(usernameForm, passwordForm)} className="px-4 py-2 w-full bg-green-300 text-black">Login</button>
          <button onClick={() => signUp(usernameForm, passwordForm)}className="px-4 py-2 w-full bg-purple-300 text-black">Sign Up</button>
        </div>
      </div>
    )
  }
}

export {LoginForm}