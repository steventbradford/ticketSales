import React from 'react';
import './App.css';
import ticketsale from './ticketSale';  // Make sure this imports the correct ABI
import Web3 from 'web3';

const web3 = new Web3(window.ethereum);

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: '',
            message: '',
            tickets: [],
            address: '',
        };
        this.handleChangeId = this.handleChangeId.bind(this);
        this.handleChangeAddress = this.handleChangeAddress.bind(this);
    }

    async componentDidMount() {
        try {
            const ticketsCount = 3; 
            const allTickets = [];
            for (let i = 0; i < ticketsCount; i++) {
                try {
                    const ticket = await ticketsale.methods.tickets(i).call();
                    console.log(`Ticket ${i}:`, ticket);
                    
                    allTickets.push({
                        id: ticket[1].toString(), 
                        price: web3.utils.fromWei(ticket[2].toString(), 'ether'), 
                    });
                } catch (err) {
                    console.error(`Error fetching ticket ${i}:`, err);
                }
            }
            this.setState({ tickets: allTickets });
        } catch (error) {
            console.error("Error fetching tickets:", error);
        }
    }

    handleChangeId(event) {
        this.setState({ id: event.target.value });
    }

    handleChangeAddress(event) {
        this.setState({ address: event.target.value });
    }

    handleSubmitBuyTicket = async (event) => {
        event.preventDefault();
        const { id, price } = this.state;
        alert(`
            ____Your Details____\n
            ID: ${id}
            Price: ${price} ETH
        `);
        const accounts = await web3.eth.getAccounts();
        this.setState({ message: "Waiting on transaction success..." });
        try {
            await ticketsale.methods.buyTicket(id).send({
                from: accounts[0],
                value: web3.utils.toWei(price, 'ether'),  
            });
        } catch (error) {
            alert("Ticket ID is not valid or you do not have enough funds!");
        }
    };

    handleSubmitOfferSwap = async (event) => {
        event.preventDefault();
        const { id } = this.state;
        alert(`
            ____Details____\n
            Asking ID to swap: ${id}
        `);
        const accounts = await web3.eth.getAccounts();
        this.setState({ message: "Waiting on transaction success..." });
        try {
            await ticketsale.methods.offerSwap(id).send({
                from: accounts[0],
            });
        } catch (error) {
            alert("Ticket ID is not valid or there was an issue offering the swap!");
        }
    };

    handleSubmitRefundTicket = async (event) => {
        event.preventDefault();
        alert(`
            ____Details____\n
            About to refund ticket
        `);
        const accounts = await web3.eth.getAccounts();
        this.setState({ message: "Waiting on transaction success..." });
        try {
            const priceInWei = this.state.tickets[0]?.price ? web3.utils.toWei(this.state.tickets[0].price, 'ether') : 0;
            await ticketsale.methods.resaleTicket(priceInWei).send({
                from: accounts[0],
            });
           
            await ticketsale.methods.acceptResale().send({
                from: accounts[0],
            });
        } catch (error) {
            alert("Error during refund process!");
        }
    };

    handleSubmitAcceptOffer = async (event) => {
        event.preventDefault();
        const { id } = this.state;
        alert(`
            ____Your Details____\n
            ID of ticket receiving: ${id}
        `);
        const accounts = await web3.eth.getAccounts();
        this.setState({ message: "Waiting on transaction success..." });
        try {
            await ticketsale.methods.acceptOffer(id).send({
                from: accounts[0],
            });
        } catch (error) {
            alert("Ticket ID is not valid or there was an issue accepting the offer!");
        }
    };

    handleSubmitGetTicketOf = async (event) => {
        event.preventDefault();
        const { address } = this.state;
        alert(`
            ____Your Details____\n
            Address of account to check: ${address}
        `);
        try {
            const id = await ticketsale.methods.getTicketOf(address).call();
            alert("Your ticket ID is: " + id.toString());
        } catch (error) {
            alert("Ticket address is not valid");
        }
    };

    render() {
        return (
            <div style={styles.container}>
                <h2>TicketSale Contract</h2>
                <div style={styles.ticketList}>
                    {this.state.tickets.length === 0 ? (
                        <p>No tickets available.</p>
                    ) : (
                        this.state.tickets.map((ticket, index) => (
                            <div key={index} style={styles.ticketCard}>
                                <p>ID: {ticket.id}</p>
                                <p>Price: {ticket.price} ETH</p>
                                <hr />
                            </div>
                        ))
                    )}
                </div>

                <form onSubmit={this.handleSubmitBuyTicket} style={styles.form}>
                    <h4>Buy Ticket</h4>
                    <div>
                        <label>Enter Ticket ID </label>
                        <input
                            placeholder="Enter ID"
                            onChange={this.handleChangeId}
                            style={styles.input}
                        />
                    </div>
                    <div>
                        <button name="buyTicket" style={styles.button}>Buy a Ticket</button>
                    </div>
                </form>

                <form onSubmit={this.handleSubmitOfferSwap} style={styles.form}>
                    <h4>Offer Swap</h4>
                    <div>
                        <label>Enter Ticket ID </label>
                        <input
                            placeholder="Enter ID"
                            onChange={this.handleChangeId}
                            style={styles.input}
                        />
                    </div>
                    <div>
                        <button name="offerSwap" style={styles.button}>Offer Swap</button>
                    </div>
                </form>

                <form onSubmit={this.handleSubmitAcceptOffer} style={styles.form}>
                    <h4>Accept Offer</h4>
                    <div>
                        <label>Enter Ticket ID </label>
                        <input
                            placeholder="Enter ID"
                            onChange={this.handleChangeId}
                            style={styles.input}
                        />
                    </div>
                    <div>
                        <button name="acceptSwap" style={styles.button}>Accept Swap</button>
                    </div>
                </form>

                <form onSubmit={this.handleSubmitGetTicketOf} style={styles.form}>
                    <h4>Get Ticket Number</h4>
                    <div>
                        <label>Enter Address </label>
                        <input
                            placeholder="Enter Address"
                            onChange={this.handleChangeAddress}
                            style={styles.input}
                        />
                    </div>
                    <div>
                        <button name="getTicketOf" style={styles.button}>Get Ticket Number</button>
                    </div>
                </form>

                <form onSubmit={this.handleSubmitRefundTicket} style={styles.form}>
                    <h4>Refund Ticket</h4>
                    <div>
                        <button name="refundTicket" style={styles.button}>Refund Ticket</button>
                    </div>
                </form>

                {this.state.message && <p>{this.state.message}</p>}
            </div>
        );
    }
}

const styles = {
    container: {
        padding: '20px',
        textAlign: 'center',
    },
    ticketList: {
        marginTop: '20px',
        marginBottom: '30px',
    },
    ticketCard: {
        backgroundColor: '#f8f9fa',
        padding: '10px',
        borderRadius: '5px',
        margin: '10px 0',
    },
    form: {
        marginBottom: '20px',
    },
    input: {
        padding: '10px',
        fontSize: '16px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        width: '200px',
        marginBottom: '10px',
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
