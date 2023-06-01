import { ethers } from "hardhat";

import initNoirWasm, { acir_read_bytes, compile } from '@noir-lang/noir_wasm';
import initialiseAztecBackend from '@noir-lang/aztec_backend';
import { initialiseResolver } from '@noir-lang/noir-source-resolver';
import { setup_generic_prover_and_verifier, create_proof, verify_proof } from "@noir-lang/barretenberg";

import fs from "fs";

type ProvingSystem = {
  abi: any,
  acir: any,
  prover: any,
  verifier: any
}

type Nested = {
  t1: {
    val1: bigint,
    val2: bigint,
    val3: bigint,
  },
  is_true: boolean
}

type Input = {
  x: bigint,
  nested: {
    first: Nested,
    second: Nested,
  },
  y: bigint,
}

type EncodedInput<T> = { [K in keyof T]: T[K] extends unknown ? EncodedInput<T[K]> : T[K]}

const compileCircuit = async () => {
  const data = fs.readFileSync("circuits/src/main.nr", { encoding: 'utf-8' });
  initialiseResolver((id: any) => data);
  try {
    const compiled_noir = compile({});
    return compiled_noir;
  } catch (e) {
    console.log("Error while compiling noir:", e);
  }
};

const getProverAndVerifier = async (): Promise<ProvingSystem> => {
  const { circuit, abi } = await compileCircuit();
  //await initialiseAztecBackend();

  let acir_bytes = new Uint8Array(Buffer.from(circuit, 'hex'));
  let acir = acir_read_bytes(acir_bytes);

  let [p, v] = await setup_generic_prover_and_verifier(acir);
  return {
    abi: abi,
    acir: acir,
    prover: p,
    verifier: v,
  }
}

describe("Creating proof", () => {
  it("Create and verify proof", async () => {
    const factory = await ethers.getContractFactory("UltraVerifier");
    const contract = await factory.deploy();
    console.log("Verifier deployed to", contract.address);

    const proving = await getProverAndVerifier();
    console.log(proving.abi);

    const input: Input = {
      x: 100n,
      nested: {
        first: {
          t1: {
            val1: 20n,
            val2: 30n,
            val3: 50n
          },
          is_true: true
        },
        second: {
          t1: {
            val1: 30n,
            val2: 70n,
            val3: 100n
          },
          is_true: true
        }
      },
      y: 80n
    };

    let input2 = {
      x: 100n,
      nested: [20n, 30n, 50n, true, 30n, 70n, 100n, true],
      y: 80n,
    };

    const proof = await create_proof(proving.prover, proving.acir, input2);
    console.log(proof);
  });
});