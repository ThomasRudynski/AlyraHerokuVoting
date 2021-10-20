import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Voting from "./contracts/Voting.json";
import getWeb3 from "./getWeb3";
import "./App.css";

class App extends Component {

  //Variables globales de la classe
  state = { storageValue: 0, web3: null, accounts: null, contract: null, owner: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      web3.eth.handleRevert = true;

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Voting.networks[networkId];
      const instance = new web3.eth.Contract(
        Voting.abi,
        deployedNetwork && deployedNetwork.address,
      );
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runInit);
      const contractOwner = await this.affectOwner();
      this.setState({ owner: contractOwner })
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  //Fonction qui permet de recharger la page en cas de changement d'adresse 
  runInit = async () => {
    window.ethereum.on('accountsChanged', function (accounts) {
      window.location.href = "http://localhost:3000";
    });
  }


  //Ajoute un utilisateur sur la liste blanche
  whitelistVoter = async () => {
    const { accounts, contract } = this.state;
    const address = this.address.value;

    // Interaction avec le smart contract pour ajouter un compte 
    try {
      await contract.methods.whitelistVoter(address).send({ from: accounts[0] });
    } catch (e) {
      var firstPart = e.message.substring(e.message.search("VM"))
      alert(firstPart.substring(0, firstPart.search('"')));
    }
  }

  //Débute la phase d'enregistrement des propositions
  startProposalRegistration = async () => {
    const { accounts, contract } = this.state;
    // Interaction avec le smart contract pour démarrer l'enregistrement des propositions
    try {
      await contract.methods.startProposalRegistration().send({ from: accounts[0] });
    } catch (e) {
      var firstPart = e.message.substring(e.message.search("VM"))
      alert(firstPart.substring(0, firstPart.search('"')));
    }
  }

  //Ajoute une proposition à la liste
  addProposal = async () => {
    const { accounts, contract } = this.state;
    // Interaction avec le smart contract pour démarrer l'enregistrement des propositions
    try {
      await contract.methods.addProposal(document.getElementById("description").value).send({ from: accounts[0] });
    } catch (e) {
      var firstPart = e.message.substring(e.message.search("VM"))
      alert(firstPart.substring(0, firstPart.search('"')));
    }
  }

  //Termine la phase d'enregistrement des propositions
  endProposalRegistration = async () => {
    const { accounts, contract } = this.state;
    // Interaction avec le smart contract pour démarrer l'enregistrement des propositions
    try {
      await contract.methods.endProposalRegistration().send({ from: accounts[0] });
    } catch (e) {
      var firstPart = e.message.substring(e.message.search("VM"))
      alert(firstPart.substring(0, firstPart.search('"')));
    }
  }

  //Débute la phase de vote
  startVotingSession = async () => {
    const { accounts, contract } = this.state;
    // Interaction avec le smart contract pour démarrer l'enregistrement des propositions
    try {
      await contract.methods.startVotingSession().send({ from: accounts[0] });
    } catch (e) {
      var firstPart = e.message.substring(e.message.search("VM"))
      alert(firstPart.substring(0, firstPart.search('"')));
    }
  }

  //Enregistrement d'un vote
  vote = async () => {
    const { accounts, contract } = this.state;
    // Interaction avec le smart contract pour démarrer l'enregistrement des propositions
    try {
      await contract.methods.vote(document.getElementById("idProposal").value).send({ from: accounts[0] });
    } catch (e) {
      var firstPart = e.message.substring(e.message.search("VM"))
      alert(firstPart.substring(0, firstPart.search('"')));
    }
  }

  //Termine la phase de vote
  endVotingSession = async () => {
    const { accounts, contract } = this.state;
    // Interaction avec le smart contract pour démarrer l'enregistrement des propositions
    try {
      await contract.methods.endVotingSession().send({ from: accounts[0] });
    } catch (e) {
      var firstPart = e.message.substring(e.message.search("VM"))
      alert(firstPart.substring(0, firstPart.search('"')));
    }
  }

  // Calcule le résultat final (la proposition gagnante)
  votesCalculation = async () => {
    const { accounts, contract } = this.state;
    // Interaction avec le smart contract pour démarrer l'enregistrement des propositions
    try {
      await contract.methods.votesCalculation().send({ from: accounts[0] });
    } catch (e) {
      var firstPart = e.message.substring(e.message.search("VM"))
      alert(firstPart.substring(0, firstPart.search('"')));
    }
  }

  //Renvoie les informations de la proposition gagnante
  getWinnerInfo = async () => {
    const { accounts, contract } = this.state;
    // Interaction avec le smart contract pour démarrer l'enregistrement des propositions
    try {
      const node = document.createTextNode("Gagnant : " + await contract.methods.getWinnerInfo().call({ from: accounts[0] }));
      const p = document.createElement("p");
      p.className = "info";
      p.appendChild(node)
      document.getElementById("winnerInfo").appendChild(p);
    } catch (e) {
      alert(e);
      var firstPart = e.message.substring(e.message.search("VM"))
      alert(firstPart.substring(0, firstPart.search('"')));
    }
  }

  getOwner = function () {
    const { contract } = this.state;
    return new Promise(function (resolve) {
      resolve(contract.methods.owner().call());
    })
  }

