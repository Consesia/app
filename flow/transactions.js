import * as fcl from "@onflow/fcl/dist/fcl-react-native";

const CREATE_NEW_POLL = `
import Consesia from 0xConsesia
transaction (title: String, options: [String], color: String, startedAt: UFix64, endedAt: UFix64, isRestricted: Bool) {
	let createdBy: Address
	prepare(acct: AuthAccount) {
		self.createdBy = acct.address
	}
	execute {
		Consesia.createPoll(createdBy: self.createdBy, title: title, options: options, color: color, startedAt: startedAt, endedAt: endedAt, isRestricted: isRestricted)
	}
}`;

export async function createNewPoll(title, options, color, startedAt, endedAt, isRestricted) {
  return fcl.mutate({
    cadence: CREATE_NEW_POLL,
    args: (arg, t) => [
      arg(title, t.String),
      arg(options, t.Array(t.String)),
      arg(color, t.String),
      arg(startedAt, t.UFix64),
      arg(endedAt, t.UFix64),
      arg(isRestricted, t.Bool),
    ],
    payer: fcl.authz,
    proposer: fcl.authz,
    authorizations: [fcl.authz],
    limit: 1000,
  });
}

const VOTE_POLL = `
import Consesia from 0xConsesia
transaction (pollId: UInt64, option: String) {
	let voter: Address
	prepare(acct: AuthAccount) {
		self.voter = acct.address
	}
	execute {
		Consesia.vote(pollId: pollId, option: option, voter: self.voter)
	}
}`;

export async function votePoll(pollId, option) {
  return fcl.mutate({
    cadence: VOTE_POLL,
    args: (arg, t) => [
      arg(pollId, t.UInt64),
      arg(option, t.String),
    ],
    payer: fcl.authz,
    proposer: fcl.authz,
    authorizations: [fcl.authz],
    limit: 1000,
  });
}

const ADD_ALLOWED_VOTERS = `
import Consesia from 0xConsesia
transaction (pollId: UInt64, voter: Address) {
  let voter: Address
	prepare(acct: AuthAccount) {
		self.voter = acct.address
	}
	execute {
		let poll = Consesia.polls[pollId] ?? panic("Poll not found")
    
    if poll.createdBy != self.voter {
      panic("Only creator can add allowed voters")
    }

    Consesia.addAllowedVoters(pollId: pollId, voter: voter)
	}
}`;

export async function addVoter(pollId, voter) {
  return fcl.mutate({
    cadence: ADD_ALLOWED_VOTERS,
    args: (arg, t) => [
      arg(pollId, t.UInt64),
      arg(voter, t.Address),
    ],
    payer: fcl.authz,
    proposer: fcl.authz,
    authorizations: [fcl.authz],
    limit: 1000,
  });
}
