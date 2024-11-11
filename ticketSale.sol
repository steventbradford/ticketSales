// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract TicketSale {
    address public manager;

    struct Ticket {
        address owner;
        uint price;
    }

    struct Resale {
        address seller;
        uint price;
    }

    mapping(uint => Ticket) public tickets;
    mapping(address => uint) public ownedTickets; // Maps address to ticket ID
    mapping(uint => Resale) public resaleList; // Maps ticket ID to resale information
    uint public numTickets;

    constructor(uint _numTickets, uint _price) {
        manager = msg.sender;
        numTickets = _numTickets;
        for (uint i = 1; i <= numTickets; i++) {
            tickets[i] = Ticket(msg.sender, _price);
        }
    }

    // Buy a ticket
    function buyTicket(uint ticketId) external payable {
        Ticket storage ticket = tickets[ticketId];
        require(ticket.owner == manager, "Ticket not for sale");
        require(ownedTickets[msg.sender] == 0, "Already own a ticket");
        require(msg.value >= uint(ticket.price), "Insufficient funds");

        // Transfer funds
        (bool sent, ) = manager.call{value: uint(ticket.price)}("");
        require(sent, "Payment failed");

        // Update ownership
        ticket.owner = msg.sender;
        ownedTickets[msg.sender] = ticketId;
    }

    // Offer a swap
    function offerSwap(uint ticketId) external {
        require(ownedTickets[msg.sender] == ticketId, "You do not own this ticket");
        delete resaleList[ticketId];  // Ensure it is not in resale
    }

    // Accept a swap (simplified)
    function acceptSwap(uint ticketId) external {
        uint userTicketId = ownedTickets[msg.sender];
        require(userTicketId != 0, "You do not own a ticket");
        require(userTicketId != ticketId, "Cannot swap with yourself");

        // Swap ownership between two users
        address otherOwner = tickets[ticketId].owner;
        tickets[userTicketId].owner = otherOwner;
        tickets[ticketId].owner = msg.sender;
        ownedTickets[msg.sender] = ticketId;
        ownedTickets[otherOwner] = userTicketId;
    }

    // Resale a ticket
    function resaleTicket(uint ticketId, uint price) external {
        require(ownedTickets[msg.sender] == ticketId, "You do not own this ticket");
        resaleList[ticketId] = Resale(msg.sender, price);
    }

    // Accept a resale
    function acceptResale(uint ticketId) external payable {
        Resale storage resale = resaleList[ticketId];
        require(resale.seller != address(0), "Ticket not for resale");
        require(ownedTickets[msg.sender] == 0, "You already own a ticket");
        require(msg.value >= resale.price, "Insufficient funds");

        // Transfer funds
        uint serviceFee = resale.price / 10;
        uint sellerAmount = resale.price - serviceFee;
        
        (bool sent, ) = manager.call{value: serviceFee}("");
        require(sent, "Failed to pay service fee");

        (sent, ) = payable(resale.seller).call{value: sellerAmount}("");
        require(sent, "Failed to pay seller");

        // Update ownership
        tickets[ticketId].owner = msg.sender;
        ownedTickets[msg.sender] = ticketId;
        delete resaleList[ticketId]; // Remove resale listing
    }

    // Check all resale tickets
    function checkResale() external view returns (uint[] memory ticketIds, uint[] memory prices) {
        uint count = 0;
        for (uint i = 1; i <= numTickets; i++) {
            if (resaleList[i].seller != address(0)) {
                count++;
            }
        }

        ticketIds = new uint[](count);
        prices = new uint[](count);
        uint index = 0;
        for (uint i = 1; i <= numTickets; i++) {
            if (resaleList[i].seller != address(0)) {
                ticketIds[index] = i;
                prices[index] = resaleList[i].price;
                index++;
            }
        }
    }
}
