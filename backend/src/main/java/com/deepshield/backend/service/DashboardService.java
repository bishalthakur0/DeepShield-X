package com.deepshield.backend.service;

import com.deepshield.backend.model.AnalysisResult;
import com.deepshield.backend.model.Upload;
import com.deepshield.backend.repository.AnalysisResultRepository;
import com.deepshield.backend.repository.UploadRepository;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final UploadRepository uploadRepository;
    private final AnalysisResultRepository resultRepository;

    public DashboardService(UploadRepository uploadRepository, AnalysisResultRepository resultRepository) {
        this.uploadRepository = uploadRepository;
        this.resultRepository = resultRepository;
    }

    public Map<String, Object> getStats() {
        List<Upload> uploads = uploadRepository.findAll();
        List<AnalysisResult> results = resultRepository.findAll();

        long totalUploads = uploads.size();
        long fakeCount = results.stream().filter(r -> r.getPrediction().equalsIgnoreCase("FAKE")).count();
        double fakeRate = totalUploads > 0 ? ((double) fakeCount / totalUploads) * 100.0 : 0.0;

        // Calculate distribution of generator types
        Map<String, Long> generatorMap = results.stream()
                .filter(r -> r.getPrediction().equalsIgnoreCase("FAKE"))
                .collect(Collectors.groupingBy(AnalysisResult::getGeneratorType, Collectors.counting()));

        String mostCommonGenerator = generatorMap.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");

        // Daily upload counts (mock grouping for graph data based on last 7 days)
        Map<String, Integer> dailyUploads = new LinkedHashMap<>();
        // Set last 7 days defaults
        for (int i = 6; i >= 0; i--) {
            String dayLabel = java.time.LocalDate.now().minusDays(i).getDayOfWeek().toString().substring(0, 3);
            dailyUploads.put(dayLabel, 0);
        }
        
        // Group real uploads
        for (Upload upload : uploads) {
            String dayLabel = upload.getUploadTime().getDayOfWeek().toString().substring(0, 3);
            if (dailyUploads.containsKey(dayLabel)) {
                dailyUploads.put(dayLabel, dailyUploads.get(dayLabel) + 1);
            }
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUploads", totalUploads);
        stats.put("fakeCount", fakeCount);
        stats.put("fakeRate", Math.round(fakeRate * 10.0) / 10.0);
        stats.put("mostCommonGenerator", mostCommonGenerator);
        stats.put("generatorBreakdown", generatorMap);
        stats.put("dailyUploads", dailyUploads);

        return stats;
    }
}
