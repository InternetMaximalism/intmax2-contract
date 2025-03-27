use std::{
    fs::{self, File},
    io::Write as _,
    path::Path,
};

use ark_bn254::{G1Affine, G2Affine};
use ark_std::UniformRand as _;
use intmax2_zkp::{
    circuits::{
        test_utils::witness_generator::{construct_validity_and_tx_witness, MockTxRequest},
        validity::validity_pis::ValidityPublicInputs,
    },
    common::{
        signature::{
            flatten::{FlatG1, FlatG2},
            key_set::KeySet,
        },
        trees::{
            account_tree::AccountTree, block_hash_tree::BlockHashTree, deposit_tree::DepositTree,
        },
        tx::Tx,
        withdrawal::Withdrawal,
        witness::{block_witness::BlockWitness, full_block::FullBlock},
    },
    ethereum_types::{address::Address, bytes32::Bytes32, u32limb_trait::U32LimbTrait},
    utils::hash_chain::chain_end_circuit::ChainEndProofPublicInputs,
};
use rand::{rngs::StdRng, Rng as _, SeedableRng};
use serde::{Deserialize, Serialize};

#[test]
fn generate_test_data() {
    let hardhat_default_address =
        Address::from_hex("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266").unwrap();

    let mut rng = StdRng::seed_from_u64(0);

    let mut account_tree = AccountTree::initialize();
    let mut block_tree = BlockHashTree::initialize();
    let deposit_tree = DepositTree::initialize();

    let tx_request = MockTxRequest {
        tx: Tx::rand(&mut rng),
        sender_key: KeySet::rand(&mut rng),
        will_return_sig: true,
    };

    let mut validity_pis = ValidityPublicInputs::genesis();

    // post registration
    let (validity_witness1, _) = construct_validity_and_tx_witness(
        validity_pis.clone(),
        &mut account_tree,
        &mut block_tree,
        &deposit_tree,
        true,
        0,
        hardhat_default_address,
        0,
        &[tx_request.clone()],
        chrono::Utc::now().timestamp() as u64,
    )
    .unwrap();

    validity_pis = validity_witness1.to_validity_pis().unwrap();

    // post non-registration
    let (validity_witness2, _) = construct_validity_and_tx_witness(
        validity_pis.clone(),
        &mut account_tree,
        &mut block_tree,
        &deposit_tree,
        false,
        0,
        hardhat_default_address,
        0,
        &[tx_request.clone()],
        chrono::Utc::now().timestamp() as u64,
    )
    .unwrap();

    validity_pis = validity_witness2.to_validity_pis().unwrap();

    // post non-registration
    let (validity_witness3, _) = construct_validity_and_tx_witness(
        validity_pis.clone(),
        &mut account_tree,
        &mut block_tree,
        &deposit_tree,
        false,
        0,
        hardhat_default_address,
        0,
        &[],
        chrono::Utc::now().timestamp() as u64,
    )
    .unwrap();

    let full_blocks = vec![validity_witness1, validity_witness2, validity_witness3]
        .into_iter()
        .map(|w| block_witness_to_full_block(&w.block_witness))
        .collect::<Vec<_>>();
    save_full_blocks("../test_data", &full_blocks).unwrap();

    let withdrawal_block = full_blocks.last().unwrap();
    let withdrawals = (0..3)
        .map(|_| Withdrawal {
            recipient: Address::rand(&mut rng),
            token_index: rng.gen_range(0..2),
            amount: rng.gen_range(1..u32::MAX).into(),
            nullifier: Bytes32::rand(&mut rng),
            block_hash: withdrawal_block.block.hash(),
            block_number: withdrawal_block.block.block_number,
        })
        .collect::<Vec<_>>();

    let mut withdrawal_hash = Bytes32::default();
    for withdrawal in &withdrawals {
        withdrawal_hash = withdrawal.hash_with_prev_hash(withdrawal_hash);
    }
    let withdrawal_aggregator =
        Address::from_hex("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266").unwrap();
    let pis = ChainEndProofPublicInputs {
        last_hash: withdrawal_hash,
        aggregator: withdrawal_aggregator,
    };
    let withdrawal_info = WithdrawalInfo {
        withdrawals,
        withdrawal_proof_public_inputs: pis.clone(),
        pis_hash: pis.hash(),
    };
    save_withdrawal_info("../test_data", &withdrawal_info).unwrap();
}

