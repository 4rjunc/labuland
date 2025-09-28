// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/NFT.sol";

contract MintNFTScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address nftContract = vm.envAddress("NFT_CONTRACT");
        address recipient = vm.envAddress("RECIPIENT_ADDRESS");
        string memory tokenURI = vm.envString("TOKEN_URI");
        
        vm.startBroadcast(deployerPrivateKey);
        
        MyNFT nft = MyNFT(nftContract);
        nft.mint(recipient, tokenURI);
        
        uint256 tokenId = nft.getCurrentTokenId();
        console.log("Minted NFT #%d to %s", tokenId, recipient);
        console.log("Token URI:", tokenURI);
        
        vm.stopBroadcast();
    }
}
