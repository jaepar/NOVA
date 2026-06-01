package woorifisa.project.backend.global.exception.handler;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.converter.HttpMessageNotReadableException;
import woorifisa.project.backend.global.exception.CustomException;
import woorifisa.project.backend.global.response.BaseErrorResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.BAD_REQUEST;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.WALLET_CHARGE_IN_PROGRESS;

class GlobalControllerAdviceTest {

    private final GlobalControllerAdvice globalControllerAdvice = new GlobalControllerAdvice();

    @Test
    @DisplayName("커스텀 예외는 공통 에러 응답으로 변환한다")
    void customException() {
        BaseErrorResponse response = globalControllerAdvice.handleCustomException(
                new CustomException(WALLET_CHARGE_IN_PROGRESS)
        );

        assertThat(response.getSuccess()).isFalse();
        assertThat(response.getCode()).isEqualTo(WALLET_CHARGE_IN_PROGRESS.getCode());
        assertThat(response.getMessage()).isEqualTo(WALLET_CHARGE_IN_PROGRESS.getMessage());
    }

    @Test
    @DisplayName("읽을 수 없는 요청 본문은 공통 잘못된 요청 응답으로 변환한다")
    void badRequest() {
        BaseErrorResponse response = globalControllerAdvice.handle_BadRequest(
                new HttpMessageNotReadableException("invalid body", (HttpInputMessage) null)
        );

        assertThat(response.getSuccess()).isFalse();
        assertThat(response.getCode()).isEqualTo("40000");
        assertThat(response.getMessage()).isEqualTo(BAD_REQUEST.getMessage());
    }
}
