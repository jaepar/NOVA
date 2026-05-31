package woorifisa.project.backend.global.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;
import woorifisa.project.backend.global.auth.security.SessionAuthenticationEntryPoint;
import woorifisa.project.backend.global.auth.security.SessionAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

	private final SessionAuthenticationFilter sessionAuthenticationFilter;
	private final SessionAuthenticationEntryPoint sessionAuthenticationEntryPoint;

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
			.cors(cors -> cors.configurationSource(corsConfigurationSource()))
			.csrf(AbstractHttpConfigurer::disable)
			.formLogin(AbstractHttpConfigurer::disable)
			.httpBasic(AbstractHttpConfigurer::disable)
			.anonymous(AbstractHttpConfigurer::disable)
			.exceptionHandling(exception -> exception
				.authenticationEntryPoint(sessionAuthenticationEntryPoint)
			)
			.authorizeHttpRequests(auth -> auth
				.requestMatchers(
					"/auth/login",
					"/auth/signup",
					"/auth/email-verifications/**"
				).permitAll()
				.requestMatchers(
					"/wallet/**",
					"/users/**",
					"/banking/**",
					"/hospital/**",
					"/auth/logout",
					"/auth/me"
				).authenticated()
				.anyRequest().permitAll()
			)
			.addFilterBefore(sessionAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();

		configuration.setAllowedOrigins(List.of(
			"http://localhost:5173",
			"https://test-server-ten-gamma.vercel.app"
		));

		configuration.setAllowedMethods(List.of(
			"GET",
			"POST",
			"PUT",
			"PATCH",
			"DELETE",
			"OPTIONS"
		));

		configuration.setAllowedHeaders(List.of("*"));
		configuration.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source =
			new UrlBasedCorsConfigurationSource();

		source.registerCorsConfiguration("/**", configuration);

		return source;
	}
}
