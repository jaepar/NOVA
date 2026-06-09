package woorifisa.project.coreBanking.domain.accountTransaction.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.TransactionFlowFilter;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.response.AccountTransactionRequestLookupResponse;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.response.AccountTransactionsResponse;
import woorifisa.project.coreBanking.domain.accountTransaction.repository.AccountTransactionRepository;
import woorifisa.project.coreBanking.global.exception.CustomException;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.ACCOUNT_TRANSACTION_ACCOUNT_NOT_FOUND;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.ACCOUNT_TRANSACTION_NOT_FOUND;
import org.springframework.dao.DataIntegrityViolationException;
import woorifisa.project.coreBanking.domain.account.entity.Account;
import woorifisa.project.coreBanking.domain.account.repository.AccountRepository;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.UpdateTransactionMemoRequest;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.TransferAccountRequest;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.enums.TransactionFlow;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.enums.TransactionType;
import woorifisa.project.coreBanking.domain.accountTransaction.dto.request.DebitWalletAccountRequest;

import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.WALLET_ACCOUNT_DEBIT_CONFLICT;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.WALLET_ACCOUNT_DEBIT_INSUFFICIENT_BALANCE;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.WALLET_ACCOUNT_DEBIT_INVALID_REQUEST;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.WALLET_ACCOUNT_DEBIT_NOT_FOUND;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.ACCOUNT_TRANSFER_CONFLICT;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.ACCOUNT_TRANSFER_DEPOSIT_ACCOUNT_NOT_FOUND;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.ACCOUNT_TRANSFER_INSUFFICIENT_BALANCE;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.ACCOUNT_TRANSFER_WITHDRAW_ACCOUNT_NOT_FOUND;

@Service
@RequiredArgsConstructor
public class AccountTransactionService {

    private final AccountRepository accountRepository;
    private final AccountTransactionRepository accountTransactionRepository;

    private static final String WALLET_CHARGE_COUNTERPARTY = "월렛 충전";

    // 이체·충전 요청이 원장에 기록됐는지 확인해 처리 완료 여부를 반환한다.
    @Transactional(readOnly = true)
    public AccountTransactionRequestLookupResponse findRequestResult(String externalRequestId) {
        if (!accountTransactionRepository.existsByExternalRequestId(externalRequestId)) {
            throw new CustomException(ACCOUNT_TRANSACTION_NOT_FOUND);
        }
        return AccountTransactionRequestLookupResponse.of(externalRequestId);
    }

    @Transactional
    public void updateMemo(Long transactionId, UpdateTransactionMemoRequest request) {
        AccountTransaction transaction = accountTransactionRepository
                .findById(transactionId)
                .orElseThrow(() -> new CustomException(ACCOUNT_TRANSACTION_NOT_FOUND));

        transaction.updateMemo(request.normalizedMemo());
    }

    @Transactional
    public void debitWalletCharge(DebitWalletAccountRequest request) {
        if (isInvalidRequest(request)) {
            throw new CustomException(WALLET_ACCOUNT_DEBIT_INVALID_REQUEST);
        }

        // 이미 처리된 충전 요청이면 계좌를 다시 차감하지 않고 멱등 성공으로 응답한다.
        if (accountTransactionRepository.existsByExternalRequestId(request.walletChargeRequestId())) {
            return;
        }

        Account account = accountRepository.findByAccountIdAndCustomer_CustomerId(
                request.withdrawAccountId(),
                request.customerId()
        ).orElseThrow(() -> new CustomException(WALLET_ACCOUNT_DEBIT_NOT_FOUND));

        // 계좌 락 획득 이후 한 번 더 확인해 동시 중복 요청의 이중 차감을 방지한다.
        if (accountTransactionRepository.existsByExternalRequestId(request.walletChargeRequestId())) {
            return;
        }

        int chargeAmount = request.chargeAmount();
        if (account.getBalance() < chargeAmount) {
            throw new CustomException(WALLET_ACCOUNT_DEBIT_INSUFFICIENT_BALANCE);
        }
        int balanceAfter = account.getBalance() - chargeAmount;

        // 계좌 차감과 거래내역 저장은 같은 트랜잭션 안에서 확정한다.
        try {
            accountTransactionRepository.save(AccountTransaction.builder()
                    .account(account)
                    .transactionFlow(TransactionFlow.WITHDRAWAL)
                    .transactionType(TransactionType.WALLET_CHARGE)
                    .counterParty(WALLET_CHARGE_COUNTERPARTY)
                    .amount(chargeAmount)
                    .balanceAfter(balanceAfter)
                    .externalRequestId(request.walletChargeRequestId())
                    .build());
        } catch (DataIntegrityViolationException exception) {
            if (accountTransactionRepository.existsByExternalRequestId(request.walletChargeRequestId())) {
                return;
            }
            throw new CustomException(WALLET_ACCOUNT_DEBIT_CONFLICT);
        }

        account.debit(chargeAmount);

    }

