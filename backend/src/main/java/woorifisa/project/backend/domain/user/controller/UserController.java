package woorifisa.project.backend.domain.user.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import woorifisa.project.backend.domain.user.service.UserService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.response.BaseResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @PostMapping(value = "/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BaseResponse<Void> uploadDocuments(
            @AuthenticationPrincipal SessionUserPrincipal principal,
            @RequestPart("residenceVerificationPdf") MultipartFile residenceVerificationPdf,
            @RequestPart("alienRegistrationApplicationPdf") MultipartFile alienRegistrationApplicationPdf
    ) {
        userService.uploadDocuments(principal.userId(), residenceVerificationPdf, alienRegistrationApplicationPdf);
        return BaseResponse.ok(null);
    }
}
