package woorifisa.project.backend.global.exception;

import lombok.Getter;
import woorifisa.project.backend.global.response.status.ResponseStatus;

@Getter
public class CustomException extends RuntimeException{
    private final ResponseStatus exceptionStatus;

    public CustomException(ResponseStatus exceptionStatus){
        super(exceptionStatus.getMessage());
        this.exceptionStatus=exceptionStatus;
    }
}