    @Transactional
    public void transfer(TransferAccountRequest request) {
        // 거래 고유 식별자가 테이블에 이미 있다면(계좌 이체 로직을 이미 처리한 것) 성공 응답
        if (accountTransactionRepository.existsByExternalRequestId(request.externalRequestId())) {
            return;
        }

        // 출금 계좌를 찾는 로직 -> 해당 계좌에 Lock을 걸음
        Account withdrawAccount = accountRepository.findByAccountNumber(request.withdrawAccountId())
                .orElseThrow(() -> new CustomException(ACCOUNT_TRANSFER_WITHDRAW_ACCOUNT_NOT_FOUND));

        // 출금 계좌 락 대기 중 다른 요청이 동일 externalRequestId를 먼저 처리했을 수 있어, 락 획득 직후 멱등성 재확인
        if (accountTransactionRepository.existsByExternalRequestId(request.externalRequestId())) {
            return;
        }

        // 입금 계좌 db 조회
        Account depositAccount = accountRepository.findByAccountNumber(request.depositAccountId())
                .orElseThrow(() -> new CustomException(ACCOUNT_TRANSFER_DEPOSIT_ACCOUNT_NOT_FOUND));

        // 이체 금액이 출금 계좌 잔액보다 큰 경우
        if (withdrawAccount.getBalance() < request.transferAmount()) {
            throw new CustomException(ACCOUNT_TRANSFER_INSUFFICIENT_BALANCE);
        }
        int withdrawBalanceAfter = withdrawAccount.getBalance() - request.transferAmount();
        int depositBalanceAfter = depositAccount.getBalance() + request.transferAmount();

        try {
			// 출금 계좌의 거래 내역 저장
			accountTransactionRepository.save(AccountTransaction.builder()
				.account(withdrawAccount)
				.transactionFlow(TransactionFlow.WITHDRAWAL)
				.transactionType(TransactionType.ACCOUNT_TRANSFER)
				.counterParty(depositAccount.getCustomer().getName())
				.amount(request.transferAmount())
				.balanceAfter(withdrawBalanceAfter)
				.externalRequestId(request.externalRequestId())
				.build());

			// 입금 계좌의 거래 내역 저장
			accountTransactionRepository.save(AccountTransaction.builder()
				.account(depositAccount)
				.transactionFlow(TransactionFlow.DEPOSIT)
				.transactionType(TransactionType.ACCOUNT_TRANSFER)
				.counterParty(withdrawAccount.getCustomer().getName())
				.amount(request.transferAmount())
				.balanceAfter(depositBalanceAfter)
				.externalRequestId(request.externalRequestId())
				.build());
        } catch (DataIntegrityViolationException exception) {
            // 동시 요청으로 다른 트랜잭션이 먼저 같은 externalRequestId를 저장한 경우 발생하는 예외 처리
            if (accountTransactionRepository.existsByExternalRequestId(request.externalRequestId())) {
                return;
            }
            throw new CustomException(ACCOUNT_TRANSFER_CONFLICT);
        }

        withdrawAccount.debit(request.transferAmount());
        depositAccount.credit(request.transferAmount());
    }

    // 계좌의 기간, 입출금 유형, 검색어, 정렬 조건에 맞는 거래내역을 페이징 조회한다.
    @Transactional(readOnly = true)
    public AccountTransactionsResponse findTransactions(
            Long accountId,
            LocalDate from,
            LocalDate to,
            TransactionFlowFilter flow,
            String keyword,
            Sort.Direction sortDirection,
            int page,
            int size
    ) {
        if (!accountRepository.existsById(accountId)) {
            throw new CustomException(ACCOUNT_TRANSACTION_ACCOUNT_NOT_FOUND);
        }

        // 종료일 전체를 포함하기 위해 다음날 00:00을 상한으로 만들고 Repository에서 미만(<) 조건으로 조회한다.
        LocalDateTime fromDateTime = from.atStartOfDay();
        LocalDateTime toDateTime = to.plusDays(1).atStartOfDay();

        // 무한 스크롤 응답이므로 Page가 아닌 Slice를 조회하고, 정렬 방향만 요청값에 맞춰 적용한다.
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(normalizeSortDirection(sortDirection), "createdAt"));
        TransactionFlow transactionFlow = flow == TransactionFlowFilter.ALL ? null : TransactionFlow.valueOf(flow.name());
        String normalizedKeyword = normalizeKeyword(keyword);

        // 입출금 유형과 검색어 조건을 함께 적용해 거래내역을 조회한다.
        Slice<AccountTransaction> transactions = accountTransactionRepository.findTransactions(
                accountId,
                transactionFlow,
                normalizedKeyword,
                fromDateTime,
                toDateTime,
                pageRequest
        );

        return AccountTransactionsResponse.of(accountId, transactions);
    }

    private Sort.Direction normalizeSortDirection(Sort.Direction sortDirection) {
        return sortDirection == null ? Sort.Direction.DESC : sortDirection;
    }

    // 공백 검색어는 전체 조회와 동일하게 처리한다.
    private String normalizeKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }
        return keyword.trim();
    }

    private boolean isInvalidRequest(DebitWalletAccountRequest request) {
        return request.walletChargeRequestId() == null
                || request.walletChargeRequestId().isBlank()
                || request.customerId() == null
                || request.withdrawAccountId() == null
                || request.chargeAmount() == null
                || request.chargeAmount() <= 0;
    }
}
