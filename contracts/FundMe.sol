pragma solidity ^0.8.8;

contract FundMe {

    error NotOwner();

    address public immutable owner;
    mapping(address => uint256) public addressToAmount;
    address[] public funders;

     modifier onlyOwner {
        if (msg.sender != owner) revert NotOwner();
        _;
    }    
    constructor() {
        owner = msg.sender;
    }
    fallback() external payable { }

    function deposit() external payable {
        require(msg.value > 0, "msg.value <= 0");
        addressToAmount[msg.sender] += msg.value;
        funders.push(msg.sender);
    }
    function withdraw() payable onlyOwner external {
        funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Withdrawal Failed!");
    }
    function ethBalance() external view returns(uint256){
        return address(this).balance;
    }
}