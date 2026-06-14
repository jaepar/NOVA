package woorifisa.project.coreBanking.domain.globalTransaction.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import woorifisa.project.coreBanking.domain.account.entity.Account;
import woorifisa.project.coreBanking.domain.account.repository.AccountRepository;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.AccountTransaction;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.enums.TransactionFlow;
import woorifisa.project.coreBanking.domain.accountTransaction.entity.enums.TransactionType;
import woorifisa.project.coreBanking.domain.accountTransaction.repository.AccountTransactionRepository;
import woorifisa.project.coreBanking.domain.customer.entity.Customer;
import woorifisa.project.coreBanking.domain.customer.repository.CustomerRepository;
import woorifisa.project.coreBanking.domain.globalTransaction.dto.request.CreateGlobalTransactionRequest;
import woorifisa.project.coreBanking.domain.globalTransaction.dto.response.CreateGlobalTransactionResponse;
import woorifisa.project.coreBanking.domain.globalTransaction.dto.response.GlobalTransactionListItemResponse;
import woorifisa.project.coreBanking.domain.globalTransaction.dto.response.GlobalTransactionStatusResponse;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.GlobalTransaction;
import woorifisa.project.coreBanking.domain.globalTransaction.entity.enums.GlobalTransactionStatus;
import woorifisa.project.coreBanking.domain.globalTransaction.repository.GlobalTransactionRepository;
import woorifisa.project.coreBanking.global.exception.CustomException;

import java.util.List;

import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.GLOBAL_TRANSACTION_ACCOUNT_NOT_FOUND;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.GLOBAL_TRANSACTION_CUSTOMER_NOT_FOUND;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.GLOBAL_TRANSACTION_INVALID_AMOUNT;
import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.GLOBAL_TRANSACTION_NOT_FOUND;

@Service
@Slf4j
@RequiredArgsConstructor
public class GlobalTransactionService {

    private static final String GLOBAL_REMITTANCE_COUNTERPARTY = "해외송금";

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final AccountTransactionRepository accountTransactionRepository;
    private final GlobalTransactionRepository globalTransactionRepository;
    private final GlobalTransactionFdsService globalTransactionFdsService;

    @Transactional
    public CreateGlobalTransactionResponse create(CreateGlobalTransactionRequest request) {
        log.info("Global transaction create requested externalRequestId={} customerId={} accountId={} targetCountry={} currency={} krwAmount={}",
                request.externalRequestId(), request.customerId(), request.accountId(),
                request.targetCountry(), request.currency(), request.krwAmount());
        return globalTransactionRepository.findByExternalRequestId(request.externalRequestId())
                .map(existing -> {
                    log.info("Global transaction idempotent hit externalRequestId={} globalTransactionId={} status={}",
                            request.externalRequestId(), existing.getGlobalTransactionId(), existing.getStatus());
                    return CreateGlobalTransactionResponse.from(existing);
                })
                .orElseGet(() -> createNew(request));
    }

