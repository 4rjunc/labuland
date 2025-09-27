// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/NFT.sol";

contract DeployMyNFT is Script {
    function run() external returns (MyNFT) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        MyNFT nft = new MyNFT(deployerAddress);
        
        console.log("NFT deployed to:", address(nft));
        console.log("Owner:", deployerAddress);
        
        vm.stopBroadcast();
        
        return nft;
    }
}
