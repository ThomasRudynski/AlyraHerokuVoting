// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

//Smart Contract Voting
contract Voting is Ownable{

    //Structs
    //Votant
    struct Voter {  
        bool isRegistered;      // Votant enregistré ou non
        bool hasVoted;          // A déjà voté ou non
        uint votedProposalId;   // Id de la proposition auquel il à voté
    }

    //Proposition
    struct Proposal { 
        string description;     // Description de la proposition
        uint voteCount;         // Nombre de votes de la proposition
    }

    //Enums
    //Statut du vote
    enum WorkflowStatus { 
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    //uints
    uint private winningProposalId;     //Id de la proposition gagnante
    uint private proposalId;            //Id de la proposition courante
    
    //status
    WorkflowStatus public status;       //Statut du vote
    
    //Events
    event VoterRegistered(address voterAddress);
    event ProposalsRegistrationStarted();
    event ProposalsRegistrationEnded();
    event ProposalRegistered(uint proposalId);
    event VotingSessionStarted();
    event VotingSessionEnded();
    event Voted (address voter, uint proposalId);
    event VotesTallied();
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);

    //Mappings
    mapping(address => Voter) private whitelist;    // Liste blanche de tous les votants
    mapping(uint => Proposal) private proposals;    // Liste de toutes les propositions enregistrées

    //Functions
    /** @dev Ajoute une adresse à la liste blanche
     *  @param _address Adresse à ajouter à la liste blanche
     */
    function whitelistVoter(address _address) public onlyOwner { 
        require(status == WorkflowStatus.RegisteringVoters, "Whitelist voters is not started");
        require(whitelist[_address].isRegistered == false, "Address already whitelisted");
        whitelist[_address] = Voter(true,false,0);
    }

    /** @dev Débute la phase d'enregistrement des propositions
     */
    function startProposalRegistration() public onlyOwner {
        require(status != WorkflowStatus.ProposalsRegistrationEnded, "Proposal registration is ended");
        require(status == WorkflowStatus.RegisteringVoters, "Registering voters is not ended");
        status = WorkflowStatus.ProposalsRegistrationStarted;
        emit ProposalsRegistrationStarted();
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    /** @dev Ajoute une proposition à la liste
     *  @param description Description de la proposition à ajouter
     */
    function addProposal(string memory description) external {
        require(status == WorkflowStatus.ProposalsRegistrationStarted, "Proposal registration is not started");
        require(whitelist[msg.sender].isRegistered == true, "You're not whitelisted");
        require(proposalId<=2^256-1,"Max Proposal");
        proposals[proposalId] = Proposal(description,0);
        proposalId++;
        emit ProposalRegistered(proposalId-1);
    }

    /** @dev Termine la phase d'enregistrement des propositions
     */
    function endProposalRegistration() public onlyOwner {
        require(status == WorkflowStatus.ProposalsRegistrationStarted, "Proposal registration is not started");
        status = WorkflowStatus.ProposalsRegistrationEnded;
        emit ProposalsRegistrationEnded();
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }


    /** @dev Débute la phase de vote
     */
    function startVotingSession() public onlyOwner {
        require(status == WorkflowStatus.ProposalsRegistrationEnded, "Proposal registration is not ended");
        status = WorkflowStatus.VotingSessionStarted;
        emit VotingSessionStarted();
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    /** @dev Enregistrement d'un vote
     *  @param proposalIndex ID de la proposition votée
     */
    function vote(uint proposalIndex) external{
        require(status == WorkflowStatus.VotingSessionStarted, "Voting session is not started");
        require(true == whitelist[msg.sender].isRegistered,"You're not whitelisted");
        require(false == whitelist[msg.sender].hasVoted,"You have already voted");
        whitelist[msg.sender].votedProposalId = proposalIndex;
        whitelist[msg.sender].hasVoted = true;
        proposals[proposalIndex].voteCount++;

        if(proposals[proposalIndex].voteCount >= proposals[winningProposalId].voteCount){
            winningProposalId = proposalIndex;
        }
        emit Voted(msg.sender, proposalIndex);
    }

    /** @dev Termine la phase de vote
     */
    function endVotingSession() public onlyOwner {
        require(status == WorkflowStatus.VotingSessionStarted, "Voting session is not started");
        status = WorkflowStatus.VotingSessionEnded;
        emit VotingSessionEnded();
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    /** @dev Calcule le résultat final (la proposition gagnante)
     */
    function votesCalculation() public onlyOwner {
        require(status == WorkflowStatus.VotingSessionEnded, "Voting session is not ended");
        status = WorkflowStatus.VotesTallied;
        emit VotesTallied();
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }

    /** @dev Renvoie les informations de la proposition gagnante
     *  @return description La description de la proposition gagnante
     */
    function getWinnerInfo() public view returns (string memory description){
        require(status == WorkflowStatus.VotesTallied, "Votes are not tallied");
        return proposals[winningProposalId].description;
    }

}