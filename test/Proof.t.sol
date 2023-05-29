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

        bytes32[] memory inputs = new bytes32[](10);
        assembly {
            mstore(add(inputs, 0x20), 20)       // x
            mstore(add(inputs, 0x40), 20)       // nested.first.t1.val1
            mstore(add(inputs, 0x60), 30)       // nested.first.t1.val2
            mstore(add(inputs, 0x80), 50)       // nested.first.t1.val3
            mstore(add(inputs, 0xa0), true)     // nested.first.is_true
            mstore(add(inputs, 0xc0), 30)       // nested.second.t1.val1
            mstore(add(inputs, 0xe0), 70)       // nested.second.t1.val2
            mstore(add(inputs, 0x100), 100)     // nested.second.t1.val3
            mstore(add(inputs, 0x120), true)    // nested.second.is_true
            mstore(add(inputs, 0x140), 80)      // y
        }

        bool res = verifier.verify(proofBytes, inputs);
        require(res);
    }
}
