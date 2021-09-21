import { GetServerSideProps, NextPage } from 'next'
import { useContext, useEffect, useState } from 'react'
import { db } from '@app/lib/database'
import { useBaseReducer } from '@app/lib/base-reducer'
import { LoginForm } from '@app/components/LoginForm'
import { AppContext, useAppStore } from '@app/providers/App'
import NavBar from '@app/components/NavBar'
import { useAuth } from '@app/hooks/use-auth'

interface BallotPageProps {
  bid: string
}

interface ProposalTemplate {
  title: string
  description: string
  voteCountYes: number,
  voteCountNo: number
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const bid: string = (context.params?.bid ? context.params?.bid : '').toString()
  let exists = true
  await db.get('ballots').get(bid).get('proposals', (ack) => {
    if (ack.put) exists = true
    else exists = false
  })
  if (exists) {
    return {props: {bid: bid}}
  } else {
    // context.res.writeHead(302, { Location: '/' });
    // context.res.end();
    return {props: {bid: bid}}
  }
}


const Ballot: NextPage<BallotPageProps> = ({bid}) => {
  const { currentUser, setCurrentUser } = useAuth()

  const [ballotTitle, setBallotTitle] = useState('')
  const [proposals, proposalsReducer] = useBaseReducer<ProposalTemplate>('title', [])

  const handleAddProposal = (proposalToAdd :ProposalTemplate) => {
    proposalsReducer({ type: "ADD", payload: {data: [proposalToAdd]}})
  }

  const handleUpdateProposal = (proposalToAdd: ProposalTemplate) => {
    proposalsReducer({ type: "UPDATE", payload: {data: proposalToAdd}})
  }

  useEffect(() => {
    // setCurrentUser(currentUser.recall({sessionStorage: true}))

    const ballot = db.get('ballots').get(bid)
    ballot.get('title').once((title) => {
      setBallotTitle(title.toString())
    })
    ballot.get('proposals').map().on((aProposal, id) => {

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
      ballot.get('proposals').get(aProposal.title).get('votes').map().once((vote: any, key) => {
        let v
        if (vote.err) {
          vote.err && console.log(vote.err)
        } else if (!vote) {
          console.log(`${aProposal.title} no data`)
        } else {
          db.user(key).get('votes').get('ballots').get(bid).get(aProposal.title).get('vote').once(ans => {
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

  /**
   * Adds a vote to the user's votes colelction (note: this cannot be modified by other users)
   * Then adds the reference to the vote to the proposal collection
   * @param vote 
   * @param proposalTitle 
   */
  const handleVoteClick = (vote: 'yes' | 'no', proposalTitle: string) => {
    // @ts-ignore
    if (currentUser.is) {
      currentUser.get('votes').get('ballots').get(bid).get(proposalTitle).put({'vote': vote})
      // @ts-ignore
      db.get('ballots').get(bid).get('proposals').get(proposalTitle).get('votes').get(currentUser.is.pub).put({vote})
      
    } else {
      alert('Please Authenticate Yourself first')
    }
  }


  return (
    <main className="min-h-screen bg-black text-white">
      <NavBar />
      <div className="pt-20 m-0 p-8 flex flex-col lg:flex-row">
          { 
            // @ts-ignore
            !currentUser.is && (
              <div className="lg:w-[20%]">
                <LoginForm />
              </div>
            )
          }
          
        <div className="w-full xl:row-span-1 flex flex-col space-y-8 p-8">
          <p className="text-5xl">{ballotTitle}</p>
          <ul className="flex flex-col space-y-8 p-4 lg:p-8 ">
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
                  <div className="flex flex-row min-h-[16rem] space-x-4 justify-between border-white border-4 border-b-0 p-8">
                    <div>
                      <p className="text-2xl">{proposal.title}</p>
                      <p>{proposal.description}</p>
                    </div>
                    <div className="h-full min-w-[25%] flex flex-col space-y-4 justify-evenly lg:p-8">
                      <button onClick={() => handleVoteClick('yes', proposal.title)} className="text-lg md:text-2xl lg:text-4xl hover:scale-110">
                        ✅: {proposal.voteCountYes}
                      </button>
                      <button onClick={() => handleVoteClick('no', proposal.title)}  className="text-lg md:text-2xl lg:text-4xl hover:scale-110">
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
            })
          }
          </ul>
        </div>
      </div>
    </main>
  )
}

export default Ballot