const path = require('path');
const fs = require('fs');
const solc = require('solc');


const eComPath = path.resolve(__dirname, 'contracts', 'ticketSale.sol');
const source = fs.readFileSync(eComPath, 'utf8');

let input = {
  language: "Solidity",
  sources: {
    "ticketSale.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode"],
      },
    },
  },
};

const stringInput=JSON.stringify(input);

const compiledCode=solc.compile(stringInput);


const output =JSON.parse(compiledCode);


const contractOutput=output.contracts;


const ticketOutput=contractOutput["ticketSale.sol"];


const ticketABI=ticketOutput.ticketSale.abi;



const ticketBytecode=ticketOutput.ticketSale.evm.bytecode;


module.exports= {"abi":ticketABI,"bytecode":ticketBytecode.object};
