package com.deepshield.backend.service;

import com.deepshield.backend.model.AnalysisResult;
import com.deepshield.backend.model.Upload;
import com.deepshield.backend.repository.AnalysisResultRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.UUID;

@Service
public class ResultService {

    private final AnalysisResultRepository resultRepository;
    private final UploadService uploadService;
    private final AiEngineClient aiEngineClient;
    private final LogService logService;

    public ResultService(AnalysisResultRepository resultRepository,
                         UploadService uploadService,
                         AiEngineClient aiEngineClient,
                         LogService logService) {
        this.resultRepository = resultRepository;
        this.uploadService = uploadService;
        this.aiEngineClient = aiEngineClient;
        this.logService = logService;
    }

    public AnalysisResult getResultByUploadId(UUID uploadId) {
        return resultRepository.findByUploadId(uploadId)
                .orElseThrow(() -> new IllegalArgumentException("Analysis results not found for upload ID: " + uploadId));
    }

    @Transactional
    public AnalysisResult runAnalysis(UUID uploadId) {
        Upload upload = uploadService.getUploadById(uploadId);
        
        // Update status to processing
        uploadService.updateStatus(uploadId, "PROCESSING");
        logService.logEvent("ANALYSIS_STARTED", "Forensic analysis started for media: " + upload.getFileName());

        try {
            // Invoke AI Engine
            Map<String, Object> aiResponse = aiEngineClient.analyzeMedia(upload);

            // Populate analysis result
            AnalysisResult result = new AnalysisResult();
            result.setUploadId(uploadId);
            result.setPrediction((String) aiResponse.getOrDefault("prediction", "UNKNOWN"));
            result.setConfidenceScore(convertDouble(aiResponse.get("confidence_score")));
            result.setGeneratorType((String) aiResponse.getOrDefault("generator_type", "UNKNOWN"));
            result.setExplanation((String) aiResponse.get("explanation"));
            result.setHeatmapUrl((String) aiResponse.get("heatmap_url"));
            result.setFftUrl((String) aiResponse.get("fft_url"));
            result.setNoiseUrl((String) aiResponse.get("noise_url"));

            // Parse nested metrics
            Map<String, Object> metrics = (Map<String, Object>) aiResponse.get("metrics");
            if (metrics != null) {
                result.setMetadataScore(convertDouble(metrics.get("metadata_score")));
                result.setFrequencyScore(convertDouble(metrics.get("frequency_score")));
                result.setNoiseScore(convertDouble(metrics.get("noise_score")));

                // Parse image ensemble breakdown if available
                Map<String, Object> ensemble = (Map<String, Object>) metrics.get("ensemble_breakdown");
                if (ensemble != null) {
                    result.setEfficientNetScore(convertDouble(ensemble.get("EfficientNet-B4")));
                    result.setVitScore(convertDouble(ensemble.get("Vision Transformer")));
                    result.setConvNextScore(convertDouble(ensemble.get("ConvNeXt")));
                }

                // Parse video parameters if available
                result.setLipSyncMismatch(convertDouble(metrics.get("lip_sync_mismatch")));
                result.setBlinkingAnomalies(convertDouble(metrics.get("blinking_anomalies")));
                result.setFrameArtifacts(convertDouble(metrics.get("frame_artifacts")));
                result.setFacialInconsistency(convertDouble(metrics.get("facial_inconsistency")));
            }

            // Serialize EXIF metadata to database column
            if (aiResponse.containsKey("exif")) {
                try {
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    result.setExifTags(mapper.writeValueAsString(aiResponse.get("exif")));
                } catch (Exception e) {
                    result.setExifTags("{}");
                }
            } else {
                result.setExifTags("{}");
            }

            AnalysisResult savedResult = resultRepository.save(result);
            
            // Mark upload as completed
            uploadService.updateStatus(uploadId, "COMPLETED");
            logService.logEvent("ANALYSIS_SUCCESS", "Analysis completed for upload: " + uploadId + " -> " + result.getPrediction());

            return savedResult;

        } catch (Exception e) {
            uploadService.updateStatus(uploadId, "FAILED");
            logService.logEvent("ANALYSIS_FAILED", "Analysis failed for upload " + uploadId + ": " + e.getMessage());
            throw new RuntimeException("Forensics engine execution failed: " + e.getMessage(), e);
        }
    }

    private Double convertDouble(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
