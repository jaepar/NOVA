package woorifisa.project.backend.domain.auth.session.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import woorifisa.project.backend.domain.auth.session.interceptor.SessionAuthInterceptor;
import woorifisa.project.backend.domain.auth.session.resolver.LoginUserIdArgumentResolver;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SessionWebMvcConfig implements WebMvcConfigurer {

    private final LoginUserIdArgumentResolver loginUserIdArgumentResolver;
    private final SessionAuthInterceptor sessionAuthInterceptor;

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(loginUserIdArgumentResolver);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(sessionAuthInterceptor)
                .addPathPatterns(
                        "/wallet/**",
                        "/users/**",
                        "/banking/**",
                        "/hospital/**"
                )
                .excludePathPatterns(
                        "/auth/login",
                        "/auth/signup",
                        "/auth/email-verifications/**"
                );
    }
}