  affectOwner = async () => {
    var result = await this.getOwner()
    return result;
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    //OWNER VIEW
    if (String(this.state.owner).toLowerCase() === String(this.state.accounts[0]).toLowerCase()) {
      return (
        <div className="App">
          <div>
            <h2 className="text-center title">Système de vote</h2>
            <p className="text-center" id="userAddress">Adresse de l'utilisateur : {this.state.accounts[0]}</p>
            <hr></hr>
          </div>
          <Container>
            <Row>
              <Col>
                <h3>Administrateur</h3>
                <Card className='m-2 mt-4'>
                  <Card.Header><strong>Ajouter un nouveau compte à la liste blanche</strong></Card.Header>
                  <Card.Body>
                    <Form.Group controlId="formAddress">
                      <Form.Label>Adresse de l'utilisateur : </Form.Label>
                      <Form.Control type="text" id="address" ref={(input) => { this.address = input }} className="input" />
                    </Form.Group>
                    <Button onClick={this.whitelistVoter} variant="dark" className="button"> Autoriser </Button>
                  </Card.Body>
                </Card>

                <Card className='m-2'>
                  <Card.Header><strong>Démarrer l'enregistrement des propositions</strong></Card.Header>
                  <Card.Body>
                    <Button onClick={this.startProposalRegistration} variant="dark" className="button"> Démarrer </Button>
                  </Card.Body>
                </Card>

                <Card className='m-2'>
                  <Card.Header><strong>Terminer l'enregistrement des propositions</strong></Card.Header>
                  <Card.Body>
                    <Button onClick={this.endProposalRegistration} variant="dark" className="button"> Terminer </Button>
                  </Card.Body>
                </Card>

                <Card className='m-2'>
                  <Card.Header><strong>Démarrer la session de vote</strong></Card.Header>
                  <Card.Body>
                    <Button onClick={this.startVotingSession} variant="dark" className="button"> Démarrer </Button>
                  </Card.Body>
                </Card>

                <Card className='m-2'>
                  <Card.Header><strong>Terminer la session de vote</strong></Card.Header>
                  <Card.Body>
                    <Button onClick={this.endVotingSession} variant="dark" className="button"> Terminer </Button>
                  </Card.Body>
                </Card>

                <Card className='m-2'>
                  <Card.Header><strong>Calculer les résultats</strong></Card.Header>
                  <Card.Body>
                    <Button onClick={this.votesCalculation} variant="dark" className="button"> Calculer </Button>
                  </Card.Body>
                </Card>
              </Col>


              <Col>
                <h3>Utilisateur</h3>
                <Card className='m-2 mt-4'>
                  <Card.Header><strong>Ajouter une proposition</strong></Card.Header>
                  <Card.Body>
                    <Form.Group controlId="formDescription">
                      <Form.Label>Description de la proposition : </Form.Label>
                      <Form.Control type="text" id="description" className="input" />
                    </Form.Group>
                    <Button onClick={this.addProposal} variant="dark" className="button"> Ajouter </Button>
                  </Card.Body>
                </Card>

                <Card className='m-2'>
                  <Card.Header><strong>Vote</strong></Card.Header>
                  <Card.Body>
                    <Form.Group controlId="formId">
                      <Form.Label>ID de la proposition : </Form.Label>
                      <Form.Control type="text" id="idProposal" className="input" />
                    </Form.Group>
                    <Button onClick={this.vote} variant="dark" className="button"> Voter </Button>
                  </Card.Body>
                </Card>

                <Card className='m-2'>
                  <Card.Header><strong>Résultats</strong></Card.Header>
                  <Card.Body id="winnerInfo">
                    <Button onClick={this.getWinnerInfo} variant="dark" className="button"> Obtenir les résultats </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>

          <br></br>
        </div>
      );
    }

    //USER VIEW
    if (String(this.state.owner).toLowerCase() !== String(this.state.accounts[0]).toLowerCase()) {
      return (
        <div className="App">
          <div>
            <h2 className="text-center title">Système de vote</h2>
            <p className="text-center" id="userAddress">Adresse de l'utilisateur : {this.state.accounts[0]}</p>
            <hr></hr>
          </div>

          <Container>
            <Col>
              <Row>
                <Col></Col>
                <Col>
                  <Card>
                    <Card.Header><strong>Ajouter une proposition</strong></Card.Header>
                    <Card.Body>
                      <Form.Group controlId="formDescription">
                        <Form.Label>Description de la proposition : </Form.Label>
                        <Form.Control type="text" id="description" className="input" />
                      </Form.Group>
                      <Button onClick={this.addProposal} variant="dark" className="button"> Ajouter </Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col></Col>
              </Row>

              <Row>
                <Col></Col>
                <Col>
                  <Card>
                    <Card.Header><strong>Vote</strong></Card.Header>
                    <Card.Body>
                      <Form.Group controlId="formId">
                        <Form.Label>ID de la proposition : </Form.Label>
                        <Form.Control type="text" id="idProposal" className="input" />
                      </Form.Group>
                      <Button onClick={this.vote} variant="dark" className="button"> Voter </Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col></Col>

              </Row>

              <Row>
                <Col></Col>
                <Col>
                  <Card>
                    <Card.Header><strong>Résultats</strong></Card.Header>
                    <Card.Body id="winnerInfo">
                      <Button onClick={this.getWinnerInfo} variant="dark" className="button"> Obtenir les résultats </Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col></Col>

              </Row>
            </Col>
          </Container>

          <br></br>
        </div>
      );
    }
  }
}

export default App;
