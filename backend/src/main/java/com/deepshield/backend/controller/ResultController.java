package com.deepshield.backend.controller;

import com.deepshield.backend.model.AnalysisResult;
import com.deepshield.backend.model.Upload;
import com.deepshield.backend.service.ResultService;
import com.deepshield.backend.service.UploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ResultController {

    private final ResultService resultService;
    private final UploadService uploadService;

    public ResultController(ResultService resultService, UploadService uploadService) {
        this.resultService = resultService;
        this.uploadService = uploadService;
    }

    @GetMapping("/result/{uploadId}")
    public ResponseEntity<?> getResult(@PathVariable UUID uploadId) {
        try {
            Upload upload = uploadService.getUploadById(uploadId);
            
            // If the upload status is still PENDING, trigger the analysis immediately
            if (upload.getStatus().equalsIgnoreCase("PENDING")) {
                AnalysisResult result = resultService.runAnalysis(uploadId);
                return ResponseEntity.ok(enrichResult(result, upload));
            }
            
            // If it is completed, return the saved state enriched with upload details
            if (upload.getStatus().equalsIgnoreCase("COMPLETED")) {
                AnalysisResult result = resultService.getResultByUploadId(uploadId);
                return ResponseEntity.ok(enrichResult(result, upload));
            } else {
                return ResponseEntity.ok(Map.of(
                        "uploadId", uploadId,
                        "status", upload.getStatus(),
                        "message", "Analysis is currently processing or failed. Status: " + upload.getStatus()
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory() {
        try {
            UUID userId = getAuthenticatedUserId();
            List<Upload> uploads = uploadService.getHistory(userId);
            
            List<Map<String, Object>> response = new ArrayList<>();
            for (Upload upload : uploads) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", upload.getId());
                item.put("fileName", upload.getFileName());
                item.put("mediaType", upload.getMediaType());
                item.put("uploadTime", upload.getUploadTime());
                item.put("status", upload.getStatus());
                item.put("fileUrl", upload.getFileUrl());
                
                if (upload.getStatus().equalsIgnoreCase("COMPLETED")) {
                    try {
                        AnalysisResult result = resultService.getResultByUploadId(upload.getId());
                        item.put("prediction", result.getPrediction());
                        item.put("confidenceScore", result.getConfidenceScore());
                        item.put("generatorType", result.getGeneratorType());
                    } catch (Exception ignored) {
                        item.put("prediction", "UNKNOWN");
                    }
                } else {
                    item.put("prediction", "PENDING");
                }
                
                response.add(item);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private Map<String, Object> enrichResult(AnalysisResult result, Upload upload) {
        Map<String, Object> enriched = new LinkedHashMap<>();
        enriched.put("id", result.getId());
        enriched.put("uploadId", result.getUploadId());
        enriched.put("prediction", result.getPrediction());
        enriched.put("confidenceScore", result.getConfidenceScore());
        enriched.put("generatorType", result.getGeneratorType());
        enriched.put("explanation", result.getExplanation());
        enriched.put("heatmapUrl", result.getHeatmapUrl());
        enriched.put("fftUrl", result.getFftUrl());
        enriched.put("noiseUrl", result.getNoiseUrl());
        
        // Deserialize EXIF tags
        if (result.getExifTags() != null) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                enriched.put("exif", mapper.readValue(result.getExifTags(), Map.class));
            } catch (Exception e) {
                enriched.put("exif", new HashMap<>());
            }
        } else {
            enriched.put("exif", new HashMap<>());
        }
        
        // Metrics
        enriched.put("metadataScore", result.getMetadataScore());
        enriched.put("frequencyScore", result.getFrequencyScore());
        enriched.put("noiseScore", result.getNoiseScore());
        enriched.put("efficientNetScore", result.getEfficientNetScore());
        enriched.put("vitScore", result.getVitScore());
        enriched.put("convNextScore", result.getConvNextScore());
        
        // Video specific metrics
        enriched.put("lipSyncMismatch", result.getLipSyncMismatch());
        enriched.put("blinkingAnomalies", result.getBlinkingAnomalies());
        enriched.put("frameArtifacts", result.getFrameArtifacts());
        enriched.put("facialInconsistency", result.getFacialInconsistency());
        
        enriched.put("createdAt", result.getCreatedAt());
        
        // Upload tags
        enriched.put("fileName", upload.getFileName());
        enriched.put("fileUrl", upload.getFileUrl());
        enriched.put("mediaType", upload.getMediaType());
        
        return enriched;
    }

    private UUID getAuthenticatedUserId() {
        String principal = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return UUID.fromString(principal);
    }
}
