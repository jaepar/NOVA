package woorifisa.project.backend.domain.wallet.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import woorifisa.project.backend.domain.wallet.dto.response.WalletTransactionsResponse;
import woorifisa.project.backend.domain.wallet.entity.Wallet;
import woorifisa.project.backend.domain.wallet.entity.WalletTransaction;
import woorifisa.project.backend.domain.wallet.repository.WalletRepository;
import woorifisa.project.backend.domain.wallet.repository.WalletTransactionRepository;
import woorifisa.project.backend.global.exception.CustomException;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.INVALID_PAGE_PARAM;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.INVALID_SIZE_PARAM;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_NOT_FOUND;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    @Transactional(readOnly = true)
    public WalletTransactionsResponse findWalletTransactions(Long userId, int page, int size) {
        // PageRequest 생성 전에 차단 — 잘못된 값은 IllegalArgumentException → 500으로 이어지므로 먼저 검증
        if (page < 0) throw new CustomException(INVALID_PAGE_PARAM);
        // size 상한(100)은 대량 조회로 인한 DB 부하 방지
        if (size < 1 || size > 100) throw new CustomException(INVALID_SIZE_PARAM);
        Wallet wallet = walletRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new CustomException(WALLET_NOT_FOUND));
        PageRequest pageable = PageRequest.of(page, size);
        // Slice 사용 — count 쿼리 없이 다음 페이지 존재 여부(hasNext)만 확인
        Slice<WalletTransaction> transactions = walletTransactionRepository
                .findAllByWallet_WalletIdOrderByCreatedAtDesc(wallet.getWalletId(), pageable);

        return WalletTransactionsResponse.from(wallet, transactions);
    }
}
