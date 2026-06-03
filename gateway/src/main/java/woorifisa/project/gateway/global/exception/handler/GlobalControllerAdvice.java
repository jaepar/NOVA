package woorifisa.project.gateway.global.exception.handler;

import static woorifisa.project.gateway.global.response.status.BaseExceptionResponseStatus.BAD_REQUEST;
import static woorifisa.project.gateway.global.response.status.BaseExceptionResponseStatus.GOVERNMENT_IDENTITY_REQUEST_INVALID;
import static woorifisa.project.gateway.global.response.status.BaseExceptionResponseStatus.INTERNAL_SERVER_ERROR;
import static woorifisa.project.gateway.global.response.status.BaseExceptionResponseStatus.NOT_FOUND;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import woorifisa.project.gateway.global.exception.CustomException;
import woorifisa.project.gateway.global.response.BaseErrorResponse;

@Slf4j
@RestControllerAdvice
public class GlobalControllerAdvice {

	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public BaseErrorResponse handleValidationException(MethodArgumentNotValidException exception) {
		String message = exception.getBindingResult().getFieldErrors().stream()
			.findFirst()
			.map(error -> error.getDefaultMessage() == null
				? GOVERNMENT_IDENTITY_REQUEST_INVALID.getMessage()
				: error.getDefaultMessage())
			.orElse(GOVERNMENT_IDENTITY_REQUEST_INVALID.getMessage());
		return new BaseErrorResponse(GOVERNMENT_IDENTITY_REQUEST_INVALID, message);
	}

	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ExceptionHandler({
		MethodArgumentTypeMismatchException.class,
		MissingServletRequestParameterException.class,
		MissingRequestHeaderException.class,
		HttpMessageNotReadableException.class
	})
	public BaseErrorResponse handleBadRequest(Exception exception) {
		log.warn("[handleBadRequest] reason={}", exception.getMessage());
		return new BaseErrorResponse(BAD_REQUEST);
	}

	@ResponseStatus(HttpStatus.NOT_FOUND)
	@ExceptionHandler(NoHandlerFoundException.class)
	public BaseErrorResponse handleNoHandlerFoundException(Exception exception) {
		log.warn("[handleNoHandlerFoundException] reason={}", exception.getMessage());
		return new BaseErrorResponse(NOT_FOUND);
	}

	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ExceptionHandler(CustomException.class)
	public BaseErrorResponse handleCustomException(CustomException exception) {
		return new BaseErrorResponse(exception.getExceptionStatus(), exception.getMessage());
	}

	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	@ExceptionHandler(RuntimeException.class)
	public BaseErrorResponse handleRuntimeException(Exception exception) {
		log.error("[handleRuntimeException]", exception);
		return new BaseErrorResponse(INTERNAL_SERVER_ERROR);
	}
}
