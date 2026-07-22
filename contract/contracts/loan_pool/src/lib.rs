#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, token,
    Address, Env, IntoVal, Symbol, Val, Vec,
};

// ── Constants ──────────────────────────────────────────────────────────────
/// ~1 week at 5s per ledger (7 * 24 * 3600 / 5 = 120,960)
const LOAN_DURATION_LEDGERS: u32 = 120_960;

// ── Types ──────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone)]
pub struct LoanInfo {
    pub borrower: Address,
    pub amount: i128,
    pub interest_amount: i128,
    pub due_ledger: u32,
    pub is_active: bool,
    pub is_defaulted: bool,
}

#[contracttype]
#[derive(Clone)]
pub struct PoolStats {
    pub total_deposits: i128,
    pub total_loans_outstanding: i128,
    pub available_liquidity: i128,
    pub total_interest_earned: i128,
    pub total_shares: i128,
}

#[contracttype]
pub enum DataKey {
    Admin,
    CreditScoreContract,
    TokenContract,
    ReputationStakeContract,
    MinCreditScore,
    InterestRateBps,
    MaxLoanAmount,
    Loan(Address),
    LpShares(Address),
    TotalShares,
    TotalDeposits,
    TotalLoans,
    TotalInterest,
}

// ── Helpers ────────────────────────────────────────────────────────────────

/// Cross-contract call to the CreditScore contract.
/// Returns the average score (0-1000) for the given user.
fn get_avg_score(env: &Env, credit_contract: &Address, user: &Address) -> u32 {
    // "get_average_score" is >9 chars so we use Symbol::new instead of symbol_short!
    let func = Symbol::new(env, "get_average_score");
    let user_val: Val = user.clone().into_val(env);
    let mut args: Vec<Val> = Vec::new(env);
    args.push_back(user_val);
    env.invoke_contract(credit_contract, &func, args)
}

// ── Contract ───────────────────────────────────────────────────────────────

#[contract]
pub struct LoanPool;

#[contractimpl]
impl LoanPool {
    // ── Admin ──────────────────────────────────────────────────────────────

    /// Initialize the pool once.
    /// - `token_contract`: a SEP-41 compatible token (e.g. wrapped XLM or test USDC)
    /// - `interest_rate_bps`: annual interest in basis points (e.g. 1000 = 10%)
    /// - `max_loan_amount`: maximum single loan size in token stroops
    pub fn initialize(
        env: Env,
        admin: Address,
        credit_score_contract: Address,
        token_contract: Address,
        min_credit_score: u32,
        interest_rate_bps: u32,
        max_loan_amount: i128,
    ) {
        admin.require_auth();
        assert!(
            !env.storage().instance().has(&DataKey::Admin),
            "already initialized"
        );
        assert!(interest_rate_bps <= 10_000, "rate cannot exceed 100%");

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::CreditScoreContract, &credit_score_contract);
        env.storage()
            .instance()
            .set(&DataKey::TokenContract, &token_contract);
        env.storage()
            .instance()
            .set(&DataKey::MinCreditScore, &min_credit_score);
        env.storage()
            .instance()
            .set(&DataKey::InterestRateBps, &interest_rate_bps);
        env.storage()
            .instance()
            .set(&DataKey::MaxLoanAmount, &max_loan_amount);

