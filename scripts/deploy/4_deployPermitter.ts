import { ethers, upgrades } from 'hardhat'
import { readDeployedContracts, writeDeployedContracts } from '../utils/io'
import { cleanEnv, str } from 'envalid'

const env = cleanEnv(process.env, {
  ADMIN_ADDRESS: str(),
  PREDICATE_AML_POLICY_ID: str({
    default: 'x-strict-membership-policy',
  }),
  PREDICATE_AML_SERVICE_MANAGER: str({
    default: '0xcb397f4bDF93213851Ef1c84439Dd3497Dff66c1',
  }),
  PREDICATE_ELIGIBILITY_POLICY_ID: str({
    default: 'x-strict-membership-policy',
  }),
  PREDICATE_ELIGIBILITY_SERVICE_MANAGER: str({
    default: '0xcb397f4bDF93213851Ef1c84439Dd3497Dff66c1',
  }),
})

async function main() {
  let deployedContracts = await readDeployedContracts()

  if (!deployedContracts.amlPermitter) {
    console.log('deploying amlPermitter')
    const predicatePermitterFactory =
      await ethers.getContractFactory('PredicatePermitter')
    const amlPermitter = await upgrades.deployProxy(
      predicatePermitterFactory,
      [
        env.ADMIN_ADDRESS,
        env.PREDICATE_AML_SERVICE_MANAGER,
        env.PREDICATE_AML_POLICY_ID,
      ],
      {
        kind: 'uups',
      },
    )
    deployedContracts = {
      amlPermitter: await amlPermitter.getAddress(),
      ...deployedContracts,
    }
    await writeDeployedContracts(deployedContracts)
  }

  if (!deployedContracts.eligibilityPermitter) {
    console.log('deploying eligibilityPermitter')
    const predicatePermitterFactory =
      await ethers.getContractFactory('PredicatePermitter')
    const eligibilityPermitter = await upgrades.deployProxy(
      predicatePermitterFactory,
      [
        env.ADMIN_ADDRESS,
        env.PREDICATE_ELIGIBILITY_SERVICE_MANAGER,
        env.PREDICATE_ELIGIBILITY_POLICY_ID,
      ],
      {
        kind: 'uups',
      },
    )
    deployedContracts = {
      eligibilityPermitter: await eligibilityPermitter.getAddress(),
      ...deployedContracts,
    }
    await writeDeployedContracts(deployedContracts)
  }

  if (deployedContracts.liquidity) {
    const liquidity = await ethers.getContractAt(
      'Liquidity',
      deployedContracts.liquidity,
    )
    const txSetPermitter = await liquidity.setPermitter(
      deployedContracts.amlPermitter!,
      deployedContracts.eligibilityPermitter!,
    )
    console.log('setPermitter tx hash:', txSetPermitter.hash)
    const resSetPermitter = await txSetPermitter.wait()
    if (!resSetPermitter?.blockNumber) {
      throw new Error('No block number found')
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
