package woorifisa.project.backend.global.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import woorifisa.project.backend.domain.user.entity.enums.Gender;

public record SignupRequest(
        @NotBlank
        @Email
        String email,

        @NotBlank
        String password,

        @NotBlank
        String passwordConfirm,

        @NotBlank
        String name,

        @NotBlank
        @Pattern(regexp = "\\d{6}")
        String birth,

        @NotNull
        Gender gender
) {
}
