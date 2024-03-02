pub contract Mevota {
    pub var polls: {UInt64: Poll}
    pub var pollCounter: UInt64

    pub struct Poll {
        pub var id: UInt64
        pub var createdBy: Address
        pub var title: String
        pub var options: [String]
        pub var color: String
        pub var startedAt: UFix64
        pub var endedAt: UFix64
        pub var isRestricted: Bool
        pub var allowedVoters: {Address: Bool}
        pub var votes: {Address: String}

        init(id: UInt64, createdBy: Address, title: String, options: [String], color: String, startedAt: UFix64, endedAt: UFix64, isRestricted: Bool) {
            self.id = id
            self.createdBy = createdBy
            self.title = title
            self.options = options
            self.color = color
            self.startedAt = startedAt
            self.endedAt = endedAt
            self.isRestricted = isRestricted
            self.allowedVoters = {}
            self.votes = {}
        }

        pub fun setVote(option: String, voter: Address)  {
            self.votes[voter] = option
        }

        pub fun setAllowedVoters(voter: Address)  {
            self.allowedVoters[voter] = true
        }

        pub fun removeAllowedVoters(voter: Address)  {
            self.allowedVoters.remove(key: voter)
        }
    }

    pub fun addAllowedVoters(pollId: UInt64, voter: Address)  {
        let poll = self.polls[pollId] ?? panic("Poll not found")
        if !poll.isRestricted {
            panic("This vote is not resticted")
        }

        poll.setAllowedVoters(voter: voter)
        self.polls[poll.id] = poll
    }

    pub fun removeAllowedVoters(pollId: UInt64, voter: Address)  {
        let poll = self.polls[pollId] ?? panic("Poll not found")
        if !poll.isRestricted {
            panic("This vote is not resticted")
        }

        poll.removeAllowedVoters(voter: voter)
        self.polls[poll.id] = poll
    }

    pub fun getAllowedVoters(pollId: UInt64): {Address: Bool} {
        let poll = self.polls[pollId] ?? panic("Poll not found")
        return poll.allowedVoters
    }

    pub fun vote(pollId: UInt64, option: String, voter: Address)  {
        let poll = self.polls[pollId] ?? panic("Poll not found")

        // Check if the poll is active
        if !self.isPollActive(pollId: pollId) {
            panic("Voting is not currently allowed for this poll")
        }

        // Check if the voter has already voted
        if poll.votes.containsKey(voter) {
            panic("You have already voted in this poll")
        }

        if poll.isRestricted && poll.allowedVoters[voter] == nil {
            panic("You're not allowed to vote")
        } else {
            poll.setVote(option: option, voter: voter)
            self.polls[poll.id] = poll
        }
    }

    pub fun createPoll(createdBy: Address, title: String, options: [String], color: String, startedAt: UFix64, endedAt: UFix64, isRestricted: Bool) {
        let newId = self.pollCounter + 1

        let poll = Poll(
            id: newId,
            createdBy: createdBy,
            title: title,
            options: options,
            color: color,
            startedAt: startedAt,
            endedAt: endedAt,
            isRestricted: isRestricted,
        )

        self.polls[newId] = poll
        self.pollCounter = newId
    }

    pub fun isPollActive(pollId: UInt64): Bool {
        let poll = self.polls[pollId] ?? panic("Poll not found")
        let currentTime = getCurrentBlock().timestamp
        return poll.startedAt <= getCurrentBlock().timestamp && poll.endedAt >= getCurrentBlock().timestamp
    }

    pub fun getAllPolls(): {UInt64: Poll} {
        return self.polls
    }

    pub fun getActivePolls(): {UInt64: Poll} {
        let activePolls: {UInt64: Poll} = {}

        // Iterate through all polls and filter out the active ones
        for poll in self.polls.values {
            if self.isPollActive(pollId: poll.id) {
                activePolls[poll.id] = poll
            }
        }

        return activePolls
    }

    pub fun getPollResult(pollId: UInt64): {String: UInt64} {
        let poll = self.polls[pollId] ?? panic("Poll not found")
        var resultVote: {String: UInt64} = {}

        // Iterate through the votes and count the results
        for vote in poll.votes.values {
            if resultVote[vote] == nil {
                resultVote[vote] = 1
            } else {
                resultVote[vote] = resultVote[vote]! + 1
            }
        }

        return resultVote
    }

    init() {
        self.polls = {}
        self.pollCounter = 0
    }
}