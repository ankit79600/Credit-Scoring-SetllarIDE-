#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, Env};

#[test]
fn test_submit_and_get_score() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let evaluator1 = Address::generate(&env);
    let evaluator2 = Address::generate(&env);

    // Submit scores for the user
    client.submit_score(&user, &750, &evaluator1);
    client.submit_score(&user, &820, &evaluator2);

    // Get all scores
    let scores = client.get_scores(&user);
    assert_eq!(scores.len(), 2);

    // Get evaluator count
    let count = client.get_evaluator_count(&user);
    assert_eq!(count, 2);

    // Get average score (750 + 820) / 2 = 785
    let avg = client.get_average_score(&user);
    assert_eq!(avg, 785);
}

#[test]
fn test_empty_scores() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);

    // Get scores for user with no evaluations
    let scores = client.get_scores(&user);
    assert_eq!(scores.len(), 0);

    let avg = client.get_average_score(&user);
    assert_eq!(avg, 0);

    let count = client.get_evaluator_count(&user);
    assert_eq!(count, 0);
}

#[test]
fn test_update_score_same_evaluator() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let evaluator = Address::generate(&env);

    // Submit initial score
    client.submit_score(&user, &700, &evaluator);

    // Update score from same evaluator
    client.submit_score(&user, &800, &evaluator);

    // Should still have 1 entry (updated, not added)
    let scores = client.get_scores(&user);
    assert_eq!(scores.len(), 1);

    // Average should be the new score
    let avg = client.get_average_score(&user);
    assert_eq!(avg, 800);
}

#[test]
fn test_multiple_evaluators_same_user() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let evaluator1 = Address::generate(&env);
    let evaluator2 = Address::generate(&env);
    let evaluator3 = Address::generate(&env);

    // Multiple evaluators submit scores
    client.submit_score(&user, &600, &evaluator1);
    client.submit_score(&user, &750, &evaluator2);
    client.submit_score(&user, &900, &evaluator3);

    let count = client.get_evaluator_count(&user);
    assert_eq!(count, 3);

    // Average: (600 + 750 + 900) / 3 = 750
    let avg = client.get_average_score(&user);
    assert_eq!(avg, 750);
}

#[test]
fn test_single_evaluator_score() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let evaluator = Address::generate(&env);

    client.submit_score(&user, &850, &evaluator);

    let scores = client.get_scores(&user);
    assert_eq!(scores.len(), 1);
    assert_eq!(client.get_average_score(&user), 850);
    assert_eq!(client.get_evaluator_count(&user), 1);
}
