const VotingReact = artifacts.require("./Voting.sol");
const truffleAssert = require('../node_modules/truffle-assertions');

//Classe de tests
contract("Voting", accounts => {
  let voting;

  //Actions à faire avant chaque test
  beforeEach('setup contract for each test', async function() {
    voting = await VotingReact.new('0xF24eC99E0dBcBb1AEA6BEc735E52869A1858f9f4');
  })

  //Test 1 : Savoir si le SC possède un owner
  it("...has an owner", async () => {
    assert.equal(await voting.owner()!="0x0000000000000000000000000000000000000000",true , "Voting React has not owner");
  });

  //Test 2 : Savoir si le SC possède le bon owner
  it("...has the good owner", async () => {
    assert.equal(await voting.owner(),'0xF24eC99E0dBcBb1AEA6BEc735E52869A1858f9f4' , "Voting React has not the good owner");
  });

  //Test 3 : Savoir si le status de départ est de 0
  it("...starting status is 0", async () => {
    assert.equal(await voting.status(),'0' , "Starting status is not 0");
  });

  //Test 4 : Savoir si le status après le démarrage de l'enregistrement de proposition est 1
  it("...status after starting proposal registration is 1", async () => {
    await voting.startProposalRegistration();
    assert.equal(await voting.status(),'1' , "Status is not 1");
  });

  //Test 5 : Savoir si le status après la fin de l'enregistrement de proposition est 2
  it("...status after ending proposal registration is 2", async () => {
    await voting.startProposalRegistration();
    await voting.endProposalRegistration();
    assert.equal(await voting.status(),'2' , "Status is not 2");
  });

  //Test 6 : Savoir si le status après le démarrage de la session de vote est 3
  it("...status after starting voting session is 3", async () => {
    await voting.startProposalRegistration();
    await voting.endProposalRegistration();
    await voting.startVotingSession();
    assert.equal(await voting.status(),'3' , "Status is not 3");
  });

  //Test 7 : Savoir si le status après la fin de la session de vote est 4
  it("...status after ending voting session is 4", async () => {
    await voting.startProposalRegistration();
    await voting.endProposalRegistration();
    await voting.startVotingSession();
    await voting.endVotingSession();
    assert.equal(await voting.status(),'4' , "Status is not 4");
  });

  //Test 8 : Savoir si le status après le calcul des résultats est 5
  it("...status after tailing vote is 5", async () => {
    await voting.startProposalRegistration();
    await voting.endProposalRegistration();
    await voting.startVotingSession();
    await voting.endVotingSession();
    await voting.votesCalculation();
    assert.equal(await voting.status(),'5' , "Status is not 5");
  });

  //Test 9 : La proposition ne doit pas être ajoutée si l'utilisateur n'est pas whitelisté
  it("...proposal should not be taken into account (not whitelisted for adding proposal)", async () => {
    await voting.whitelistVoter('0xF24eC99E0dBcBb1AEA6BEc735E52869A1858f9f4');
    await voting.startProposalRegistration();

    await truffleAssert.reverts(
      voting.addProposal('Proposal 1',{from: '0x261C90A862C384992bf82e4EAf76A97A0BB61001'}),
      "Returned error: VM Exception while processing transaction: revert You're not whitelisted -- Reason given: You're not whitelisted."
    );
  });

  //Test 10 : La proposition ne doit pas être ajoutée si l'enregistrement des proposition n'est pas commencé
  it("...proposal should not be taken into account (proposal registration is not started)", async () => {
    await voting.whitelistVoter('0xF24eC99E0dBcBb1AEA6BEc735E52869A1858f9f4');

    await truffleAssert.reverts(
      voting.addProposal('Proposal 1',{from: '0xF24eC99E0dBcBb1AEA6BEc735E52869A1858f9f4'}),
      "Returned error: VM Exception while processing transaction: revert Proposal registration is not started -- Reason given: Proposal registration is not started."
    );
  });

  //Test 11 : Le vote ne doit pas être ajoutée si l'utilisateur n'est pas whitelisté
  it("...vote should not be taken into account (not whitelisted for voting)", async () => {
    await voting.whitelistVoter('0xF24eC99E0dBcBb1AEA6BEc735E52869A1858f9f4');
    await voting.startProposalRegistration();
    await voting.addProposal('Proposal 1',{from: '0xF24eC99E0dBcBb1AEA6BEc735E52869A1858f9f4'});
    await voting.endProposalRegistration();

    await voting.startVotingSession();

    await truffleAssert.reverts(
      voting.vote(0,{from: '0x261C90A862C384992bf82e4EAf76A97A0BB61001'}),
      "Returned error: VM Exception while processing transaction: revert You're not whitelisted -- Reason given: You're not whitelisted."
    );
  });

  //Test 12 : Le vote ne doit pas être ajoutée si la session de vote n'est pas commencé
  it("...vote should not be taken into account (vote is not started)", async () => {
    await voting.whitelistVoter('0xF24eC99E0dBcBb1AEA6BEc735E52869A1858f9f4');
    await voting.startProposalRegistration();
    await voting.addProposal('Proposal 1',{from: '0xF24eC99E0dBcBb1AEA6BEc735E52869A1858f9f4'});
    await voting.endProposalRegistration();

    await truffleAssert.reverts(
      voting.vote(0,{from: '0xF24eC99E0dBcBb1AEA6BEc735E52869A1858f9f4'}),
      "Returned error: VM Exception while processing transaction: revert Voting session is not started -- Reason given: Voting session is not started."
    );
  });

  //Test 13 : Le résultat ne doit pas être donné avant que le résultat soit calculé
  it("...result has to be tailed to be given", async () => {
    await truffleAssert.reverts(
      voting.getWinnerInfo(),
      "Returned error: VM Exception while processing transaction: revert Votes are not tallied"
    );
  });

  //Test 14 : Le résultat du vote doit être la proposition 1 (1 seul proposition)
  it("...winner should be proposal 1", async () => {
    await voting.whitelistVoter('0xF24eC99E0dBcBb1AEA6BEc735E52869A1858f9f4');
    await voting.whitelistVoter('0x261C90A862C384992bf82e4EAf76A97A0BB61001');
    await voting.startProposalRegistration();
    await voting.addProposal('Proposal 1',{from: '0xF24eC99E0dBcBb1AEA6BEc735E52869A1858f9f4'});
    await voting.endProposalRegistration();

    await voting.startVotingSession();
    await voting.vote(0,{from: '0xF24eC99E0dBcBb1AEA6BEc735E52869A1858f9f4'});
    await voting.vote(0,{from: '0x261C90A862C384992bf82e4EAf76A97A0BB61001'});
    await voting.endVotingSession();
    await voting.votesCalculation();

    assert.equal(await voting.getWinnerInfo(),'Proposal 1' , "Winner is not Proposal 1");
  });

  //Test 15 : Le résultat du vote doit être la proposition 2 (2 propositions)
  it("...winner should be proposal 2", async () => {
    await voting.whitelistVoter('0xF24eC99E0dBcBb1AEA6BEc735E52869A1858f9f4');
    await voting.whitelistVoter('0x261C90A862C384992bf82e4EAf76A97A0BB61001');
    await voting.startProposalRegistration();
    await voting.addProposal('Proposal 1',{from: '0xF24eC99E0dBcBb1AEA6BEc735E52869A1858f9f4'});
    await voting.addProposal('Proposal 2',{from: '0xF24eC99E0dBcBb1AEA6BEc735E52869A1858f9f4'});
    await voting.endProposalRegistration();

    await voting.startVotingSession();
    await voting.vote(1,{from: '0xF24eC99E0dBcBb1AEA6BEc735E52869A1858f9f4'});
    await voting.vote(1,{from: '0x261C90A862C384992bf82e4EAf76A97A0BB61001'});
    await voting.endVotingSession();
    await voting.votesCalculation();

    assert.equal(await voting.getWinnerInfo(),'Proposal 2' , "Winner is not Proposal 2");
  });

  //Test 16 : Le résultat du vote doit être la dernière proposition votée en cas d'égalité
  it("...with equality winner should be proposal with last vote", async () => {
    await voting.whitelistVoter('0xF24eC99E0dBcBb1AEA6BEc735E52869A1858f9f4');
    await voting.whitelistVoter('0x261C90A862C384992bf82e4EAf76A97A0BB61001');
    await voting.startProposalRegistration();
    await voting.addProposal('Proposal 1',{from: '0xF24eC99E0dBcBb1AEA6BEc735E52869A1858f9f4'});
    await voting.addProposal('Proposal 2',{from: '0xF24eC99E0dBcBb1AEA6BEc735E52869A1858f9f4'});
    await voting.endProposalRegistration();

    await voting.startVotingSession();
    await voting.vote(0,{from: '0xF24eC99E0dBcBb1AEA6BEc735E52869A1858f9f4'});
    await voting.vote(1,{from: '0x261C90A862C384992bf82e4EAf76A97A0BB61001'});
    await voting.endVotingSession();
    await voting.votesCalculation();

    assert.equal(await voting.getWinnerInfo(),'Proposal 2' , "Winner is not Proposal 2");
  });

});
