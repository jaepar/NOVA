package woorifisa.project.backend.domain.wallet.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import woorifisa.project.backend.domain.wallet.client.OnPremWalletClient;
import woorifisa.project.backend.domain.wallet.dto.request.DebitWalletAccountRequest;
import woorifisa.project.backend.domain.wallet.dto.response.WalletDebitLookupResponse;
import woorifisa.project.backend.domain.wallet.dto.response.WalletDebitResponse;
import woorifisa.project.backend.global.exception.CustomException;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_DEBIT_FAILED;

@Service
@RequiredArgsConstructor
public class WalletAccountDebitService {

    private static final String SUCCESS_CODE = "20000";

    private final OnPremWalletClient onPremWalletClient;

    public void debit(String walletChargeRequestId, Long customerId, Long withdrawAccountId, Integer chargeAmount) {
        DebitWalletAccountRequest debitRequest = new DebitWalletAccountRequest(
                walletChargeRequestId,
                customerId,
                withdrawAccountId,
                chargeAmount
        );

        try {
            validateDebitSuccess(onPremWalletClient.debitWalletAccount(debitRequest));
        } catch (ResourceAccessException exception) {
            try {
                // timeout처럼 결과가 불명확한 경우에만 On-Prem 처리 결과를 조회해 복구한다.
                validateLookupSuccess(
                        onPremWalletClient.findWalletDebitResult(walletChargeRequestId),
                        walletChargeRequestId
                );
            } catch (RestClientException lookupException) {
                throw new CustomException(WALLET_DEBIT_FAILED);
            }
        } catch (RestClientException exception) {
            throw new CustomException(WALLET_DEBIT_FAILED);
        }
    }

    private void validateDebitSuccess(WalletDebitResponse response) {
        if (response == null
                || !Boolean.TRUE.equals(response.success())
                || !SUCCESS_CODE.equals(response.code())) {
            throw new CustomException(WALLET_DEBIT_FAILED);
        }
    }

    private void validateLookupSuccess(WalletDebitLookupResponse response, String walletChargeRequestId) {
        if (response == null
                || !Boolean.TRUE.equals(response.success())
                || !SUCCESS_CODE.equals(response.code())
                || response.data() == null
                || !walletChargeRequestId.equals(response.data().externalRequestId())) {
            throw new CustomException(WALLET_DEBIT_FAILED);
        }
    }
}
