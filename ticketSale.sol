// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.17;

contract ticketSale {
    address manager;

    struct ticketInfo {
        address owner;
        uint id;
        int price;
    }
   
    struct swapInfo {
        address owner;
        uint id;
    }

    struct resaleInfo {
        address owner;
        uint id;
        uint price;
    }

    ticketInfo[] public tickets;
    swapInfo[] public swapList;
    resaleInfo[] public resaleList;

    constructor(uint numTickets, uint price) {
        for (uint i = 0; i < numTickets; i++) {
            tickets.push(ticketInfo(msg.sender, i + 1, int(price)));
        }
        manager = msg.sender;      
    }

    function buyTicket(uint ticketId) public payable {
        for (uint i = 0; i < tickets.length; i++) {
            if ((tickets[i].id == ticketId) && (tickets[i].owner == manager) && (getTicketOf(msg.sender) == 0)) {
                require(int(msg.value) >= tickets[i].price, "out of balance");
                (bool sent, ) = manager.call{value: uint(tickets[i].price)}("");
                require(sent, "Failed to send Ether");  
                tickets[i].owner = msg.sender;  
            }
        }
    }

    function getTicketOf(address person) public view returns (uint) {
        for (uint i = 0; i < tickets.length; i++) {
            if (person == tickets[i].owner) {
                return tickets[i].id;
            }
        }
        return 0;
    }

    function offerSwap(uint ticketId) public {
        swapInfo memory swap;
        swap = swapInfo(msg.sender, ticketId);
        swapList.push(swap);
    }

    function acceptSwap(uint ticketId) public {
        for (uint i = 0; i < swapList.length; i++) {
            if ((swapList[i].id == ticketId) && swapList[i].id == getTicketOf(msg.sender)) {
                require(getTicketOf(swapList[i].owner) != 0, "Sender of swap has no ticket!");

                for (uint j = 0; j < tickets.length; j++) {
                    if (tickets[j].owner == msg.sender) {
                        tickets[j].owner = swapList[i].owner;
                    } else if (tickets[j].owner == swapList[i].owner) {
                        tickets[j].owner = msg.sender;
                    }
                }

                for (uint k = i; k < swapList.length - 1; k++) {
                    swapList[k] = swapList[k + 1];
                }
                swapList.pop();
            }
        }
    }

    function resaleTicket(uint price) public {
        require(getTicketOf(msg.sender) != 0, "Sender does not own a ticket!");
        resaleInfo memory resale;
        resale = resaleInfo(msg.sender, getTicketOf(msg.sender), price);
        resaleList.push(resale);  
    }

    function acceptResale(uint ticketId) public payable {
        for (uint i = 0; i < resaleList.length; i++) {
            if (resaleList[i].id == ticketId) {
                require(getTicketOf(msg.sender) == 0, "Buyer of resale has a ticket!");
                require(msg.value >= resaleList[i].price, "out of balance");

                (bool sent, ) = manager.call{value: uint(resaleList[i].price)}("");
                require(sent, "Failed to send Ether");

                uint returnAmount = (uint(resaleList[i].price) / 10) * 9;
                uint serviceFee = (uint(resaleList[i].price) / 10);
                payable(manager).transfer(serviceFee);
                payable(resaleList[i].owner).transfer(returnAmount);

                for (uint j = 0; j < resaleList.length; j++) {
                    if (resaleList[i].owner == tickets[j].owner) {
                        tickets[j].owner = msg.sender;
                    }
                }

                for (uint k = i; k < resaleList.length - 1; k++) {
                    resaleList[k] = resaleList[k + 1];
                }
                resaleList.pop();
            }
        }
    }

    function checkResale() public view returns (uint[] memory) {
        uint[] memory returnData = new uint[](resaleList.length * 2);
        uint index = 0;
        for (uint i = 0; i < resaleList.length; i++) {
            returnData[index] = resaleList[i].id;
            returnData[index + 1] = uint(resaleList[i].price);
            index += 2;
        }
        return returnData;
    }
}
