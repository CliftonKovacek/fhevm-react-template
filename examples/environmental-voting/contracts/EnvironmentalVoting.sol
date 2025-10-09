// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract EnvironmentalVoting is SepoliaConfig {

    address public admin;
    uint32 public currentProposalId;

    struct Proposal {
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool active;
        bool resultsRevealed;
        euint32 yesVotes;
        euint32 noVotes;
        uint32 totalVoters;
        address[] voters;
    }

    struct Vote {
        euint8 encryptedVote; // 1 for yes, 0 for no
        bool hasVoted;
        uint256 timestamp;
    }

    mapping(uint32 => Proposal) public proposals;
    mapping(uint32 => mapping(address => Vote)) public votes;

    event ProposalCreated(uint32 indexed proposalId, string title, uint256 startTime, uint256 endTime);
    event VoteSubmitted(address indexed voter, uint32 indexed proposalId);
    event ResultsRevealed(uint32 indexed proposalId, uint32 yesVotes, uint32 noVotes);
    event ProposalEnded(uint32 indexed proposalId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier proposalExists(uint32 _proposalId) {
        require(_proposalId > 0 && _proposalId <= currentProposalId, "Proposal does not exist");
        _;
    }

    modifier proposalActive(uint32 _proposalId) {
        require(proposals[_proposalId].active, "Proposal is not active");
        require(block.timestamp >= proposals[_proposalId].startTime, "Voting has not started");
        require(block.timestamp <= proposals[_proposalId].endTime, "Voting has ended");
        _;
    }

    modifier proposalEnded(uint32 _proposalId) {
        require(block.timestamp > proposals[_proposalId].endTime, "Voting is still active");
        _;
    }

    constructor() {
        admin = msg.sender;
        currentProposalId = 0;
    }

    function createProposal(
        string memory _title,
        string memory _description,
        uint256 _votingDuration
    ) external onlyAdmin {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_votingDuration > 0, "Voting duration must be positive");

        currentProposalId++;

        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + _votingDuration;

        // Initialize encrypted vote counters
        euint32 initialYesVotes = FHE.asEuint32(0);
        euint32 initialNoVotes = FHE.asEuint32(0);

        proposals[currentProposalId] = Proposal({
            title: _title,
            description: _description,
            startTime: startTime,
            endTime: endTime,
            active: true,
            resultsRevealed: false,
            yesVotes: initialYesVotes,
            noVotes: initialNoVotes,
            totalVoters: 0,
            voters: new address[](0)
        });

        // Grant access permissions for encrypted counters
        FHE.allowThis(initialYesVotes);
        FHE.allowThis(initialNoVotes);

        emit ProposalCreated(currentProposalId, _title, startTime, endTime);
    }

    function submitVote(uint32 _proposalId, uint8 _vote) external
        proposalExists(_proposalId)
        proposalActive(_proposalId)
    {
        require(_vote == 0 || _vote == 1, "Vote must be 0 (no) or 1 (yes)");
        require(!votes[_proposalId][msg.sender].hasVoted, "Already voted on this proposal");

        // Encrypt the vote
        euint8 encryptedVote = FHE.asEuint8(_vote);

        votes[_proposalId][msg.sender] = Vote({
            encryptedVote: encryptedVote,
            hasVoted: true,
            timestamp: block.timestamp
        });

        proposals[_proposalId].voters.push(msg.sender);
        proposals[_proposalId].totalVoters++;

        // Update vote counters using FHE operations
        if (_vote == 1) {
            proposals[_proposalId].yesVotes = FHE.add(proposals[_proposalId].yesVotes, FHE.asEuint32(1));
        } else {
            proposals[_proposalId].noVotes = FHE.add(proposals[_proposalId].noVotes, FHE.asEuint32(1));
        }

        // Grant access permissions
        FHE.allowThis(encryptedVote);
        FHE.allow(encryptedVote, msg.sender);
        FHE.allowThis(proposals[_proposalId].yesVotes);
        FHE.allowThis(proposals[_proposalId].noVotes);

        emit VoteSubmitted(msg.sender, _proposalId);
    }

    function revealResults(uint32 _proposalId) external
        proposalExists(_proposalId)
        proposalEnded(_proposalId)
        onlyAdmin
    {
        require(!proposals[_proposalId].resultsRevealed, "Results already revealed");

        Proposal storage proposal = proposals[_proposalId];

        // Prepare encrypted values for decryption
        bytes32[] memory cts = new bytes32[](2);
        cts[0] = FHE.toBytes32(proposal.yesVotes);
        cts[1] = FHE.toBytes32(proposal.noVotes);

        // Request decryption
        FHE.requestDecryption(cts, this.processResults.selector);
    }

    function processResults(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify signatures
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        // Decode the cleartexts back into uint32 values [yesVotes, noVotes]
        (uint32 yesVotes, uint32 noVotes) = abi.decode(cleartexts, (uint32, uint32));

        // Find the proposal that matches this decryption
        uint32 proposalId = currentProposalId; // Simplified - in production, store mapping of requestId to proposalId

        proposals[proposalId].resultsRevealed = true;
        proposals[proposalId].active = false;

        emit ResultsRevealed(proposalId, yesVotes, noVotes);
        emit ProposalEnded(proposalId);
    }

    function getProposalInfo(uint32 _proposalId) external view
        proposalExists(_proposalId)
        returns (
            string memory title,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            bool active,
            bool resultsRevealed,
            uint32 totalVoters
        )
    {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.title,
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.active,
            proposal.resultsRevealed,
            proposal.totalVoters
        );
    }

    function hasUserVoted(uint32 _proposalId, address _user) external view
        proposalExists(_proposalId)
        returns (bool)
    {
        return votes[_proposalId][_user].hasVoted;
    }

    function getVoteTimestamp(uint32 _proposalId, address _user) external view
        proposalExists(_proposalId)
        returns (uint256)
    {
        require(votes[_proposalId][_user].hasVoted, "User has not voted");
        return votes[_proposalId][_user].timestamp;
    }

    function isVotingActive(uint32 _proposalId) external view
        proposalExists(_proposalId)
        returns (bool)
    {
        Proposal storage proposal = proposals[_proposalId];
        return proposal.active &&
               block.timestamp >= proposal.startTime &&
               block.timestamp <= proposal.endTime;
    }

    function getActiveProposals() external view returns (uint32[] memory) {
        uint32[] memory activeProposals = new uint32[](currentProposalId);
        uint32 count = 0;

        for (uint32 i = 1; i <= currentProposalId; i++) {
            if (proposals[i].active &&
                block.timestamp >= proposals[i].startTime &&
                block.timestamp <= proposals[i].endTime) {
                activeProposals[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        uint32[] memory result = new uint32[](count);
        for (uint32 j = 0; j < count; j++) {
            result[j] = activeProposals[j];
        }

        return result;
    }

    function endProposal(uint32 _proposalId) external
        proposalExists(_proposalId)
        onlyAdmin
    {
        require(proposals[_proposalId].active, "Proposal already ended");
        proposals[_proposalId].active = false;
        emit ProposalEnded(_proposalId);
    }

    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "New admin cannot be zero address");
        admin = _newAdmin;
    }
}