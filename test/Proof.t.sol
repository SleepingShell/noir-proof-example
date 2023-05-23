// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import "../circuits/contract/plonk_vk.sol";

contract ProvingTest is Test {
    UltraVerifier verifier;

    function setUp() public {
        verifier = new UltraVerifier();
    }

    function testVerification() public {
        // Load the proof
        string memory proof = vm.readLine("./circuits/proofs/p.proof");
        bytes memory proofBytes = vm.parseBytes(proof);

        bytes32[] memory inputs = new bytes32[](6);
        assembly {
            mstore(add(inputs, 0x20), 20)       // x
            mstore(add(inputs, 0x40), true)     // nested.is_true
            mstore(add(inputs, 0x60), 20)       // nested.t1
            mstore(add(inputs, 0x80), 30)       // ^^
            mstore(add(inputs, 0xa0), 50)       // ^^
            mstore(add(inputs, 0xc0), 80)       // y
        }

        bool res = verifier.verify(proofBytes, inputs);
        require(res);
    }
}
