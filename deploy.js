// Import our bytecode &  our interface
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

// The metamask seed phrase & the rinkeby network
// we want to connect to.
const provider = new HDWalletProvider(
  'add enforce fun spring curious tonight divorce minor before celery card trial',
  'https://rinkeby.infura.io/v3/835fef3984d746eb9ccd66dc5ef48254'
);

const web3 = new Web3(provider);

// The deployment async function.
const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  // We need to add '0x' to the start of the bytecode.
  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: '0x' + bytecode })
    .send({ gas: '1000000', from: accounts[0] });

    console.log('Contract deployed to', result.options.address);
}

deploy();
