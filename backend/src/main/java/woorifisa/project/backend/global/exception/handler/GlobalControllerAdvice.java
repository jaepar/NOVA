package woorifisa.project.backend.global.exception.handler;

import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.hibernate.TypeMismatchException;
import org.springframework.http.HttpStatus;
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

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(CustomException.class)
    public BaseErrorResponse handleCustomException(CustomException e) {
        return new BaseErrorResponse(e.getExceptionStatus(), e.getMessage());
    }
}
