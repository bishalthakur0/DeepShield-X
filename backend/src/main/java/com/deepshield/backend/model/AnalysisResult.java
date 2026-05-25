package com.deepshield.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "analysis_results")
public class AnalysisResult {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "upload_id", nullable = false, unique = true)
    private UUID uploadId;

    @Column(nullable = false)
    private String prediction; // REAL, FAKE

    @Column(name = "confidence_score", nullable = false)
    private Double confidenceScore;

    @Column(name = "generator_type", nullable = false)
    private String generatorType;

    @Column(length = 2000)
    private String explanation;

    @Column(name = "heatmap_url")
    private String heatmapUrl;

    @Column(name = "fft_url")
    private String fftUrl;

    @Column(name = "noise_url")
    private String noiseUrl;

    // Forensic Metrics
    @Column(name = "metadata_score")
    private Double metadataScore;

    @Column(name = "frequency_score")
    private Double frequencyScore;

    @Column(name = "noise_score")
    private Double noiseScore;

    // Model Ensemble Details (Images)
    @Column(name = "efficient_net_score")
    private Double efficientNetScore;

    @Column(name = "vit_score")
    private Double vitScore;

    @Column(name = "conv_next_score")
    private Double convNextScore;

    // Video Forensic Details
    @Column(name = "lip_sync_mismatch")
    private Double lipSyncMismatch;

    @Column(name = "blinking_anomalies")
    private Double blinkingAnomalies;

    @Column(name = "frame_artifacts")
    private Double frameArtifacts;

    @Column(name = "facial_inconsistency")
    private Double facialInconsistency;

    @Column(name = "exif_tags", length = 3000)
    private String exifTags;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public AnalysisResult() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getExifTags() { return exifTags; }
    public void setExifTags(String exifTags) { this.exifTags = exifTags; }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUploadId() { return uploadId; }
    public void setUploadId(UUID uploadId) { this.uploadId = uploadId; }

    public String getPrediction() { return prediction; }
    public void setPrediction(String prediction) { this.prediction = prediction; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getGeneratorType() { return generatorType; }
    public void setGeneratorType(String generatorType) { this.generatorType = generatorType; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getHeatmapUrl() { return heatmapUrl; }
    public void setHeatmapUrl(String heatmapUrl) { this.heatmapUrl = heatmapUrl; }

    public String getFftUrl() { return fftUrl; }
    public void setFftUrl(String fftUrl) { this.fftUrl = fftUrl; }

    public String getNoiseUrl() { return noiseUrl; }
    public void setNoiseUrl(String noiseUrl) { this.noiseUrl = noiseUrl; }

    public Double getMetadataScore() { return metadataScore; }
    public void setMetadataScore(Double metadataScore) { this.metadataScore = metadataScore; }

    public Double getFrequencyScore() { return frequencyScore; }
    public void setFrequencyScore(Double frequencyScore) { this.frequencyScore = frequencyScore; }

    public Double getNoiseScore() { return noiseScore; }
    public void setNoiseScore(Double noiseScore) { this.noiseScore = noiseScore; }

    public Double getEfficientNetScore() { return efficientNetScore; }
    public void setEfficientNetScore(Double efficientNetScore) { this.efficientNetScore = efficientNetScore; }

    public Double getVitScore() { return vitScore; }
    public void setVitScore(Double vitScore) { this.vitScore = vitScore; }

    public Double getConvNextScore() { return convNextScore; }
    public void setConvNextScore(Double convNextScore) { this.convNextScore = convNextScore; }

    public Double getLipSyncMismatch() { return lipSyncMismatch; }
    public void setLipSyncMismatch(Double lipSyncMismatch) { this.lipSyncMismatch = lipSyncMismatch; }

    public Double getBlinkingAnomalies() { return blinkingAnomalies; }
    public void setBlinkingAnomalies(Double blinkingAnomalies) { this.blinkingAnomalies = blinkingAnomalies; }

    public Double getFrameArtifacts() { return frameArtifacts; }
    public void setFrameArtifacts(Double frameArtifacts) { this.frameArtifacts = frameArtifacts; }

    public Double getFacialInconsistency() { return facialInconsistency; }
    public void setFacialInconsistency(Double facialInconsistency) { this.facialInconsistency = facialInconsistency; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
