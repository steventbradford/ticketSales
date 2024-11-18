const Web3 = require('web3');
const assert = require('assert');
const ganache = require('ganache-cli');
const web3 = new Web3(ganache.provider());
const { abi, bytecode } = require('../compile');  // Adjust path to your compiled contract's ABI and Bytecode

let accounts;
let ticketSale;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    try {
        // Deploy contract with 8 tickets and price 100 (for example)
        ticketSale = await new web3.eth.Contract(abi)
            .deploy({
                data: bytecode,  // Assuming this is the correct bytecode object
                arguments: ["8", "100"],    // 8 tickets with a price of 100 (in wei)
            })
            .send({ from: accounts[0], gas: '4700000', gasPrice: '8000000000' });
    } catch (error) {
        console.error("Deployment error", error);
    }
});

describe('ticketSale', () => {
    it('should allow a user to buy a ticket', async () => {
        await ticketSale.methods.buyTicket(1).send({ from: accounts[1], value: web3.utils.toWei('0.01', 'ether') });
        const ticketOwner = await ticketSale.methods.ownedTickets(accounts[1]).call();
        assert.strictEqual(ticketOwner.toString(), '1');
    });

    it('should not allow buying a ticket if already owned', async () => {
        await ticketSale.methods.buyTicket(1).send({ from: accounts[1], value: web3.utils.toWei('0.01', 'ether') });
        try {
            await ticketSale.methods.buyTicket(2).send({ from: accounts[1], value: web3.utils.toWei('0.01', 'ether') });
        } catch (err) {
            assert.ok(err.message.includes('Already own a ticket'), 'Expected error message for already owning a ticket');
        }
    });

    it('should not allow buying a ticket with incorrect price', async () => {
        try {
            await ticketSale.methods.buyTicket(1).send({ from: accounts[1], value: web3.utils.toWei('0.005', 'ether') });
        } catch (err) {
            assert.ok(err.message.includes('Insufficient funds'), 'Expected error message for insufficient funds');
        }
    });

    it('should allow a user to offer a swap', async () => {
        await ticketSale.methods.buyTicket(1).send({ from: accounts[1], value: web3.utils.toWei('0.01', 'ether') });
        await ticketSale.methods.buyTicket(2).send({ from: accounts[2], value: web3.utils.toWei('0.01', 'ether') });

        // Now offer swap
        await ticketSale.methods.offerSwap(1).send({ from: accounts[1] });
        await ticketSale.methods.acceptSwap(2).send({ from: accounts[2] });

        const ticketOwner1 = await ticketSale.methods.ownedTickets(accounts[1]).call();
        const ticketOwner2 = await ticketSale.methods.ownedTickets(accounts[2]).call();

        assert.strictEqual(ticketOwner1.toString(), '2', 'Expected ticket 1 to be owned by account 2 after swap');
        assert.strictEqual(ticketOwner2.toString(), '1', 'Expected ticket 2 to be owned by account 1 after swap');
    });

    it('should allow a user to resale their ticket', async () => {
        await ticketSale.methods.buyTicket(1).send({ from: accounts[1], value: web3.utils.toWei('0.01', 'ether') });
        
        // Resell ticket with new price
        await ticketSale.methods.resaleTicket(1, web3.utils.toWei('0.02', 'ether')).send({ from: accounts[1] });

        // Check if the ticket is on resale
        const resaleInfo = await ticketSale.methods.resaleList(1).call();
        assert.strictEqual(resaleInfo.seller, accounts[1], 'Expected account 1 to be the seller');
        assert.strictEqual(resaleInfo.price.toString(), web3.utils.toWei('0.02', 'ether'), 'Expected resale price to be 0.02 ether');
    });

    it('should allow another user to accept a resale', async () => {
        await ticketSale.methods.buyTicket(1).send({ from: accounts[1], value: web3.utils.toWei('0.01', 'ether') });
        
        // Resell ticket with new price
        await ticketSale.methods.resaleTicket(1, web3.utils.toWei('0.02', 'ether')).send({ from: accounts[1] });

        // Account 2 buys the ticket from resale
        await ticketSale.methods.acceptResale(1).send({ from: accounts[2], value: web3.utils.toWei('0.02', 'ether') });

        const ticketOwner = await ticketSale.methods.ownedTickets(accounts[2]).call();
        assert.strictEqual(ticketOwner.toString(), '1', 'Expected ticket 1 to be owned by account 2 after resale');
    });

    it('should check all tickets on resale', async () => {
        await ticketSale.methods.buyTicket(1).send({ from: accounts[1], value: web3.utils.toWei('0.01', 'ether') });
        await ticketSale.methods.buyTicket(2).send({ from: accounts[2], value: web3.utils.toWei('0.01', 'ether') });

        await ticketSale.methods.resaleTicket(1, web3.utils.toWei('0.02', 'ether')).send({ from: accounts[1] });
        await ticketSale.methods.resaleTicket(2, web3.utils.toWei('0.03', 'ether')).send({ from: accounts[2] });

        const resaleList = await ticketSale.methods.checkResale().call();
        assert.strictEqual(resaleList.ticketIds.length, 2, 'Expected two tickets to be listed for resale');
        assert.strictEqual(resaleList.prices[0], web3.utils.toWei('0.02', 'ether'), 'Expected price for ticket 1 to be 0.02 ether');
        assert.strictEqual(resaleList.prices[1], web3.utils.toWei('0.03', 'ether'), 'Expected price for ticket 2 to be 0.03 ether');
    });
});
