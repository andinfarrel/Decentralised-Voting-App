import { useAuth } from '@app/hooks/use-auth'
import clsx from 'clsx'
import {  Dispatch, FC, SetStateAction, useCallback, useState } from 'react'

export enum View {
  ALL = 'all',
  YOURS = 'yours'
}

interface NavBarProps {
  view: View
  onViewChange: Dispatch<SetStateAction<View>>
}


const NavBar:FC<NavBarProps> = ({
  view,
  onViewChange
}) => {
  const { currentUser, signOut } = useAuth()

  const handleViewChange = useCallback((v: View) => {
    onViewChange(v)
  },[onViewChange])

  // @ts-ignore
  if (currentUser) {
    return (
      <>
        <div className="hidden lg:visible w-full lg:flex flex-row p-8 pl-0 justify-between">
          <div className=" lg:w-1/6 bg-gray-900 flex flex-col rounded-r-2xl">
            <div className="w-full flex justify-between p-4 items-center">
              <p>Hi, {currentUser.alias}</p>
              <button onClick={() => signOut()} className="py-2 px-3 rounded-md text-sm text-white bg-red-500 bg-opacity-90 shadow-inner">Sign Out</button>
            </div>
          </div>
          <button onClick={() => handleViewChange(View.ALL)} className={clsx("px-8",  view === 'all' && "border-b-2")}>
            All
          </button>
          <button onClick={() => handleViewChange(View.YOURS)} className={clsx("px-8",  view === 'yours' && "border-b-2")}>
            Yours
          </button>
          <button className="px-8 rounded-md my-2 bg-green-500 bg-opacity-90 shadow-inner">
            Add
          </button>
          <button className="px-8 rounded-md my-2 bg-yellow-300 bg-opacity-90 text-black shadow-inner">
            Join
          </button>
        </div>
        <div className="lg:hidden">
          <HamburgerMenu />
        </div>
      </>
    )
  } else {
    return (
      <></>
    )
  }
}

const HamburgerMenu: FC = () => {
  const [navMobileOpen, setBavMobileOpen] = useState(false)

    return (
      <div className={clsx("absolute h-full bg-gray-700 w-0 transition-width duration-500 ease-in-out", navMobileOpen && "w-[80%]")}>
        <div className="p-2">
          {!navMobileOpen && (
            <button className="bg-gray-700 p-4 rounded-lg" onClick={() => setBavMobileOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
              </svg>
            </button>
          )}
          {navMobileOpen && (
            <button className="bg-gray-800 p-4 rounded-lg" onClick={() => setBavMobileOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                <path d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z"/>
              </svg>
            </button>
          )}
        </div>

      </div>
    )
}

export default NavBar