fn block_witness_to_full_block(block_witness: &BlockWitness) -> FullBlock {
    let is_registration_block = block_witness
        .signature
        .block_sign_payload
        .is_registration_block;
    let block = block_witness.block.clone();
    let signature = block_witness.signature.clone();
    let pubkeys = block_witness.pubkeys.clone();
    let account_ids = block_witness.account_id_packed;
    let trimmed_pubkeys = pubkeys
        .into_iter()
        .filter(|pubkey| !pubkey.is_dummy_pubkey())
        .collect::<Vec<_>>();
    let trimmed_account_ids = account_ids.map(|ids| ids.to_trimmed_bytes());
    let full_block = FullBlock {
        block: block.clone(),
        signature,
        pubkeys: if is_registration_block {
            Some(trimmed_pubkeys)
        } else {
            None
        },
        account_ids: trimmed_account_ids,
    };
    full_block
}

#[test]
fn generate_pairing_test_data() {
    let mut rng = StdRng::seed_from_u64(0);

    let random_agg_pubkey = G1Affine::rand(&mut rng);
    let random_agg_signature = G2Affine::rand(&mut rng);
    let random_message_point = G2Affine::rand(&mut rng);

    let pairing = PairingTestData {
        agg_pubkey: random_agg_pubkey.into(),
        agg_signature: random_agg_signature.into(),
        message_point: random_message_point.into(),
    };
    save_pairing_test_data("../test_data", &pairing).unwrap();
}

fn save_full_blocks<P: AsRef<Path>>(dir_path: P, full_blocks: &[FullBlock]) -> anyhow::Result<()> {
    if !Path::new(dir_path.as_ref()).exists() {
        fs::create_dir(dir_path.as_ref())?;
    }
    for full_block in full_blocks.iter() {
        let block_number = full_block.block.block_number;
        let block_str = serde_json::to_string_pretty(full_block)?;
        let file_path = format!("{}/block{}.json", dir_path.as_ref().display(), block_number);
        let mut file = File::create(file_path)?;
        file.write_all(block_str.as_bytes())?;
    }
    Ok(())
}

fn save_withdrawal_info<P: AsRef<Path>>(
    dir_path: P,
    withdrawal_info: &WithdrawalInfo,
) -> anyhow::Result<()> {
    if !Path::new(dir_path.as_ref()).exists() {
        fs::create_dir(dir_path.as_ref())?;
    }
    let withdrawal_info_str = serde_json::to_string_pretty(withdrawal_info)?;
    let file_path = format!("{}/withdrawal_info.json", dir_path.as_ref().display());
    let mut file = File::create(file_path)?;
    file.write_all(withdrawal_info_str.as_bytes())?;
    Ok(())
}

fn save_pairing_test_data<P: AsRef<Path>>(
    dir_path: P,
    pairing_test_data: &PairingTestData,
) -> anyhow::Result<()> {
    if !Path::new(dir_path.as_ref()).exists() {
        fs::create_dir(dir_path.as_ref())?;
    }
    let pairing_test_data_str = serde_json::to_string_pretty(pairing_test_data)?;
    let file_path = format!("{}/pairing_test_data.json", dir_path.as_ref().display());
    let mut file = File::create(file_path)?;
    file.write_all(pairing_test_data_str.as_bytes())?;
    Ok(())
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct WithdrawalInfo {
    withdrawals: Vec<Withdrawal>,
    withdrawal_proof_public_inputs: ChainEndProofPublicInputs,
    pis_hash: Bytes32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PairingTestData {
    pub agg_pubkey: FlatG1,
    pub agg_signature: FlatG2,
    pub message_point: FlatG2,
}
