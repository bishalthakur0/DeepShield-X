package com.deepshield.backend.service;

import com.deepshield.backend.model.Log;
import com.deepshield.backend.repository.LogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class LogService {

    private final LogRepository logRepository;

    public LogService(LogRepository logRepository) {
        this.logRepository = logRepository;
    }

    @Transactional
    public void logEvent(String eventType, String description) {
        Log log = new Log(eventType, description);
        logRepository.save(log);
    }

    public List<Log> getAllLogs() {
        return logRepository.findAllByOrderByTimestampDesc();
    }
}
