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

    client.submit_score(&user, &750, &evaluator1);
    client.submit_score(&user, &820, &evaluator2);

    let scores = client.get_scores(&user);
    assert_eq!(scores.len(), 2);

    let count = client.get_evaluator_count(&user);
    assert_eq!(count, 2);

    // (750 + 820) / 2 = 785
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

    client.submit_score(&user, &700, &evaluator);
    client.submit_score(&user, &800, &evaluator);

    let scores = client.get_scores(&user);
    assert_eq!(scores.len(), 1);

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

    client.submit_score(&user, &600, &evaluator1);
    client.submit_score(&user, &750, &evaluator2);
    client.submit_score(&user, &900, &evaluator3);

    let count = client.get_evaluator_count(&user);
    assert_eq!(count, 3);

    // (600 + 750 + 900) / 3 = 750
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

#[test]
fn test_threshold_not_met() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let evaluator = Address::generate(&env);

    client.submit_score(&user, &800, &evaluator);

    // 1 evaluator, threshold is 3 — should return 0
    let avg = client.get_average_score_if_threshold(&user, &3);
    assert_eq!(avg, 0);
}

#[test]
fn test_threshold_met() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let e1 = Address::generate(&env);
    let e2 = Address::generate(&env);
    let e3 = Address::generate(&env);

    client.submit_score(&user, &600, &e1);
    client.submit_score(&user, &700, &e2);
    client.submit_score(&user, &800, &e3);

    // 3 evaluators, threshold is 3 — should return average (600+700+800)/3 = 700
    let avg = client.get_average_score_if_threshold(&user, &3);
    assert_eq!(avg, 700);
}

#[test]
fn test_get_min_max_score() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let e1 = Address::generate(&env);
    let e2 = Address::generate(&env);
    let e3 = Address::generate(&env);

    // No scores yet
    assert_eq!(client.get_min_score(&user), 0);
    assert_eq!(client.get_max_score(&user), 0);

    client.submit_score(&user, &400, &e1);
    client.submit_score(&user, &750, &e2);
    client.submit_score(&user, &900, &e3);

    assert_eq!(client.get_min_score(&user), 400);
    assert_eq!(client.get_max_score(&user), 900);
}

#[test]
fn test_has_evaluator() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let evaluator = Address::generate(&env);
    let other = Address::generate(&env);

    assert!(!client.has_evaluator(&user, &evaluator));

    client.submit_score(&user, &700, &evaluator);

    assert!(client.has_evaluator(&user, &evaluator));
    assert!(!client.has_evaluator(&user, &other));
}

#[test]
fn test_remove_score() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let e1 = Address::generate(&env);
    let e2 = Address::generate(&env);

    client.submit_score(&user, &700, &e1);
    client.submit_score(&user, &900, &e2);
    assert_eq!(client.get_evaluator_count(&user), 2);

    client.remove_score(&user, &e1);
    assert_eq!(client.get_evaluator_count(&user), 1);
    assert!(!client.has_evaluator(&user, &e1));
    assert!(client.has_evaluator(&user, &e2));
    assert_eq!(client.get_average_score(&user), 900);
}

#[test]
fn test_timestamp_recorded() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let evaluator = Address::generate(&env);

    client.submit_score(&user, &750, &evaluator);

    let scores = client.get_scores(&user);
    assert_eq!(scores.len(), 1);
    // Default test env timestamp is 0
    assert_eq!(scores.get(0).unwrap().timestamp, 0);
}
