import web3 from './web3';
const address='0x531848640e07A54A4D0eD7EDe904070a571cbdc9';
const abi=[
  {
    inputs: [ [Object], [Object] ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    inputs: [ [Object] ],
    name: 'acceptResale',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [ [Object] ],
    name: 'acceptSwap',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [ [Object] ],
    name: 'buyTicket',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'checkResale',
    outputs: [ [Object], [Object] ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'manager',
    outputs: [ [Object] ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'numTickets',
    outputs: [ [Object] ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [ [Object] ],
    name: 'offerSwap',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [ [Object] ],
    name: 'ownedTickets',
    outputs: [ [Object] ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [ [Object] ],
    name: 'resaleList',
    outputs: [ [Object], [Object] ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [ [Object], [Object] ],
    name: 'resaleTicket',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [ [Object] ],
    name: 'tickets',
    outputs: [ [Object], [Object] ],
    stateMutability: 'view',
    type: 'function'
  }
];

const ticketSale = new web3.eth.Contract(abi, address);
export default ticketSale;
