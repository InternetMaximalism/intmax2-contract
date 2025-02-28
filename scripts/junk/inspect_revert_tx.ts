import { ethers } from 'hardhat'

async function main() {
	// The following code works `npx hardhat run path/to/this/script.ts --network scrollSepolia`
	// const tx_hash = "0x7812b36cd1a432376478395de293396c48fec25a5225a490286a3f84021095a0"
	// const trace = await ethers.provider.send('debug_traceTransaction', [
	// 	tx_hash,
	// 	{
	// 		tracer: 'callTracer',
	// 		tracerConfig: {}
	// 	}
	// ]);
	// console.log(trace)

	// The following code works `npx hardhat run path/to/this/script.ts --network localhost`
	// with `npx hardhat node --fork <scroll-sepolia-rpc> --fork-block-number 8010972` on another window
	const signer = await ethers.getImpersonatedSigner(
		'0xC80e690BF300680Cff00fF8eBB6e9935Cf51C54C',
	)
	const input =
		'0x842f1bfc3a07c3292efaf307e7a56c09cd315e92cb4db04050e0cbfc7885b14dce8a4f69800000000000000000000000000000000000000000000000000000000000000012185ba20c4c94bf3dc27e148cdf5ffcba56b911476551fe50e3fa42814b1b8c3025ca11c4e945b628c49a6cedee3f19f86f4dd9eada4346e7efdc51abae200804a14f9dae469fe09748ffd307bf0e40a963840f5bb41b4435d3b9b75b4ad22102428a3316a7aa7b4a056618542f9b23ec3d91d8589429cb3d96510c76770cab19b00b4bac130b6494ec33aaf4cc5262f484dc5c48d2b066ec629d9ca53851aa156ab5b25ecb5aa7e473827d1b318e92a94b1ac1b4440c104e48d2058c1a2e3c0d0e4bfb85bde5092aacb6d4614a987be04bdd3fb1baaf19ba830ce53adebd091f1d7d82c8b19d5aa61a648e998462940c268ab8c79e35205d78b56f0a4d21110ff4be3cc7f0ec7fab040f29b58b42b8cf515aef159e7e0a4daf523034d21832147d261ca3dd4856e276788217a54b400912321104ba39d1463081d5772d4ec6f513280a334211f0932c5400703567f1255086b35171a66917824228d2aab2b800000000000000000000000000000000000000000000000000000000000001c0000000000000000000000000000000000000000000000000000000000000000a000000185d0000000e8f00000000000000000000000000000000000000000000'
	const rollup = '0xc824c47C7c9038034b57bEb67B41e362581D8C3E'

	const tx = await signer.sendTransaction({
		to: rollup,
		data: input,
		value: ethers.parseEther('0.3'),
	})
	const receipt = await tx.wait()
	console.log('Transaction completed:', receipt)
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
