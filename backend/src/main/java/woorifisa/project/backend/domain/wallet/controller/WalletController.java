package woorifisa.project.backend.domain.wallet.controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import woorifisa.project.backend.domain.wallet.dto.request.ChargeWalletRequest;
import woorifisa.project.backend.domain.wallet.service.WalletService;
import woorifisa.project.backend.global.exception.CustomException;
import woorifisa.project.backend.global.response.BaseResponse;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.UNAUTHORIZED;

@RestController
@RequiredArgsConstructor
@RequestMapping("/wallet")
public class WalletController {

    private final WalletService walletService;

    @PostMapping("/charges")
    public BaseResponse<Void> chargeWallet(
            HttpSession session,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody ChargeWalletRequest request
    ) {
        Long userId = getSessionUserId(session);
        walletService.chargeWallet(userId, idempotencyKey, request);
        return BaseResponse.ok(null);
    }

    private Long getSessionUserId(HttpSession session) {
        Object userId = session.getAttribute("userId");
        if (userId instanceof Long sessionUserId) {
            return sessionUserId;
        }
        if (userId instanceof Integer sessionUserId) {
            return sessionUserId.longValue();
        }
        throw new CustomException(UNAUTHORIZED);
    }
}
