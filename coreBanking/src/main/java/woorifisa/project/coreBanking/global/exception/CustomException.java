package woorifisa.project.coreBanking.global.exception;

import lombok.Getter;
import woorifisa.project.coreBanking.global.response.status.ResponseStatus;

@Getter
public class CustomException extends RuntimeException{
    private final ResponseStatus exceptionStatus;

    public CustomException(ResponseStatus exceptionStatus){
        super(exceptionStatus.getMessage());
        this.exceptionStatus=exceptionStatus;
    }
}
