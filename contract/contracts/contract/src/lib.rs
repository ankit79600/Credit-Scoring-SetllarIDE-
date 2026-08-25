#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, Vec};

#[contracttype]
#[derive(Clone)]
pub struct ScoreEntry {
    pub evaluator: Address,
    pub score: u32,
    pub timestamp: u64,
}

#[contracttype]
pub enum DataKey {
    Scores(Address),
    Admin,
    // last submission ledger timestamp for (user, evaluator) pair
    LastSubmit(Address, Address),
}

// 24-hour cooldown between evaluator updates for the same user (in seconds)
const COOLDOWN_SECONDS: u64 = 86_400;

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    /// Set the contract admin. Must be called once after deployment.
    /// The declared admin must co-sign this transaction, preventing an attacker
    /// from front-running initialization with an address they don't control.
    pub fn initialize(env: Env, admin: Address) {
        assert!(
            !env.storage().instance().has(&DataKey::Admin),
            "already initialized"
        );
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().extend_ttl(518_400, 1_555_200);
    }

    /// Upgrade the contract WASM. Only the admin can call this.
    pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("not initialized");
        admin.require_auth();
        env.deployer().update_current_contract_wasm(new_wasm_hash);
    }

    /// Submit a credit score for a user. PERMISSIONLESS: anyone can evaluate anyone.
    /// If the same evaluator submits again, it updates the previous score.
    /// Rate-limited: an evaluator must wait 24 h between updates for the same user.
    pub fn submit_score(env: Env, user: Address, score: u32, evaluator: Address) {
        evaluator.require_auth();
        assert!(score <= 1000, "score must be 0-1000");

        let now = env.ledger().timestamp();

        // enforce cooldown for re-submissions (first submission is always allowed)
        let cooldown_key = DataKey::LastSubmit(user.clone(), evaluator.clone());
        let last_opt: Option<u64> = env.storage().instance().get(&cooldown_key);
        if let Some(last) = last_opt {
            assert!(
                now >= last + COOLDOWN_SECONDS,
                "cooldown: wait 24h between score updates"
            );
        }

        let key = DataKey::Scores(user.clone());
        let mut scores: Vec<ScoreEntry> = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or_else(|| Vec::new(&env));

        let mut found = false;
        for i in 0..scores.len() {
            if let Some(entry) = scores.get(i) {
                if entry.evaluator == evaluator {
                    scores.set(
                        i,
                        ScoreEntry {
                            evaluator: evaluator.clone(),
                            score,
                            timestamp: now,
                        },
                    );
                    found = true;
                    break;
                }
            }
        }

        if !found {
            scores.push_back(ScoreEntry {
                evaluator: evaluator.clone(),
                score,
                timestamp: now,
            });
        }

        env.storage().instance().set(&key, &scores);
        env.storage().instance().set(&cooldown_key, &now);
        // Extend TTL: at least 30 days, up to 90 days (at ~5s per ledger)
        env.storage().instance().extend_ttl(518_400, 1_555_200);
    }

    /// Get all score entries for a user
    pub fn get_scores(env: Env, user: Address) -> Vec<ScoreEntry> {
        let key = DataKey::Scores(user);
        env.storage()
            .instance()
            .get(&key)
            .unwrap_or_else(|| Vec::new(&env))
    }

    /// Get the number of unique evaluators who have submitted scores for a user
    pub fn get_evaluator_count(env: Env, user: Address) -> u32 {
        Self::get_scores(env, user).len()
    }

    /// Calculate the average credit score across all evaluators
    pub fn get_average_score(env: Env, user: Address) -> u32 {
        let scores = Self::get_scores(env, user);
        if scores.is_empty() {
            return 0;
        }
        let mut total: u64 = 0;
        for i in 0..scores.len() {
            if let Some(entry) = scores.get(i) {
                total += entry.score as u64;
            }
        }
        (total / scores.len() as u64) as u32
    }

    /// Get the lowest score submitted for a user. Returns 0 if no scores exist.
    pub fn get_min_score(env: Env, user: Address) -> u32 {
        let scores = Self::get_scores(env, user);
        if scores.is_empty() {
            return 0;
        }
        let mut min = u32::MAX;
        for i in 0..scores.len() {
            if let Some(entry) = scores.get(i) {
                if entry.score < min {
                    min = entry.score;
                }
            }
        }
        min
    }

    /// Get the highest score submitted for a user. Returns 0 if no scores exist.
    pub fn get_max_score(env: Env, user: Address) -> u32 {
        let scores = Self::get_scores(env, user);
        if scores.is_empty() {
            return 0;
        }
        let mut max = 0u32;
        for i in 0..scores.len() {
            if let Some(entry) = scores.get(i) {
                if entry.score > max {
                    max = entry.score;
                }
            }
        }
        max
    }

    /// Remove an evaluator's score for a user. Only the evaluator themselves can remove their score.
    pub fn remove_score(env: Env, user: Address, evaluator: Address) {
        evaluator.require_auth();
        let key = DataKey::Scores(user.clone());
        let mut scores: Vec<ScoreEntry> = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or_else(|| Vec::new(&env));

        let mut new_scores: Vec<ScoreEntry> = Vec::new(&env);
        for i in 0..scores.len() {
            if let Some(entry) = scores.get(i) {
                if entry.evaluator != evaluator {
                    new_scores.push_back(entry);
                }
            }
        }
        scores = new_scores;
        env.storage().instance().set(&key, &scores);
        env.storage().instance().extend_ttl(518_400, 1_555_200);
    }

    /// Check whether a specific evaluator has already submitted a score for a user.
    pub fn has_evaluator(env: Env, user: Address, evaluator: Address) -> bool {
        let scores = Self::get_scores(env, user);
        for i in 0..scores.len() {
            if let Some(entry) = scores.get(i) {
                if entry.evaluator == evaluator {
                    return true;
                }
            }
        }
        false
    }

    /// Returns the average score only if at least min_evaluators have submitted.
    /// Returns 0 if the threshold is not met (prevents single-evaluator gaming).
    pub fn get_average_score_if_threshold(env: Env, user: Address, min_evaluators: u32) -> u32 {
        let key = DataKey::Scores(user);
        let scores: Vec<ScoreEntry> = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or_else(|| Vec::new(&env));

        if scores.is_empty() || scores.len() < min_evaluators {
            return 0;
        }

        let mut total: u64 = 0;
        for i in 0..scores.len() {
            if let Some(entry) = scores.get(i) {
                total += entry.score as u64;
            }
        }
        (total / scores.len() as u64) as u32
    }
}

mod test;
