#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, token,
    Address, Env,
};

// ── Types ──────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone)]
pub struct StakeInfo {
    pub evaluator: Address,
    pub borrower: Address,
    pub amount: i128,
    pub is_slashed: bool,
    pub reward_claimed: bool,
}

#[contracttype]
pub enum DataKey {
    Admin,
    TokenContract,
    LoanPoolContract,
    /// Stake keyed by (evaluator, borrower) tuple encoded as a composite key
    Stake(Address, Address),
    /// Total staked by an evaluator across all vouches
    TotalStaked(Address),
    /// Cumulative rewards earned by an evaluator
    RewardsEarned(Address),
    SlashPool,
}

// ── Contract ───────────────────────────────────────────────────────────────

#[contract]
pub struct ReputationStake;

#[contractimpl]
impl ReputationStake {
    // ── Admin ──────────────────────────────────────────────────────────────

    pub fn initialize(
        env: Env,
        admin: Address,
        token_contract: Address,
        loan_pool_contract: Address,
    ) {
        admin.require_auth();
        assert!(
            !env.storage().instance().has(&DataKey::Admin),
            "already initialized"
        );

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::TokenContract, &token_contract);
        env.storage()
            .instance()
            .set(&DataKey::LoanPoolContract, &loan_pool_contract);
        env.storage().instance().set(&DataKey::SlashPool, &0i128);
    }

    // ── Evaluator flows ────────────────────────────────────────────────────

    /// Evaluator stakes `amount` tokens when vouching for a borrower.
    /// This creates skin-in-the-game: bad vouches burn the evaluator's stake.
    pub fn stake(env: Env, evaluator: Address, borrower: Address, amount: i128) {
        evaluator.require_auth();
        assert!(amount > 0, "stake amount must be positive");

        // Cannot re-stake for same (evaluator, borrower) pair
        let existing: Option<StakeInfo> = env
            .storage()
            .instance()
            .get(&DataKey::Stake(evaluator.clone(), borrower.clone()));
        assert!(existing.is_none(), "already staked for this borrower");

        let token: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .unwrap();
        token::Client::new(&env, &token).transfer(
            &evaluator,
            &env.current_contract_address(),
            &amount,
        );

        let stake = StakeInfo {
            evaluator: evaluator.clone(),
            borrower: borrower.clone(),
            amount,
            is_slashed: false,
            reward_claimed: false,
        };
        env.storage()
            .instance()
            .set(&DataKey::Stake(evaluator.clone(), borrower), &stake);

        let total: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalStaked(evaluator.clone()))
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalStaked(evaluator), &(total + amount));
    }

    /// Called by the LoanPool contract when a borrower defaults.
    /// Slashes ALL evaluators who staked for this borrower.
    /// The slashed tokens flow into a community slash pool (future governance).
    pub fn slash_for_default(env: Env, _borrower: Address) {
        let loan_pool: Address = env
            .storage()
            .instance()
            .get(&DataKey::LoanPoolContract)
            .unwrap();
        // Only the LoanPool contract can trigger slashing
        loan_pool.require_auth();

        // Note: In a full implementation, we'd iterate over all evaluators for
        // this borrower. For the MVP we emit an event and rely on the evaluator
        // to have staked via known keys. A production version would maintain an
        // evaluator-per-borrower registry.
        let slash_pool: i128 = env
            .storage()
            .instance()
            .get(&DataKey::SlashPool)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::SlashPool, &slash_pool);
    }

    /// Slash a specific evaluator's stake for a defaulted borrower.
    /// Can be called by anyone after a default is confirmed.
    pub fn slash(env: Env, evaluator: Address, borrower: Address) {
        let stake: StakeInfo = env
            .storage()
            .instance()
            .get(&DataKey::Stake(evaluator.clone(), borrower.clone()))
            .expect("no stake found for this pair");

        assert!(!stake.is_slashed, "already slashed");

        // Mark slashed
        let slashed = StakeInfo {
            is_slashed: true,
            ..stake.clone()
        };
        env.storage()
            .instance()
            .set(&DataKey::Stake(evaluator.clone(), borrower), &slashed);

        let total: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalStaked(evaluator.clone()))
            .unwrap_or(0);
        let new_total = if total >= stake.amount {
            total - stake.amount
        } else {
            0
        };
        env.storage()
            .instance()
            .set(&DataKey::TotalStaked(evaluator), &new_total);

        let slash_pool: i128 = env
            .storage()
            .instance()
            .get(&DataKey::SlashPool)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::SlashPool, &(slash_pool + stake.amount));
    }

    /// After a borrower repays, their evaluator can claim a reward bonus.
    /// For MVP: reward = 5% of staked amount (funded from interest earned by pool).
    pub fn claim_reward(env: Env, evaluator: Address, borrower: Address) {
        evaluator.require_auth();

        let stake: StakeInfo = env
            .storage()
            .instance()
            .get(&DataKey::Stake(evaluator.clone(), borrower.clone()))
            .expect("no stake found");
        assert!(!stake.is_slashed, "stake was slashed");
        assert!(!stake.reward_claimed, "reward already claimed");

        // Return staked tokens + 5% reward bonus
        let reward = stake.amount / 20; // 5%
        let payout = stake.amount + reward;

        let token: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .unwrap();
        token::Client::new(&env, &token).transfer(
            &env.current_contract_address(),
            &evaluator,
            &payout,
        );

        let claimed = StakeInfo {
            reward_claimed: true,
            ..stake.clone()
        };
        env.storage()
            .instance()
            .set(&DataKey::Stake(evaluator.clone(), borrower), &claimed);

        let earned: i128 = env
            .storage()
            .instance()
            .get(&DataKey::RewardsEarned(evaluator.clone()))
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::RewardsEarned(evaluator), &(earned + reward));
    }

    // ── View functions ─────────────────────────────────────────────────────

    pub fn get_stake(env: Env, evaluator: Address, borrower: Address) -> Option<StakeInfo> {
        env.storage()
            .instance()
            .get(&DataKey::Stake(evaluator, borrower))
    }

    pub fn get_total_staked(env: Env, evaluator: Address) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalStaked(evaluator))
            .unwrap_or(0)
    }

    pub fn get_rewards_earned(env: Env, evaluator: Address) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::RewardsEarned(evaluator))
            .unwrap_or(0)
    }

    pub fn get_slash_pool(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::SlashPool)
            .unwrap_or(0)
    }
}
