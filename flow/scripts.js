import * as fcl from "@onflow/fcl/dist/fcl-react-native";

const GET_ALL_POLLS = `
import Consesia from 0xConsesia
pub fun main(): {UInt64: Consesia.Poll} {
  return Consesia.polls
}`;

export async function getAllPolls() {
  return fcl.query({
    cadence: GET_ALL_POLLS,
  });
}

const GET_ACTIVE_POLLS = `
import Consesia from 0xConsesia
pub fun main(): {UInt64: Consesia.Poll} {
  return Consesia.getActivePolls()
}`;

export async function getActivePolls() {
  return fcl.query({
    cadence: GET_ACTIVE_POLLS,
  });
}

const GET_DETAIL_POLL = `
import Consesia from 0xConsesia
pub fun main(pollId: UInt64): Consesia.Poll {
  let polls = Consesia.polls
  return polls[pollId] ?? panic("Poll not found")
}`;

export async function getDetailPoll(pollId) {
  return fcl.query({
    cadence: GET_DETAIL_POLL,
    args: (arg, t) => [arg(pollId, t.UInt64)],
  });
}

const GET_POLL_RESULT = `
import Consesia from 0xConsesia
pub fun main(pollId: UInt64): {String: UInt64} {
  return Consesia.getPollResult(pollId: pollId)
}`;

export async function getPollResult(pollId) {
  return fcl.query({
    cadence: GET_POLL_RESULT,
    args: (arg, t) => [arg(pollId, t.UInt64)],
  });
}
