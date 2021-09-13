import { GetServerSideProps, NextPage } from "next"
import clsx from 'clsx'
import { useRouter } from "next/router"
import { Context, useEffect, useReducer, useState } from "react"
import { db, user, SEA } from '../../lib/database'

interface BallotPageProps {
  bid: string
}

interface ProposalsObject {
  [title: string]: ProposalTemplate
}

interface UserVote {
  [title: string]: {
    vote: 'yes' | 'no' | 'undecided'
  }
}

interface ProposalTemplate {
  title: string
  description: string
  voteCountYes: number,
  voteCountNo: number
}

const Ballot: NextPage<BallotPageProps> = ({bid}) => {
  
  const ballot = db.get('ballots').get(bid)
  const [proposals, setProposals] = useState<ProposalsObject>({})
  const [dispProposals, setDispProposals] = useState<any[]>([])
  const [loggedIn, setLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [pbk, setPbk] = useState('')


  useEffect(() => {
    // @ts-ignore
    db.on('auth', async (event: Event) => {
      const alias = await user.get('alias')
      setUsername(alias.toString())
    })

    ballot.map().on((aProposal, id) => {
      const tmp = proposals

      let yesCount = 0
      let noCount = 0
      // a vote in the votes collection is a reference to the vote of the person who made it
      // i.e., a user makes a vote, and save it in their own collection, then save that reference to the proposal collection
      tmp[aProposal?.title] = {
        title: aProposal?.title,
        description: aProposal?.description,
        voteCountYes: yesCount,
        voteCountNo: noCount
      }  
      setDispProposals(Object.entries(tmp))
      
      ballot.get(aProposal?.title).get('votes').map().once((vote: any, key) => {
        let v
        if (vote.err) {
          vote.err && console.log(vote.err)
        } else if (!vote) {
          console.log(`${aProposal.title} no data`)
        } else {
          db.user(key).get('votes').get('ballots').get(bid).get(aProposal?.title).get('vote').once(ans => {
            v = ans?.toString()

            if (v === 'yes') {
              yesCount += 1
              tmp[aProposal?.title].voteCountYes = yesCount
            }
            if (v === 'no') {
              noCount += 1
              tmp[aProposal?.title].voteCountNo = noCount
            }
            console.log(`yes: ${yesCount}`)
            console.log(`no: ${noCount}`)
            setDispProposals(Object.entries(tmp))
          })
        }
      })
    })

    return () => {}
  }, [])


  const login =  () => {
      (user.auth(username, password, async (ack: any) => {
      if (ack.err) {
        ack.err && alert(ack.err)
      } else {
        setPbk(ack.soul.substring(1,(ack.soul).length))
        setLoggedIn(true)
      }
    }))
  }

  const signUp = () => {
    if (username.length < 4) {
      alert('Username too short! minimun 4 char')
      return
    }
    if (password.length < 8) {
      alert('Password too short! minimum 8 char')
      return
    }
    user.create(username, password, ({ err }: any) => {
      if (err) {
        alert(err);
      } else {
        login();
      }
    });
  }

  /**
   * Adds a vote to the user's votes colelction (note: this cannot be modified by other users)
   * Then adds the reference to the vote to the proposal collection
   * @param vote 
   * @param proposalTitle 
   */
  const handleVoteClick = (vote: 'yes' | 'no', proposalTitle: string) => {
    if (loggedIn) {
      user.get('votes').get('ballots').get(bid).get(proposalTitle).put({'vote': vote})
      ballot.get(proposalTitle).get('votes').get(pbk).put({vote})
      
    } else {
      alert('Please Authenticate Yourself first')
    }
  }


  return (
      <div className="min-h-screen bg-black text-white m-0 p-8 grid grid-rows-1 grid-cols-6">
        {!loggedIn && (
        <div className="col-span-2 flex flex-col space-y-8 p-8">
          <div className="flex flex-col space-y-4">
            <label>Username</label>
            <input onChange={e => setUsername(e.target.value)} type="text" className="bg-black border-white border-2 rounded-md p-2"/>
          </div>
          <div className="flex flex-col space-y-4">
            <label>Password</label>
            <input onChange={e => setPassword(e.target.value)} type="password" className="bg-black border-white border-2 rounded-md p-2"/>
          </div>
          <div className="flex flex-row justify-evenly space-x-4">
            <button onClick={() => login()} className="px-4 py-2 w-full bg-green-300 text-black">Login</button>
            <button onClick={() => signUp()}className="px-4 py-2 w-full bg-purple-300 text-black">Sign Up</button>
          </div>
          <button className="px-4 py-2 w-full bg-yellow-300 text-black">Submit</button>
        </div>    
        )}
        {loggedIn && (
        <div className="col-span-2 flex flex-col space-y-8 p-8">
          <p>Hi <i className="text-2xl">{username}</i></p>
          <button onClick={() => user.leave() && setLoggedIn(false)} className="p-2 bg-red-600">Sign Out</button>
        </div>    
        )}
        <ul className="col-span-4 flex flex-col space-y-8 p-8">
        {
            dispProposals.map((proposal, index) => {
              let yesWidth = 50
              let noWidth = 50

              const yes = proposal[1].voteCountYes
              const no = proposal[1].voteCountNo
              if (!(yes == 0 && no == 0)) {
                const totalVotes = yes + no
                const yesPercentage = Math.round(proposal[1].voteCountYes / totalVotes * 100)
                const noPercentage = Math.round(proposal[1].voteCountNo / totalVotes * 100)
                yesWidth = isFinite(yesPercentage) ? yesPercentage : 50
                noWidth = isFinite(noPercentage) ? noPercentage : 50
              }
              return (
                <li key={proposal[0]}>
                  <div className="flex flex-row h-40 justify-between border-white border-4 border-b-0 p-8">
                    <div>
                      <p className="text-2xl">{proposal[1].title}</p>
                      <p>{proposal[1].description}</p>
                    </div>
                    <div className="h-full flex flex-col space-y-4 justify-evenly p-8">
                      <button onClick={() => handleVoteClick('yes', proposal[0])} className="text-4xl hover:scale-110">
                        ✅
                      </button>
                      <button onClick={() => handleVoteClick('no', proposal[0])}  className="text-4xl hover:scale-110">
                        ❌
                      </button>
                    </div>
                  </div>
                  <div className="h-8 flex flex-row border-white border-4 border-t-0">
                    <div className="h-full bg-blue-400" style={{width: `${yesWidth}%`}}></div>
                    <div className="h-full bg-red-400" style={{width: `${noWidth}%`}}></div>
                  </div>
                </li>
              )
            }
          )
        }
        </ul>
      </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const bid: string  = (context.params?.bid ? context.params?.bid : '').toString()

  if (bid) {
      return {
          props: {
              valid: true,
              bid:bid
          }
      }
  } 
  return {
      props: {
          valid: false
      }
  }
}

export default Ballot