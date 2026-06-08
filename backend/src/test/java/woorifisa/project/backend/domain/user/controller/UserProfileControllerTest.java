package woorifisa.project.backend.domain.user.controller;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import woorifisa.project.backend.domain.user.dto.response.UserProfileResponse;
import woorifisa.project.backend.domain.user.service.IdentityVerificationService;
import woorifisa.project.backend.domain.user.service.NotificationService;
import woorifisa.project.backend.domain.user.service.UserService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.response.BaseResponse;

@ExtendWith(MockitoExtension.class)
class UserProfileControllerTest {

	@Mock
	private UserService userService;

	@Mock
	private NotificationService notificationService;

	@Mock
	private IdentityVerificationService identityVerificationService;

	@Test
	@DisplayName("returns authenticated user's profile")
	void getUserProfileReturnsAuthenticatedUserProfile() {
		UserController controller = new UserController(userService, notificationService, identityVerificationService);
		UserProfileResponse payload = new UserProfileResponse(
			"Minjeong Kim",
			"minjeong@email.com",
			"2000.05.20",
			"FEMALE",
			true,
			"ISSUED",
			List.of(new UserProfileResponse.PortfolioResponse(10L, "nurse_resume.pdf"))
		);

		when(userService.getUserProfile(1L)).thenReturn(payload);

		BaseResponse<UserProfileResponse> response = controller.getUserProfile(new SessionUserPrincipal(1L));

		assertThat(response.getSuccess()).isTrue();
		assertThat(response.getCode()).isEqualTo("20000");
		assertThat(response.getData()).isEqualTo(payload);
		verify(userService).getUserProfile(1L);
	}
}
