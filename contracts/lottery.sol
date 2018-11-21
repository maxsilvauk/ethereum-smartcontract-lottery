pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;

    function Lottery() public {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value > 0.1 ether);
        players.push(msg.sender);
    }

    function random() private view returns (uint) {
        return uint(keccak256(block.difficulty, now, players)); // needs to be changed (depreciated)
    }

    function pickWinner() public restricted {
        uint index = random() % players.length;
        players[index].transfer(this.balance); // needs to be changed (depreciated)
        players = new address[](0);
    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    function getPlayers() public view returns(address[]) {
        return players;
    }
}
