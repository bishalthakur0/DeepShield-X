package com.deepshield.backend.controller;

import com.deepshield.backend.model.Log;
import com.deepshield.backend.model.User;
import com.deepshield.backend.repository.UserRepository;
import com.deepshield.backend.service.LogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final LogService logService;

    public AdminController(UserRepository userRepository, LogService logService) {
        this.userRepository = userRepository;
        this.logService = logService;
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        try {
            List<User> users = userRepository.findAll();
            List<Map<String, Object>> safeUsers = new ArrayList<>();
            
            for (User user : users) {
                Map<String, Object> u = new HashMap<>();
                u.put("id", user.getId());
                u.put("name", user.getName());
                u.put("email", user.getEmail());
                u.put("role", user.getRole().name());
                u.put("createdAt", user.getCreatedAt());
                safeUsers.add(u);
            }
            
            return ResponseEntity.ok(safeUsers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/logs")
    public ResponseEntity<?> getLogs() {
        try {
            List<Log> logs = logService.getAllLogs();
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
