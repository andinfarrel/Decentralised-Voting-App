import { AppContext, useAppStore } from '@app/providers/App'
import { NextComponentType } from 'next'
import { useContext } from 'react'

const NavBar:NextComponentType = () => {
  const { currentUser, currentUsername, setCurrentUsername } = useAppStore()

  // @ts-ignore
  if (currentUser.is) {
    return (
      <div className="w-full p-8 flex flex-row justify-between text-white">
        <p className="text-2xl">Hi, {currentUsername ? currentUsername : ''}</p>
        <button onClick={() => currentUser.leave() && setCurrentUsername ? setCurrentUsername('') : true} className="py-2 px-4 text-white bg-red-600 ">Sign Out</button>
      </div>
    )
  } else {
    return (
      <></>
    )
  }
}

export default NavBar