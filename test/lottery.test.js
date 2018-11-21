const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3'); // Require Web3 constructor.
const web3 = new Web3(ganache.provider()); // Provider we want to connect to or network.
const { interface, bytecode } = require('../compile');

let accounts;
let lottery;

beforeEach(async () => {
  // Get a list of all accounts.
  accounts = await web3.eth.getAccounts();

  // Use one of those accounts to deploy the contract.
  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' })
});

describe('Lottery Contract', () => {
  it('Deploys a contract', () => {
    // After we deploy the contract on the test network.
    // An address will be created. Make an assertion that
    // is this a defined value.
    assert.ok(lottery.options.address);
  });

  it ('Allows one account to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.11', 'ether')
    })

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    })

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it ('Allows multiple account to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.11', 'ether')
    })

    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.2', 'ether')
    })

    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.19', 'ether')
    })

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    })

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });

  it('Requires a minimum amount of ether to enter', async () => {
    try {
      await lottery.methods.enter.send({
        from: accounts[0],
        value: 0
      });
      assert(false); // await passed.
    } catch (err) {
      assert(err); // await failed.
    }
  });

  it('Only manager can pick a winner', async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1],
      });
      assert(false); // await passed.
    } catch (err) {
      assert(err); // await failed.
    }
  });

  it('It sends money to winner and resets the players array', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether')
    })

    const initialBalance = await web3.eth.getBalance(accounts[0]);
    await lottery.methods.pickWinner().send({ from: accounts[0] });
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initialBalance;

    assert(difference > web3.utils.toWei('1.8', 'ether'))
  });
});
