import logo from './logo.svg';
import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import ticketSale from './ticketSale'; // ABI and contract address for ticketSale

class App extends Component {
  state = {
    inputTicketId: '', // State for the ticket ID to purchase
    inputSwapTicketId: '', // State for the ticket ID to offer swap
    inputAcceptSwapTicketId: '', // State for the ticket ID to accept swap
    ownedTicketId: null, // State for owned ticket ID
    account: '', // User's Ethereum address
    message: '', // State for status messages
  };

  // Fetch account on component mount
  async componentDidMount() {
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
  }

  // Handle purchase ticket
  purchaseTicket = async () => {
    const { inputTicketId, account } = this.state;
    try {
      const ticketPrice = await ticketSale.methods.tickets(inputTicketId).call();
      await ticketSale.methods.buyTicket(inputTicketId)
        .send({ from: account, value: ticketPrice.price });

      this.setState({ message: 'Ticket purchased successfully!' });
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      this.setState({ message: `Error: ${error.message}` });
    }
  };

  // Handle offer swap
  offerSwap = async () => {
    const { inputSwapTicketId, account } = this.state;
    try {
      await ticketSale.methods.offerSwap(inputSwapTicketId)
        .send({ from: account });

      this.setState({ message: 'Swap offer created!' });
    } catch (error) {
      console.error('Error offering swap:', error);
      this.setState({ message: `Error: ${error.message}` });
    }
  };

  // Handle accept swap
  acceptSwap = async () => {
    const { inputAcceptSwapTicketId, account } = this.state;
    try {
      await ticketSale.methods.acceptSwap(inputAcceptSwapTicketId)
        .send({ from: account });

      this.setState({ message: 'Swap accepted!' });
    } catch (error) {
      console.error('Error accepting swap:', error);
      this.setState({ message: `Error: ${error.message}` });
    }
  };

  // Get ticket number by wallet address
  getTicketByAddress = async () => {
    const { account } = this.state;
    try {
      const ticketId = await ticketSale.methods.ownedTickets(account).call();
      this.setState({ ownedTicketId: ticketId, message: `Your ticket ID is: ${ticketId}` });
    } catch (error) {
      console.error('Error fetching ticket:', error);
      this.setState({ message: `Error: ${error.message}` });
    }
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Ticket Sale Contract</h2>

          {/* User Account */}
          <p>Account: {this.state.account}</p>

          {/* Purchase Ticket */}
          <div style={styles.form}>
            <h3>Purchase Ticket</h3>
            <input
              type="number"
              placeholder="Ticket ID"
              value={this.state.inputTicketId}
              onChange={(e) => this.setState({ inputTicketId: e.target.value })}
              style={styles.input}
            />
            <button onClick={this.purchaseTicket} style={styles.button}>
              Purchase Ticket
            </button>
          </div>

          {/* Offer Swap */}
          <div style={styles.form}>
            <h3>Offer Swap</h3>
            <input
              type="number"
              placeholder="Ticket ID to Swap"
              value={this.state.inputSwapTicketId}
              onChange={(e) => this.setState({ inputSwapTicketId: e.target.value })}
              style={styles.input}
            />
            <button onClick={this.offerSwap} style={styles.button}>
              Offer Swap
            </button>
          </div>

          {/* Accept Swap */}
          <div style={styles.form}>
            <h3>Accept Swap</h3>
            <input
              type="number"
              placeholder="Ticket ID to Accept"
              value={this.state.inputAcceptSwapTicketId}
              onChange={(e) => this.setState({ inputAcceptSwapTicketId: e.target.value })}
              style={styles.input}
            />
            <button onClick={this.acceptSwap} style={styles.button}>
              Accept Swap
            </button>
          </div>

          {/* Get Ticket by Address */}
          <div style={styles.form}>
            <h3>Get Your Ticket Number</h3>
            <button onClick={this.getTicketByAddress} style={styles.button}>
              Get Ticket ID
            </button>
            {this.state.ownedTicketId && (
              <p>Your Ticket ID: {this.state.ownedTicketId}</p>
            )}
          </div>

          {/* Display Status Messages */}
          <div>
            <h3>Status</h3>
            <p>{this.state.message}</p>
          </div>
        </header>
      </div>
    );
  }
}

// Inline styling for the form
const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    marginTop: '20px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '200px',
  },
  button: {
    padding: '10px',
    fontSize: '16px',
    color: '#fff',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
  },
};

export default App;
