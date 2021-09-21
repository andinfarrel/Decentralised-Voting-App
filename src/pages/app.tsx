import { useAuth } from '@app/hooks/use-auth';
import { useBaseReducer } from '@app/lib/base-reducer';
import { db, gunUser } from '@app/lib/database';
import clsx from 'clsx';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';

enum GroupView {
  ALL = 'all',
  YOURS = 'yours'
}


interface CommunityTemplate {
  id: string,
  name: string,
  members?: {},
  joinRequests?: {},
  ballots?: {}
}

const MainApp: NextPage<{}> = ({}) => {
  const { currentUser, signOut } = useAuth()
  const [groupView, setGroupView] = useState(GroupView.ALL)

  const [userOwnedCommunities, userOwnedCommunitiesReducer] = useBaseReducer<CommunityTemplate>('id',[])
  const [userOwnedCommunitiesLoaded, setUserOwnedCommunitiesLoaded] = useState(false)

  const [userAllCommunities, userAllCommunitiesReducer] = useBaseReducer<CommunityTemplate>('id', [])
  const [userAllCommunitiesLoaded, setUserAllCommunitiesLoaded] = useState(false)

  const [communityId, setCommunityId] = useState('')
  const [searchResults, setSearchResults] = useState<string[]>([])

  const findCommunityById = (id: string) => {
    db.get('communities').get(id).once((community) => {
      if (!community) {
        alert('not found')
        return
      } else {
        alert(community.name)
      }
    })
  }

  const findMyCommunityByName = (name: string) => {
    const res: string[] = []
    userOwnedCommunities.forEach(community => {
      if (levenshteinDistance(name, community.name) > 0.4) {
        res.push(community.name)
      }
    })
    // console.log(res)
    setSearchResults(res)
    alert(searchResults)
  }

  // https://stackoverflow.com/a/36566052
  const levenshteinDistance =  (stringOne: string, stringTwo: string) => {
    let longer;
    let shorter;
    if (stringOne.length < stringTwo.length) {
      longer = stringTwo
      shorter = stringOne
    } else {
      longer = stringOne
      shorter = stringTwo
    }

    const longerLen = longer.length
    if (longerLen === 0) return
    return (longerLen - editDistance(longer, shorter)) / parseFloat(longerLen.toString())
  }

  function editDistance(s1: string, s2: string) {
    s1 = s1.toLowerCase()
    s2 = s2.toLowerCase()
  
    var costs = new Array()
    for (var i = 0; i <= s1.length; i++) {
      var lastValue = i
      for (var j = 0; j <= s2.length; j++) {
        if (i == 0)
          costs[j] = j
        else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1
            costs[j - 1] = lastValue
            lastValue = newValue
          }
        }
      }
      if (i > 0)
        costs[s2.length] = lastValue
    }
    return costs[s2.length]
  }

  const fetchCommunities = () => {
    if (groupView === GroupView.ALL && userOwnedCommunitiesLoaded == false) {
      const user = gunUser.recall({sessionStorage: true})
      console.log('fetching all of the user\'s communities')
      const communities = user.get('joined communities')
      communities.map()
        .not(() => {
          console.log('no community data to serve..')
          return 
        })
        .on((c) => {
          if (c.id != '') {
            const data: CommunityTemplate = {
              id: c.id,
              name: c.name
            }
            handleAddCommunity(data)
          }
        })
      setUserAllCommunitiesLoaded(true) 
    } 
    
    if (groupView === GroupView.YOURS && userOwnedCommunitiesLoaded == false) {
      const user = gunUser.recall({sessionStorage: true})
      console.log('fetching user owned communities')
      const communities = user.get('communities')
      communities.map()
        .not(() => {
          console.log('no community data to serve..')
          return 
        })
        .on((c) => {
          if (c.id != '') {
            const data: CommunityTemplate = {
              id: c.id,
              name: c.name
            }
            handleAddCommunity(data)
          }
        })
      setUserOwnedCommunitiesLoaded(true) 
    }
  }

  const cleanUserOwnedCommunities = () => {
    userOwnedCommunities.map((c) => {
      userOwnedCommunitiesReducer({type: 'REMOVE', payload: {data : c}})
    })
  }

  const cleanUserAllCommunities = () => {
    userOwnedCommunities.map((c) => {
      userAllCommunitiesReducer({type: 'REMOVE', payload: {data : c}})
    })
  }
  
  const handleAddCommunity = (community: CommunityTemplate) => {
    if (groupView === GroupView.YOURS) {
      userOwnedCommunitiesReducer({ type: 'ADD', payload: {data: [community]}})
    } else if (groupView === GroupView.ALL) {
      userAllCommunitiesReducer({ type: 'ADD', payload: {data: [community]}})
    }
  }

  useEffect(() => {
    fetchCommunities()

    return () => { 
      // cleanUserOwnedCommunities() 
      // cleanUserAllCommunities()
    }
  }, [groupView])

  return (
      <div className="h-screen bg-gray-800 text-white">
        {
          // @ts-ignore
          currentUser && (
            <div className="h-full w-full ">
              <div className="w-full h-full flex flex-col">
                <div className="w-full flex flex-row p-8 pl-0 justify-between">
                  <div className=" lg:w-1/6 bg-gray-900 flex flex-col rounded-r-2xl">
                    <div className="w-full flex justify-between p-4 items-center">
                      <p>Hi, {currentUser.alias}</p>
                      <button onClick={() => signOut()} className="py-2 px-3 rounded-md text-sm text-white bg-red-500 bg-opacity-90 shadow-inner">Sign Out</button>
                    </div>
                  </div>
                  <button onClick={() => setGroupView(GroupView.ALL)} className={clsx("px-8",  groupView === 'all' && "border-b-2")}>
                    All
                  </button>
                  <button onClick={() => setGroupView(GroupView.YOURS)} className={clsx("px-8",  groupView === 'yours' && "border-b-2")}>
                    Yours
                  </button>
                  <button className="px-8 rounded-md my-2 bg-green-500 bg-opacity-90 shadow-inner">
                    Add
                  </button>
                  <button className="px-8 rounded-md my-2 bg-yellow-300 bg-opacity-90 text-black shadow-inner">
                    Join
                  </button>
                </div>
                <div className="w-full h-full ">
                  {
                    groupView === 'all' && (
                      <>
                        <div className="flex flex-row space-x-4 text-lg w-1/2 mx-auto mt-auto">
                          <input onChange={(e) => setCommunityId(e.target.value)} value={communityId} placeholder="Community Name" className="p-2 w-full bg-transparent border-white border-2 rounded-md"/>
                          <button className="px-4 text-black bg-yellow-300 bg-opacity-90 rounded-md" onClick={() => findMyCommunityByName(communityId)}>find</button>
                        </div>
                        <ul className="p-20 flex flex-col space-y-8">
                          {
                            userAllCommunities.length != 0 && userAllCommunities && userAllCommunities.map((community) => (
                              <li key={community.id} className="">
                                <p className="text-xl">{community.name}</p>
                                <p className="text-sm opacity-60 ">{community.id}</p>
                              </li>
                            ))
                          }
                          {
                            userAllCommunities.length == 0 && (
                              <li>No data to show...</li>
                            )
                          }
                        </ul>
                      </>
                    )
                  }
                  {
                    groupView === 'yours' && (
                    <>
                      <div className="flex flex-row space-x-4 text-lg w-1/2 mx-auto mt-auto">
                        <input onChange={(e) => setCommunityId(e.target.value)} value={communityId} placeholder="Community Name" className="p-2 w-full bg-transparent border-white border-2 rounded-md"/>
                        <button className="px-4 text-black bg-yellow-300 bg-opacity-90 rounded-md" onClick={() => findMyCommunityByName(communityId)}>find</button>
                      </div>
                      <ul className="p-20 flex flex-col space-y-8">
                          {
                            userOwnedCommunities.length != 0 && userOwnedCommunities && userOwnedCommunities.map((community) => (
                              <li key={community.id} className="">
                                <p className="text-xl">{community.name}</p>
                                <p className="text-sm opacity-60 ">{community.id}</p>
                              </li>
                            ))
                          }
                          {
                            userOwnedCommunities.length == 0 && (
                              <li>No data to show...</li>
                            )
                          }
                      </ul>
                    </>
                    )
                  }
                </div>
              </div>
            </div>
          )
        }
      </div>
  )
}

export default MainApp