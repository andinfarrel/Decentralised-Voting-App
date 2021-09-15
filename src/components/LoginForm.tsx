import { NextComponentType } from 'next'
import { useContext, useState } from 'react'
import { AppContext, useAppStore } from '@app/providers/App';

const LoginForm: NextComponentType = () => {
  const {currentUser } = useAppStore()

  const [usernameForm, setusernameForm] = useState('')
  const [passwordForm, setpasswordForm] = useState('')

  const login =  () => {
    console.log(currentUser)
    currentUser.auth(usernameForm, passwordForm, async (ack: any) => {
      if (ack.err) {
        ack.err && alert(ack.err)
      } else {
        console.log('successful login!')
      }
    })
  }

  const signUp = () => {
    if (usernameForm.length < 4) {
      alert('usernameForm too short! minimun 4 char')
      return
    }
    if (passwordForm.length < 8) {
      alert('passwordForm too short! minimum 8 char')
      return
    }
    currentUser.create(usernameForm, passwordForm, ({ err }: any) => {
      if (err) {
        alert(err);
      } else {
        login();
      }
    });
  }

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
          <button onClick={() => login()} className="px-4 py-2 w-full bg-green-300 text-black">Login</button>
          <button onClick={() => signUp()}className="px-4 py-2 w-full bg-purple-300 text-black">Sign Up</button>
        </div>
      </div>
    )
  }
}

export {LoginForm}