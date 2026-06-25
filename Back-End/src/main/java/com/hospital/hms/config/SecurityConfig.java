package com.hospital.hms.config;

import com.hospital.hms.util.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;


    private static final String[] PUBLIC_URLS = {
            "/api/auth/login",
            "/api/auth/refresh-token",
            "/api/kashier/webhook",          // Kashier server calls this — no auth header
            "/api/kashier/payment/success",  // browser redirect after Kashier payment
            "/api/kashier/payment/failure",
            "/api/paypal/payment/success",   // browser redirect after PayPal approval
            "/api/paypal/payment/cancel",
            "/actuator/**",
            // WebSocket / STOMP handshake endpoints (SockJS transport)
            "/ws/**",
            "/ws/info/**",
            "/ws/iframe*",
            "/ws/*.html"
    };
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:8081",
                "http://localhost:8082",
                "http://localhost:8080",
                "http://localhost:3000"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(PUBLIC_URLS).permitAll()

                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // ── Doctor + Admin ──────────────────────────────────────
                        .requestMatchers("/api/doctor/**").hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST", "NURSE", "PATIENT")
                        .requestMatchers("/api/appointments/**").hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT", "NURSE")
                        .requestMatchers("/api/prescriptions/**").hasAnyRole("ADMIN", "DOCTOR", "PHARMACIST", "PATIENT")

                        .requestMatchers("/api/nurse/**").hasAnyRole("ADMIN", "NURSE", "DOCTOR")

                        .requestMatchers("/api/medicine/**").hasAnyRole("ADMIN", "PHARMACIST", "DOCTOR", "NURSE")
                        .requestMatchers("/api/medicine-stock/**").hasAnyRole("ADMIN", "PHARMACIST", "DOCTOR")
                        .requestMatchers("/api/medicine-dispensation/**").hasAnyRole("ADMIN", "PHARMACIST", "DOCTOR")

                        .requestMatchers("/api/receptionist/**").hasAnyRole("ADMIN", "RECEPTIONIST")
                        .requestMatchers("/api/patients/**").hasAnyRole("ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST", "PATIENT", "ACCOUNTANT")
                        .requestMatchers("/api/external-hospitals/**").hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers("/api/transfers/**").hasAnyRole("ADMIN", "DOCTOR")

                        // ── Technician ────────────────────────────────────────────
                        .requestMatchers("/api/technicians/**").hasAnyRole("ADMIN", "TECHNICIAN")
                        .requestMatchers("/api/lab-tests/**").hasAnyRole("ADMIN", "DOCTOR", "TECHNICIAN", "PATIENT")
                        .requestMatchers("/api/radiology-orders/**").hasAnyRole("ADMIN", "DOCTOR", "TECHNICIAN", "PATIENT")

                        // ── Blood Bank ────────────────────────────────────────────
                        .requestMatchers("/api/blood-bank/units/**").hasAnyRole("ADMIN", "TECHNICIAN")
                        .requestMatchers("/api/blood-bank/requests/**").hasAnyRole("ADMIN", "DOCTOR", "TECHNICIAN", "PATIENT")

                        // ── Users (admin + any authenticated user reading own data) ─
                        .requestMatchers("/api/users/**").authenticated()
                        .requestMatchers("/api/auth/**").authenticated()

                        // ── Invoices & Payments ───────────────────────────────────
                        .requestMatchers("/api/invoices/**").hasAnyRole("ADMIN", "ACCOUNTANT", "DOCTOR", "PATIENT", "RECEPTIONIST")
                        .requestMatchers("/api/paypal/**").hasAnyRole("ADMIN", "ACCOUNTANT", "PATIENT")
                        .requestMatchers("/api/kashier/**").hasAnyRole("ADMIN", "ACCOUNTANT", "PATIENT")

                        // ── Notifications ─────────────────────────────────────────
                        .requestMatchers("/api/notifications/**").authenticated()

                        // ── Accountants ───────────────────────────────────────────
                        .requestMatchers("/api/accountants/**").hasAnyRole("ADMIN", "ACCOUNTANT")

                        // ── Test Requests (legacy endpoint) ───────────────────────
                        .requestMatchers("/api/test-requests/**").hasAnyRole("ADMIN", "DOCTOR", "TECHNICIAN", "PATIENT")

                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable());

        return http.build();
    }
}
