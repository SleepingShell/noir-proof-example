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

const stripCalldata = (proof: Buffer, input: any): [string, string[]] => {
  let num_inputs = function get_num_inputs(obj): number {
    let num = 0;
    for (let key of Object.keys(obj)) {
      if (Object.keys(obj[key]).length > 0) {
        num += get_num_inputs(obj[key]);
      } else {
        num += 1;
      }
    }
    return num;
  }(input)

  const calldata: string[] = []
  for (let i = 0; i < num_inputs; i++) {
    calldata.push("0x" + proof.subarray(i*32, (i+1)*32).toString('hex'));
  }

  const proofOnly: string = "0x" + proof.subarray(num_inputs*32).toString('hex');

  return [proofOnly, calldata];
}

describe("Creating proof", () => {
  it("Create and verify proof", async () => {
    const factory = await ethers.getContractFactory("UltraVerifier");
    const contract = await factory.deploy();
    console.log("Verifier deployed to", contract.address);

    const proving = await getProverAndVerifier();

    let input = {
      x: 100,
      nested: [1, 20, 30, 50, 1, 30, 70, 100],
      y: 80,
    };

    /*
    const input2 = {
      x: 100,
      nested: {
        first: {
          is_true: 1,
          t1: {
            val1: 20,
            val2: 30,
            val3: 50
          },
        },
        second: {
          is_true: 1,
          t1: {
            val1: 30,
            val2: 70,
            val3: 100
          },
        }
      },
      y: 80
    };
    */
    
    // Adding the below line to compute_partial_witnesses would allow flattening nested objects w/ properties
    //else if (Object.keys(any_object).length > 0) for (let k of Object.keys(any_object)) values = values.concat(AnyToHexStrs(any_object[k]));

    // This returns a buffer with the public inputs preprended to the proof
    const proof = await create_proof(proving.prover, proving.acir, input);
    console.log((proof as Buffer).toString('hex'));

    const verified = await verify_proof(proving.verifier, proof);
    console.log(verified);

    console.log(...stripCalldata(proof, input));
    await contract.verify(...stripCalldata(proof, input), { gasLimit: 3000000000 });
  });
});