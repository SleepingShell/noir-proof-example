# Noir (nested) Proof example
This repository demonstrates how to interact with the solidity verifier, more specifically I created this to test how structs are supposed to be passed to the verifier and add to the Noir documentation

Generate the proof and generate the verifier:
```
cd circuits
nargo prove p
nargo codegen-verifier
```

The ``Proof.t.sol`` demonstrates how to verify a proof in solidity.