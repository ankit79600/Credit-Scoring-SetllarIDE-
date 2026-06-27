#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Vec};

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
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    /// Submit a credit score for a user. PERMISSIONLESS: anyone can evaluate anyone.
    /// If the same evaluator submits again, it updates the previous score.
    pub fn submit_score(env: Env, user: Address, score: u32, evaluator: Address) {
        evaluator.require_auth();
        assert!(score <= 1000, "score must be 0-1000");

        let key = DataKey::Scores(user.clone());
        let mut scores: Vec<ScoreEntry> = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or_else(|| Vec::new(&env));

        let timestamp = env.ledger().timestamp();
        let mut found = false;
        for i in 0..scores.len() {
            if let Some(entry) = scores.get(i) {
                if entry.evaluator == evaluator {
                    scores.set(
                        i,
                        ScoreEntry {
                            evaluator: evaluator.clone(),
                            score,
                            timestamp,
                        },
                    );
                    found = true;
                    break;
                }
            }
        }

        if !found {
            scores.push_back(ScoreEntry {
                evaluator,
                score,
                timestamp,
            });
        }

        env.storage().instance().set(&key, &scores);
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
