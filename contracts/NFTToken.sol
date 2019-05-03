pragma solidity ^0.5.0;

import "openzeppelin-eth/contracts/ownership/Ownable.sol";
import "openzeppelin-eth/contracts/token/ERC721/StandaloneERC721.sol";
import "zos-lib/contracts/Initializable.sol";

contract NFTToken is Initializable, Ownable, StandaloneERC721 {

 function initialize (string memory name, string memory symbol, address[] memory minters, address[] memory pausers) public initializer{
    StandaloneERC721.initialize(name, symbol, minters, pausers);
    Ownable.initialize(msg.sender);
  }
}
