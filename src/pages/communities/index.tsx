import { GetServerSideProps, NextPage } from 'next'
import { useContext, useEffect, useState } from 'react'
import { LoginForm } from '@app/components/LoginForm'
import { useBaseReducer } from '@app/lib/base-reducer'
import { db } from '@app/lib/database'
import { v4 as uuidv4 } from 'uuid'
import { AppContext } from '@app/providers/App'
import NavBar from '@app/components/NavBar'

interface PrivateBallotPageProps {

}

interface CommunityTemplate {
  id: string,
  name: string,
  members?: {},
  joinRequests?: {},
  ballots?: {}
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {props: {}}
}


const PrivateBallot: NextPage<PrivateBallotPageProps> = ({}) => {
  const { currentUser } = useContext(AppContext)
  const [communityName, setCommunityName] = useState('')
  const [communityId, setCommunityId] = useState('')
  const [userCommunitiesLoaded, setUserCommunitiesLoaded] = useState(false)
  const [userCommunities, userCommunitiesReducer] = useBaseReducer<CommunityTemplate>('id',[])

  const findCommunity = (id: string) => {
    db.get('communities').get(id).once((community) => {
      if (!community) {
        alert('not found')
        return
      } else {
        alert(community.name)
      }
    })
  }

  const createCommunity = (name: string) => {
    if (name.length < 8) {
      alert('name is too short!')
      return
    }

    const uuid = uuidv4()

    const community = { 
      id: uuid,
      name: name,
      members: {},
      joinRequests: {},
      ballots: {}
    }

    const newCommunityRef = currentUser.get('communities').get(uuid).put(community)
    db.get('communities').get(uuid).put(newCommunityRef).once((c) => console.log(c))
  }

  const handleAddCommunity = (community: CommunityTemplate) => {
    userCommunitiesReducer({ type: 'ADD', payload: {data: [community]}})
  }

  useEffect(() => {
    
    currentUser.get('communities').map().once((c) => {
      if (c.id != '') {
        console.log(c.id)
        const data: CommunityTemplate = {
          id: c.id,
          name: c.name
        }
        handleAddCommunity(data)
        console.log(userCommunities)
        setUserCommunitiesLoaded(true)
      }
    })

    return () => {}
  }, [])

  return (
    <main className="min-h-screen  bg-black text-white flex flex-col">
      <NavBar />
      <LoginForm />
    

      {
        // @ts-ignore
        currentUser.is && (
          <div className="h-full text-center flex flex-col my-auto">
            <div className="flex flex-row space-x-4 text-2xl w-1/2 mx-auto mt-auto">
              <input onChange={(e) => setCommunityId(e.target.value)} value={communityId} placeholder="Community ID" className="p-4 w-full bg-transparent border-white border-4"/>
              <button className="p-4 w-[20%] bg-yellow-300 text-black" onClick={() => findCommunity(communityId)}>find</button>
            </div>
            <p className="text-2xl my-10"> -- // -- </p>
            <div className="flex flex-row w-1/2 text-2xl mx-auto space-x-4 mb-auto">
              <input onChange={(e) => setCommunityName(e.target.value)} placeholder="Community Name" className="p-4 w-full bg-transparent border-white border-4"/>
              <button className="p-4 w-[20%] bg-green-300 text-black" onClick={() => createCommunity(communityName)}>create</button>
            </div>
            <div className="my-10 p-8">
              <p className="text-4xl p-8">Your Communities</p>
              <ul className="flex flex-col items-center text-left">
                {userCommunitiesLoaded && userCommunities && userCommunities.map((community) => (
                  <li key={communityId} className="border-white border-2 p-8 ">
                    <p>{community.id}</p>
                    <p>{community.name}</p>
                  </li>
                ))}
              </ul>
            </div>

           
          </div>
        )
      }
    </main>
    
  )
}

export default PrivateBallot