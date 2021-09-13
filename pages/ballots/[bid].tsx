import { GetServerSideProps, NextPage } from 'next'
import { useContext, useEffect, useState } from 'react'
import { db, UserContext } from '../../lib/database'
import { useBaseReducer } from '../../lib/base-reducer'

interface BallotPageProps {
  bid: string
}

interface ProposalTemplate {
  title: string
  description: string
  voteCountYes: number,
  voteCountNo: number
}

const Ballot: NextPage<BallotPageProps> = ({bid}) => {
  const { user, username, setUsername } = useContext(UserContext)

  const [usernameForm, setusernameForm] = useState('')
  const [passwordForm, setpasswordForm] = useState('')

  const [proposals, proposalsReducer] = useBaseReducer<ProposalTemplate>('title', [])

  const handleAddProposal = (proposalToAdd :ProposalTemplate) => {
    proposalsReducer({ type: "ADD", payload: {data: [proposalToAdd]}})
  }

  const handleUpdateProposal = (proposalToAdd: ProposalTemplate) => {
    proposalsReducer({ type: "UPDATE", payload: {data: proposalToAdd}})
  }

  useEffect(() => {
    const ballot = db.get('ballots').get(bid)

    ballot.map().on((aProposal, id) => {

      let yesCount = 0
      let noCount = 0
      // a vote in the votes collection is a reference to the vote of the person who made it
      // i.e., a user makes a vote, and save it in their own collection, then save that reference to the proposal collection
      const tmp = {
        title: aProposal?.title,
        description: aProposal?.description,
        voteCountYes: yesCount,
        voteCountNo: noCount
      }

      handleAddProposal(tmp)
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
              tmp.voteCountYes = yesCount
              handleUpdateProposal(tmp)
            }
            if (v === 'no') {
              noCount += 1
              tmp.voteCountNo = noCount
              handleUpdateProposal(tmp)
            }
          })
        }
      })

    })

    return () => {}
  }, [])


  const login =  () => {
      (user.auth(usernameForm, passwordForm, async (ack: any) => {
      if (ack.err) {
        ack.err && alert(ack.err)
      } else {
        console.log('successful login!')
      }
    }))
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
    user.create(usernameForm, passwordForm, ({ err }: any) => {
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
    // @ts-ignore
    if (user.is) {
      user.get('votes').get('ballots').get(bid).get(proposalTitle).put({'vote': vote})
      // @ts-ignore
      db.get('ballots').get(bid).get(proposalTitle).get('votes').get(user.is.pub).put({vote})
      
    } else {
      alert('Please Authenticate Yourself first')
    }
  }


  return (
      <div className="min-h-screen bg-black text-white m-0 p-8 grid grid-rows-1 grid-cols-6">
        {
        // @ts-ignore
        !user.is && (
        <div className="col-span-2 flex flex-col space-y-8 p-8">
          <div className="flex flex-col space-y-4">
            <label>username</label>
            <input onChange={e => setusernameForm(e.target.value)} type="text" className="bg-black border-white border-2 rounded-md p-2"/>
          </div>
          <div className="flex flex-col space-y-4">
            <label>password</label>
            <input onChange={e => setpasswordForm(e.target.value)} type="password" className="bg-black border-white border-2 rounded-md p-2"/>
          </div>
          <div className="flex flex-row justify-evenly space-x-4">
            <button onClick={() => login()} className="px-4 py-2 w-full bg-green-300 text-black">Login</button>
            <button onClick={() => signUp()}className="px-4 py-2 w-full bg-purple-300 text-black">Sign Up</button>
          </div>
          <button className="px-4 py-2 w-full bg-yellow-300 text-black">Submit</button>
        </div>    
        )}
        {
        // @ts-ignore
        user.is && (
        <div className="col-span-2 flex flex-col space-y-8 p-8">
          <p>Hi <i className="text-2xl">{username ? username: ' no username '}</i></p>
          <button onClick={() => user.leave() && setUsername ? setUsername('') : true} className="p-2 bg-red-600">Sign Out</button>
        </div>    
        )}
        <ul className="col-span-4 flex flex-col space-y-8 p-8">
        {
            proposals.map((proposal, index) => {
              let yesWidth = 50
              let noWidth = 50

              const yes = proposal.voteCountYes
              const no = proposal.voteCountNo
              if (!(yes == 0 && no == 0)) {
                const totalVotes = yes + no
                const yesPercentage = Math.round(proposal.voteCountYes / totalVotes * 100)
                const noPercentage = Math.round(proposal.voteCountNo / totalVotes * 100)
                yesWidth = isFinite(yesPercentage) ? yesPercentage : 50
                noWidth = isFinite(noPercentage) ? noPercentage : 50
              }
              return (
                <li key={proposal.title}>
                  <div className="flex flex-row h-40 justify-between border-white border-4 border-b-0 p-8">
                    <div>
                      <p className="text-2xl">{proposal.title}</p>
                      <p>{proposal.description}</p>
                    </div>
                    <div className="h-full flex flex-col space-y-4 justify-evenly p-8">
                      <button onClick={() => handleVoteClick('yes', proposal.title)} className="text-4xl hover:scale-110">
                        ✅: {proposal.voteCountYes}
                      </button>
                      <button onClick={() => handleVoteClick('no', proposal.title)}  className="text-4xl hover:scale-110">
                        ❌: {proposal.voteCountNo}
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
  let exists = true
  await db.get('ballots').get(bid, (ack) => {
    if (ack.put) exists = true
    else exists = false
  })
  if (exists) {
    return {props: {bid: bid}}
  } else {
    context.res.writeHead(302, { Location: '/' });
    context.res.end();
    return {props:{}}
  }
}

export default Ballot