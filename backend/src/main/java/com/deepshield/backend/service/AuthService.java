package com.deepshield.backend.service;

import com.deepshield.backend.config.JwtTokenProvider;
import com.deepshield.backend.model.Role;
import com.deepshield.backend.model.User;
import com.deepshield.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final LogService logService;

    public AuthService(UserRepository userRepository, 
                       PasswordEncoder passwordEncoder, 
                       JwtTokenProvider tokenProvider,
                       LogService logService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.logService = logService;
    }

    public record RegisterRequest(String name, String email, String password, String role) {}
    public record LoginRequest(String email, String password) {}
    public record AuthResponse(String token, String id, String name, String email, String role) {}

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email address is already registered.");
        }

        Role userRole = Role.USER;
        if (request.role() != null) {
            try {
                userRole = Role.valueOf(request.role().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Keep default
            }
        }

        String encodedPassword = passwordEncoder.encode(request.password());
        User user = new User(request.name(), request.email(), encodedPassword, userRole);
        User savedUser = userRepository.save(user);

        logService.logEvent("USER_REGISTER", "New user registered: " + savedUser.getEmail() + " as " + savedUser.getRole());

        String token = tokenProvider.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name());
        return new AuthResponse(token, savedUser.getId().toString(), savedUser.getName(), savedUser.getEmail(), savedUser.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.email());
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.password(), userOpt.get().getPassword())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        User user = userOpt.get();
        logService.logEvent("USER_LOGIN", "User logged in: " + user.getEmail());

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getId().toString(), user.getName(), user.getEmail(), user.getRole().name());
    }
}
