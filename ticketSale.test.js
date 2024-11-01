const Web3 = require('web3');
const assert = require('assert');
const ganache = require('ganache-cli');
const web3 = new Web3(ganache.provider());
const {abi, bytecode} = require('../compile');

//const { abi, evm } = require('./ticketSale.json'); // Make sure to compile your contract and save ABI and Bytecode

let accounts;
let ticketSale;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    try {
    ticketSale = await new web3.eth.Contract(abi)
        .deploy({
         data: bytecode,
         arguments: ["8", "100"],
         })
        .send({ from: accounts[0],gasPrice: '8000000000', gas: '4700000' });
        }
        catch (error) {
            console.error("Deployment error", error);
        
        }
});

describe('ticketSale', () => {
    it('should allow a user to buy a ticket', async () => {
        await ticketSale.methods.buyTicket(1).send({ from: accounts[1], value: web3.utils.toWei('0.01', 'ether') });
        const ticketOwner = await ticketSale.methods.getTicketOf(accounts[1]).call();
        assert.ok(ticketOwner, '1');
        
    });
    
      
    it('should not allow buying a ticket if already owned', async () => {
        await ticketSale.methods.buyTicket(1).send({ from: accounts[1], value: web3.utils.toWei('0.01', 'ether') });
        try {
            await ticketSale.methods.buyTicket(2).send({ from: accounts[1], value: web3.utils.toWei('0.01', 'ether') });
      
        } catch (err) {
            assert.ok(err.message.includes('Sender does not own a ticket!'));
        }
    });

    it('should not allow buying a ticket with incorrect price', async () => {
        try {
            await ticketSale.methods.buyTicket(1).send({ from: accounts[1], value: web3.utils.toWei('0.005', 'ether') });
        } catch (err) {
            assert.ok(err.message.includes('out of balance'));
        }
    });

    it('should allow a user to offer a swap', async () => {
        await ticketSale.methods.buyTicket(1).send({ from: accounts[1], value: web3.utils.toWei('0.01', 'ether') });
        await ticketSale.methods.buyTicket(2).send({ from: accounts[2], value: web3.utils.toWei('0.01', 'ether') });

        await ticketSale.methods.offerSwap(1).send({ from: accounts[1] });
        await ticketSale.methods.acceptSwap(2).send({ from: accounts[2] });

        const ticketOwner1 = await ticketSale.methods.getTicketOf(accounts[1]).call();
        const ticketOwner2 = await ticketSale.methods.getTicketOf(accounts[2]).call();

        assert.ok(ticketOwner1, '2');
        assert.ok(ticketOwner2, '1');
    });

    it('should allow a user to resale their ticket', async () => {
        await ticketSale.methods.buyTicket(1).send({ from: accounts[1], value: web3.utils.toWei('0.01', 'ether') });
        await ticketSale.methods.resaleTicket(web3.utils.toWei('0.02', 'ether')).send({ from: accounts[1] });

        const resaleList = await ticketSale.methods.checkResale().call();
        assert.ok(resaleList[0], '1');
        assert.ok(resaleList[1], web3.utils.toWei('0.02', 'ether'));
    });

    it('should allow another user to accept a resale', async () => {
        await ticketSale.methods.buyTicket(1).send({ from: accounts[1], value: web3.utils.toWei('0.01', 'ether') });
        await ticketSale.methods.resaleTicket(web3.utils.toWei('0.02', 'ether')).send({ from: accounts[1] });

        await ticketSale.methods.acceptResale(1).send({ from: accounts[2], value: web3.utils.toWei('0.02', 'ether') });

        const ticketOwner = await ticketSale.methods.getTicketOf(accounts[2]).call();
        assert.ok(ticketOwner, '1');
    });
    
});
