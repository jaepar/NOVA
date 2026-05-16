package woorifisa.project.coreBanking.global.response;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import woorifisa.project.coreBanking.global.response.status.ResponseStatus;

@Getter
@JsonPropertyOrder({"success", "code", "message", "data"})
public class BaseErrorResponse implements ResponseStatus {

    private final boolean success;
    private final int code;
    private final String message;
    private final Object data;

    public BaseErrorResponse(ResponseStatus status) {
        this.success = status.getSuccess();
        this.code = status.getCode();
        this.message = status.getMessage();
        this.data = null;
    }

    public BaseErrorResponse(ResponseStatus status, String message) {
        this.success = status.getSuccess();
        this.code = status.getCode();
        this.message = message;
        this.data = null;
    }

    @Override
    public boolean getSuccess() {
        return success;
    }

    @Override
    public int getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }
}
