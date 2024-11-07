// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.17;

contract ticketSale {
    address manager;

    struct TicketInfo {
        address owner;
        uint id;
        int price;
    }

    struct SwapInfo {
        address owner;
        uint id;
    }

    struct ResaleInfo {
        address owner;
        uint id;
        uint price;
    }

    mapping(uint => TicketInfo) public tickets;          // Mapping ticketId to TicketInfo
    mapping(address => uint) public userTickets;         // Mapping address to ticketId
    mapping(uint => SwapInfo) public swapList;           // Mapping ticketId to SwapInfo
    mapping(uint => ResaleInfo) public resaleList;       // Mapping ticketId to ResaleInfo

    uint public ticketCount;                             // Total number of tickets

    constructor(uint numTickets, uint price) {
        manager = msg.sender;
        for (uint i = 0; i < numTickets; i++) {
            uint ticketId = i + 1;
            tickets[ticketId] = TicketInfo({
                owner: msg.sender,
                id: ticketId,
                price: int(price)
            });
            ticketCount++;
        }
    }

    // Buy ticket function
    function buyTicket(uint ticketId) public payable {
        TicketInfo storage ticket = tickets[ticketId];
        require(ticket.owner == manager, "Ticket not available for sale");
        require(userTickets[msg.sender] == 0, "You already own a ticket");
        require(msg.value >= uint(ticket.price), "Insufficient funds");

        (bool sent, ) = manager.call{value: uint(ticket.price)}("");
        require(sent, "Failed to send Ether");

        ticket.owner = msg.sender;
        userTickets[msg.sender] = ticketId;
    }

    // Offer a swap
    function offerSwap(uint ticketId) public {
        require(userTickets[msg.sender] == ticketId, "You must own the ticket");
        swapList[ticketId] = SwapInfo(msg.sender, ticketId);
    }

    // Accept swap
    function acceptSwap(uint ticketId) public {
        SwapInfo storage swap = swapList[ticketId];
        require(userTickets[msg.sender] == ticketId, "You must own the ticket to swap");

        address otherOwner = swap.owner;
        require(userTickets[otherOwner] == ticketId, "The other party must own the ticket");

        // Swap tickets
        tickets[ticketId].owner = msg.sender;
        tickets[ticketId].owner = otherOwner;

        // Remove swap entry
        delete swapList[ticketId];
    }

    // Resale ticket
    function resaleTicket(uint price) public {
        uint ticketId = userTickets[msg.sender];
        require(ticketId != 0, "You must own a ticket");
        resaleList[ticketId] = ResaleInfo(msg.sender, ticketId, price);
    }

    // Accept resale
    function acceptResale(uint ticketId) public payable {
        ResaleInfo storage resale = resaleList[ticketId];
        require(userTickets[msg.sender] == 0, "You already own a ticket");
        require(msg.value >= resale.price, "Insufficient funds");

        uint serviceFee = resale.price / 10;
        uint returnAmount = resale.price - serviceFee;

        // Transfer service fee and funds
        (bool sent, ) = manager.call{value: serviceFee}("");
        require(sent, "Failed to send service fee");

        payable(resale.owner).transfer(returnAmount);

        // Transfer ownership of ticket
        tickets[ticketId].owner = msg.sender;
        userTickets[msg.sender] = ticketId;

        // Remove resale entry
        delete resaleList[ticketId];
    }

    // Check resale info
    function checkResale() public view returns (uint[] memory) {
        uint[] memory returnData = new uint[](ticketCount * 2);
        uint index = 0;
        for (uint i = 1; i <= ticketCount; i++) {
            ResaleInfo storage resale = resaleList[i];
            returnData[index] = resale.id;
            returnData[index + 1] = resale.price;
            index += 2;
        }
        return returnData;
    }
}