    @Transactional(readOnly = true)
    public GlobalTransactionStatusResponse findStatus(Long globalTransactionId) {
        return globalTransactionRepository.findById(globalTransactionId)
                .map(GlobalTransactionStatusResponse::from)
                .orElseThrow(() -> new CustomException(GLOBAL_TRANSACTION_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public List<GlobalTransactionListItemResponse> findAllByCustomer(Long customerId) {
        return globalTransactionRepository.findAllByCustomer_CustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(GlobalTransactionListItemResponse::from)
                .toList();
    }

    private CreateGlobalTransactionResponse createNew(CreateGlobalTransactionRequest request) {
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new CustomException(GLOBAL_TRANSACTION_CUSTOMER_NOT_FOUND));
        Account account = accountRepository.findByAccountIdAndCustomer_CustomerId(
                        request.accountId(),
                        request.customerId()
                )
                .orElseThrow(() -> new CustomException(GLOBAL_TRANSACTION_ACCOUNT_NOT_FOUND));

        // 계좌 락을 잡은 뒤 한 번 더 조회해 동시 요청의 이중 차감을 막는다.
        return globalTransactionRepository.findByExternalRequestId(request.externalRequestId())
                .map(existing -> {
                    log.info("Global transaction idempotent hit after lock externalRequestId={} globalTransactionId={} status={}",
                            request.externalRequestId(), existing.getGlobalTransactionId(), existing.getStatus());
                    return CreateGlobalTransactionResponse.from(existing);
                })
                .orElseGet(() -> createAndScreen(request, customer, account));
    }

    private CreateGlobalTransactionResponse createAndScreen(
            CreateGlobalTransactionRequest request,
            Customer customer,
            Account account
    ) {
        int krwAmount = parseKrwAmount(request.krwAmount());
        log.info("Global transaction debit started externalRequestId={} accountId={} krwAmount={}",
                request.externalRequestId(), account.getAccountId(), krwAmount);

        account.debit(krwAmount);
        accountTransactionRepository.save(AccountTransaction.builder()
                .account(account)
                .transactionFlow(TransactionFlow.WITHDRAWAL)
                .transactionType(TransactionType.GLOBAL_REMITTANCE)
                .counterParty(GLOBAL_REMITTANCE_COUNTERPARTY)
                .amount(krwAmount)
                .balanceAfter(account.getBalance())
                .externalRequestId(request.externalRequestId())
                .build());

        GlobalTransaction globalTransaction;
        try {
            globalTransaction = globalTransactionRepository.save(GlobalTransaction.builder()
                    .customer(customer)
                    .account(account)
                    .remitPurpose(request.remitPurpose())
                    .targetCountry(request.targetCountry())
                    .currency(request.currency())
                    .remitAmount(request.remitAmount())
                    .mediaryFeePayer(request.mediaryFeePayer())
                    .exchangeRate(request.exchangeRate())
                    .krwAmount(request.krwAmount())
                    .senderEngName(request.senderEngName())
                    .senderPhone(request.senderPhone())
                    .senderAddressDetail(request.senderAddressDetail())
                    .senderDistrict(request.senderDistrict())
                    .senderCity(request.senderCity())
                    .senderZipCode(request.senderZipCode())
                    .senderCountry(request.senderCountry())
                    .receiverEngName(request.receiverEngName())
                    .receiverAddressDetail(request.receiverAddressDetail())
                    .receiverDistrict(request.receiverDistrict())
                    .receiverCity(request.receiverCity())
                    .receiverZipCode(request.receiverZipCode())
                    .receiverPhone(request.receiverPhone())
                    .swiftCode(request.swiftCode())
                    .receiverAccountNum(request.receiverAccountNum())
                    .routingNumber(request.routingNumber())
                    .bankName(request.bankName())
                    .remitReason(request.remitReason())
                    .externalRequestId(request.externalRequestId())
                    .status(GlobalTransactionStatus.PENDING)
                    .build());
        } catch (DataIntegrityViolationException exception) {
            log.warn("Global transaction duplicate detected on save externalRequestId={}", request.externalRequestId());
            return globalTransactionRepository.findByExternalRequestId(request.externalRequestId())
                    .map(existing -> {
                        log.info("Global transaction duplicate recovered externalRequestId={} globalTransactionId={} status={}",
                                request.externalRequestId(), existing.getGlobalTransactionId(), existing.getStatus());
                        return CreateGlobalTransactionResponse.from(existing);
                    })
                    .orElseThrow(() -> exception);
        }

        log.info("Global transaction created pending externalRequestId={} globalTransactionId={} customerId={} accountId={}",
                request.externalRequestId(), globalTransaction.getGlobalTransactionId(),
                customer.getCustomerId(), account.getAccountId());
        globalTransactionFdsService.screenAsync(globalTransaction.getGlobalTransactionId());
        return CreateGlobalTransactionResponse.from(globalTransaction);
    }

    private int parseKrwAmount(String krwAmount) {
        try {
            return Integer.parseInt(krwAmount);
        } catch (NumberFormatException exception) {
            log.warn("Global transaction invalid krwAmount={}", krwAmount);
            throw new CustomException(GLOBAL_TRANSACTION_INVALID_AMOUNT);
        }
    }
}