        env.storage().instance().set(&DataKey::TotalShares, &0i128);
        env.storage().instance().set(&DataKey::TotalDeposits, &0i128);
        env.storage().instance().set(&DataKey::TotalLoans, &0i128);
        env.storage().instance().set(&DataKey::TotalInterest, &0i128);
    }

    /// Admin sets the ReputationStake contract address after deployment
    /// (avoids circular dependency at initialization time).
    pub fn set_reputation_stake(env: Env, reputation_stake_contract: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage()
            .instance()
            .set(&DataKey::ReputationStakeContract, &reputation_stake_contract);
    }

    // ── Liquidity Provider flows ───────────────────────────────────────────

    /// LP deposits tokens into the pool and receives proportional shares.
    pub fn deposit(env: Env, depositor: Address, amount: i128) {
        depositor.require_auth();
        assert!(amount > 0, "amount must be positive");

        let token: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .unwrap();
        token::Client::new(&env, &token).transfer(
            &depositor,
            &env.current_contract_address(),
            &amount,
        );

        // Mint LP shares: first deposit gets 1:1, subsequent deposits are
        // proportional to their fraction of the pool.
        let total_shares: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalShares)
            .unwrap_or(0);
        let total_deposits: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalDeposits)
            .unwrap_or(0);

        let new_shares = if total_shares == 0 || total_deposits == 0 {
            amount
        } else {
            // new_shares / total_shares = amount / total_deposits
            amount
                .checked_mul(total_shares)
                .unwrap()
                .checked_div(total_deposits)
                .unwrap()
        };

        let current_shares: i128 = env
            .storage()
            .instance()
            .get(&DataKey::LpShares(depositor.clone()))
            .unwrap_or(0);

        env.storage()
            .instance()
            .set(&DataKey::LpShares(depositor), &(current_shares + new_shares));
        env.storage()
            .instance()
            .set(&DataKey::TotalShares, &(total_shares + new_shares));
        env.storage()
            .instance()
            .set(&DataKey::TotalDeposits, &(total_deposits + amount));
    }

    /// LP withdraws by burning `shares`, receiving their pro-rata token value.
    pub fn withdraw(env: Env, depositor: Address, shares: i128) {
        depositor.require_auth();
        assert!(shares > 0, "shares must be positive");

        let current_shares: i128 = env
            .storage()
            .instance()
            .get(&DataKey::LpShares(depositor.clone()))
            .unwrap_or(0);
        assert!(current_shares >= shares, "insufficient shares");

        let total_shares: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalShares)
            .unwrap();
        let total_deposits: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalDeposits)
            .unwrap();

        let withdraw_amount = shares
            .checked_mul(total_deposits)
            .unwrap()
            .checked_div(total_shares)
            .unwrap();

        let total_loans: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalLoans)
            .unwrap_or(0);
        let available = total_deposits - total_loans;
        assert!(available >= withdraw_amount, "insufficient liquidity");

        env.storage()
            .instance()
            .set(&DataKey::LpShares(depositor.clone()), &(current_shares - shares));
        env.storage()
            .instance()
            .set(&DataKey::TotalShares, &(total_shares - shares));
        env.storage()
            .instance()
            .set(&DataKey::TotalDeposits, &(total_deposits - withdraw_amount));

        let token: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .unwrap();
        token::Client::new(&env, &token).transfer(
            &env.current_contract_address(),
            &depositor,
            &withdraw_amount,
        );
    }

    // ── Borrower flows ─────────────────────────────────────────────────────

    /// Borrower requests a loan. Performs a cross-contract call to the
    /// CreditScore contract to gate eligibility (score ≥ min_credit_score).
    pub fn borrow(env: Env, borrower: Address, amount: i128) {
        borrower.require_auth();
        assert!(amount > 0, "amount must be positive");

        let max_loan: i128 = env
            .storage()
            .instance()
            .get(&DataKey::MaxLoanAmount)
            .unwrap();
        assert!(amount <= max_loan, "exceeds max loan size");

        // No concurrent active loans
        let existing: Option<LoanInfo> = env
            .storage()
            .instance()
            .get(&DataKey::Loan(borrower.clone()));
        if let Some(loan) = existing {
            assert!(!loan.is_active, "existing active loan must be repaid first");
        }

        // ── Cross-contract call: credit eligibility check ──────────────────
        let credit_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::CreditScoreContract)
            .unwrap();
        let min_score: u32 = env
            .storage()
            .instance()
            .get(&DataKey::MinCreditScore)
            .unwrap();

        let avg_score = get_avg_score(&env, &credit_contract, &borrower);
        assert!(avg_score >= min_score, "credit score below minimum threshold");

        // Pool liquidity check
        let total_deposits: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalDeposits)
            .unwrap_or(0);
        let total_loans: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalLoans)
            .unwrap_or(0);
        assert!(
            total_deposits - total_loans >= amount,
            "insufficient pool liquidity"
        );

        // Pre-compute interest so repayment is deterministic
        let rate_bps: u32 = env
            .storage()
            .instance()
            .get(&DataKey::InterestRateBps)
            .unwrap();
        let interest = amount
            .checked_mul(rate_bps as i128)
            .unwrap()
            .checked_div(10_000)
            .unwrap();

        let loan = LoanInfo {
            borrower: borrower.clone(),
            amount,
            interest_amount: interest,
            due_ledger: env.ledger().sequence() + LOAN_DURATION_LEDGERS,
            is_active: true,
            is_defaulted: false,
        };

        env.storage()
            .instance()
            .set(&DataKey::Loan(borrower.clone()), &loan);
        env.storage()
            .instance()
            .set(&DataKey::TotalLoans, &(total_loans + amount));

        // Disburse principal to borrower
        let token: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .unwrap();
        token::Client::new(&env, &token).transfer(
            &env.current_contract_address(),
            &borrower,
            &amount,
        );
    }

    /// Borrower repays principal + interest. Any overpayment is returned.
    pub fn repay(env: Env, borrower: Address) {
        borrower.require_auth();

        let loan: LoanInfo = env
            .storage()
            .instance()
            .get(&DataKey::Loan(borrower.clone()))
            .expect("no loan found for this address");
        assert!(loan.is_active, "no active loan to repay");

        let total_owed = loan.amount + loan.interest_amount;

        // Pull repayment from borrower
        let token: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .unwrap();
        token::Client::new(&env, &token).transfer(
            &borrower,
            &env.current_contract_address(),
            &total_owed,
        );

        // Mark loan closed
        let closed_loan = LoanInfo {
            is_active: false,
            ..loan.clone()
        };
        env.storage()
            .instance()
            .set(&DataKey::Loan(borrower), &closed_loan);

        let total_loans: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalLoans)
            .unwrap_or(0);
        let total_interest: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalInterest)
            .unwrap_or(0);
        let total_deposits: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalDeposits)
            .unwrap_or(0);

        env.storage()
            .instance()
            .set(&DataKey::TotalLoans, &(total_loans - loan.amount));
        env.storage()
            .instance()
            .set(&DataKey::TotalInterest, &(total_interest + loan.interest_amount));
        // Interest accrues to the pool, growing LP share value
        env.storage()
            .instance()
            .set(&DataKey::TotalDeposits, &(total_deposits + loan.interest_amount));
    }

    /// Anyone can call `liquidate` on an overdue loan.
    /// The evaluators who vouched for this borrower will be slashed via
    /// the ReputationStake contract.
    pub fn liquidate(env: Env, borrower: Address) {
        let loan: LoanInfo = env
            .storage()
            .instance()
            .get(&DataKey::Loan(borrower.clone()))
            .expect("no loan found");
        assert!(loan.is_active, "loan is not active");
        assert!(
            env.ledger().sequence() > loan.due_ledger,
            "loan is not yet overdue"
        );

        // Mark defaulted
        let defaulted = LoanInfo {
            is_active: false,
            is_defaulted: true,
            ..loan.clone()
        };
        env.storage()
            .instance()
            .set(&DataKey::Loan(borrower.clone()), &defaulted);

        let total_loans: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalLoans)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalLoans, &(total_loans - loan.amount));

        // Cross-contract call: slash evaluators who vouched for this borrower
        let stake_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::ReputationStakeContract)
            .unwrap();
        let func = Symbol::new(&env, "slash_for_default");
        let borrower_val: Val = borrower.clone().into_val(&env);
        let mut args: Vec<Val> = Vec::new(&env);
        args.push_back(borrower_val);
        let _: () = env.invoke_contract(&stake_contract, &func, args);
    }

    // ── View functions ─────────────────────────────────────────────────────

    pub fn get_loan(env: Env, borrower: Address) -> Option<LoanInfo> {
        env.storage()
            .instance()
            .get(&DataKey::Loan(borrower))
    }

    pub fn get_lp_shares(env: Env, depositor: Address) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::LpShares(depositor))
            .unwrap_or(0)
    }

    pub fn get_pool_stats(env: Env) -> PoolStats {
        let total_deposits: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalDeposits)
            .unwrap_or(0);
        let total_loans: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalLoans)
            .unwrap_or(0);
        let total_interest: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalInterest)
            .unwrap_or(0);
        let total_shares: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalShares)
            .unwrap_or(0);

        PoolStats {
            total_deposits,
            total_loans_outstanding: total_loans,
            available_liquidity: total_deposits - total_loans,
            total_interest_earned: total_interest,
            total_shares,
        }
    }

    pub fn get_min_credit_score(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::MinCreditScore)
            .unwrap_or(0)
    }

    pub fn get_max_loan_amount(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::MaxLoanAmount)
            .unwrap_or(0)
    }

    pub fn get_interest_rate_bps(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::InterestRateBps)
            .unwrap_or(0)
    }
}
