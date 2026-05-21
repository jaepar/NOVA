package woorifisa.project.backend.global.exception.handler;

import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.hibernate.TypeMismatchException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;
import woorifisa.project.backend.global.exception.CustomException;
import woorifisa.project.backend.global.response.BaseErrorResponse;

import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.*;

@Slf4j
@RestControllerAdvice
public class GlobalControllerAdvice {

    // 잘못된 요청일 경우
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler({BadRequestException.class, TypeMismatchException.class, MethodArgumentNotValidException.class, MissingServletRequestParameterException.class})
    public BaseErrorResponse handle_BadRequest(Exception e){
        log.error("[handle_BadRequest]", e);
        return new BaseErrorResponse(BAD_REQUEST);
    }

    // 요청한 api가 없을 경우
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(NoHandlerFoundException.class)
    public BaseErrorResponse handle_NoHandlerFoundException(Exception e){
        log.error("[handle_NoHandlerFoundException]", e);
        return new BaseErrorResponse(NOT_FOUND);
    }

    // 런타임 오류가 발생한 경우
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(RuntimeException.class)
    public BaseErrorResponse handle_RuntimeException(Exception e) {
        log.error("[handle_RuntimeException]", e);
        return new BaseErrorResponse(INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<BaseErrorResponse> handleCustomException(CustomException e) {
        return ResponseEntity
                .status(resolveHttpStatus(e.getExceptionStatus().getCode()))
                .body(new BaseErrorResponse(e.getExceptionStatus(), e.getMessage()));
    }

    private HttpStatus resolveHttpStatus(int code) {
        if (code == WALLET_DEBIT_FAILED.getCode()) {
            return HttpStatus.BAD_GATEWAY;
        }
        if (code >= 40100 && code < 40200) {
            return HttpStatus.UNAUTHORIZED;
        }
        if (code >= 40400 && code < 40500) {
            return HttpStatus.NOT_FOUND;
        }
        if (code >= 40000 && code < 50000) {
            return HttpStatus.BAD_REQUEST;
        }
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
}
