import { useState } from 'react'
import type { NextPage } from 'next'
import slugify from 'slugify'
import { useRouter } from 'next/router'
import { db } from '../lib/database'

interface ProposalsObject {
  [title: string]: ProposalTemplate
}
interface ProposalTemplate {
  title: string
  description: string,
}

const Home: NextPage = () => {
  const router = useRouter()
  const [ballotTitle, setBallotTitle] = useState('')
  const [proposals, setProposals] = useState<ProposalsObject>({})
  const [dispProposals, setDispProposals] = useState<any[]>([])
  const [proposalTitle, setProposalTitle] = useState('')
  const [proposalDescription, setProposalDescription] = useState('')

  const addProposal = (title:string, description: string) => {
    if (title.length < 4 || title.length > 100) { 
      alert('title must be between 4 and 100 characters long') 
      return
    }
    if (description.length < 4 || description.length > 100) { 
      alert('description must be between 4 and 100 characters long')
      return
    }
    const tmp = proposals
    tmp[title] = {
      title: title,
      description: description
    }
    setProposals(tmp)
    setDispProposals(Object.entries(tmp))
  }

  const removeProposal = (title:string) => {
    const tmp = proposals
    delete tmp[title]
    setProposals(tmp)
    setDispProposals(Object.entries(tmp))
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    const today = new Date()
    if (ballotTitle.length < 4) {
      alert('Ballot title too short!')
      return
    }
    if (dispProposals.length < 1) {
      alert('Please have at least one proposal')
      return
    } 
    const ballotId = slugify(today.valueOf() +'-'+ ballotTitle)
    // console.log(proposals)
    const ballot = db.get(ballotId).put(proposals)
    db.get('ballots').set(ballot)
    router.push('/ballot/'+ballotId)
  }

  return (
    <div className="bg-black text-white">
      <div className="min-h-screen grid auto-rows-auto gap-8 grid-flow-row p-16 md:p-40 lg:w-2/3 lg:mx-auto center items-center align-middle">
        <div className="flex flex-row space-x-4 md:space-x-8">
          <label>Ballot Title</label>
          <input onChange={e => setBallotTitle(e.target.value)} className="text-black p-1 w-4/5 border-b-2" type="text"/>
        </div>
        <div className="grid auto-rows-fr grid-cols-4 gap-4 border-2 p-8">
          <label className="col-span-1">Proposal: </label>
          <input className="col-span-3 border-b-2 text-black p-1" type="text" value={proposalTitle} onChange={e => setProposalTitle(e.target.value)}/>
          <label className="col-span-1">Description: </label>
          <input className="col-span-3 border-b-2 text-black p-1" type="text" value={proposalDescription} onChange={e => setProposalDescription(e.target.value)}/>
          <button className="bg-green-400 py-2 px-4 col-span-4" onClick={() => addProposal(proposalTitle, proposalDescription)}>Add</button>
        </div>
        <ul className="flex flex-col space-y-8 m-8">
          {
            dispProposals.map((proposal, index) => (
              <li key={proposal[0]} className="flex flex-row justify-between">
                <div>
                  <p className="text-2xl">{index+1} {proposal[1].title}</p>
                  <p>{proposal[1].description}</p>
                </div>
                <button onClick={() => removeProposal(proposal[1].title)} className="bg-red-700 px-4">Delete</button>
              </li>
            ))
          }
        </ul>
        <button className="bg-yellow-300 py-2 px-4 text-black" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  )
}

export default Home
