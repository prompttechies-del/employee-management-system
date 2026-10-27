package com.ems.config;

import org.springframework.context.annotation.Bean;
import jakarta.servlet.DispatcherType;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

/**
 * Single admin account. Credentials come from EMS_ADMIN_USER (default "admin")
 * and EMS_ADMIN_PASSWORD (required). CSRF protection is on by default.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder encoder) {
        String user = System.getenv().getOrDefault("EMS_ADMIN_USER", "admin");
        String pass = System.getenv("EMS_ADMIN_PASSWORD");
        if (pass == null || pass.length() < 8) {
            throw new IllegalStateException("EMS_ADMIN_PASSWORD must be set (min 8 characters)");
        }
        return new InMemoryUserDetailsManager(
                User.withUsername(user).password(encoder.encode(pass)).roles("ADMIN").build());
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(a -> a
                .dispatcherTypeMatchers(DispatcherType.FORWARD, DispatcherType.ERROR).permitAll()
                .requestMatchers(new AntPathRequestMatcher("/static/**"), new AntPathRequestMatcher("/login")).permitAll()
                .anyRequest().authenticated())
            .formLogin(f -> f
                .loginPage("/login")
                .defaultSuccessUrl("/employees", true)
                .permitAll())
            .logout(l -> l.logoutSuccessUrl("/login?logout"))
            .headers(h -> h.frameOptions(fo -> fo.deny()));
        return http.build();
    }
}
