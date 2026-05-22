package woorifisa.project.coreBanking.global.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import woorifisa.project.coreBanking.global.response.status.ResponseStatus;

import static woorifisa.project.coreBanking.global.response.status.BaseResponseStatus.SUCCESS;

@Getter
@JsonPropertyOrder({"success", "code", "message", "data"})
public class BaseResponse<T> implements ResponseStatus {

    private final boolean success;
    private final String code;
    private final String message;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private final T data;

    public BaseResponse(T data) {
        this.success = true;
        this.code = SUCCESS.getCode();
        this.message = SUCCESS.getMessage();
        this.data = data;
    }

    public BaseResponse(ResponseStatus status, T data) {
        this.success = status.getSuccess();
        this.code = status.getCode();
        this.message = status.getMessage();
        this.data = data;
    }

    public static <T> BaseResponse<T> ok(T data) {
        return new BaseResponse<>(data);
    }

    public static <T> BaseResponse<T> of(ResponseStatus status, T data) {
        return new BaseResponse<>(status, data);
    }

    @Override
    public boolean getSuccess() {
        return success;
    }

    @Override
    public String getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }
}
