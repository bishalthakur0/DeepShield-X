package com.deepshield.backend.service;

import com.deepshield.backend.model.Upload;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import java.nio.file.Path;
import java.util.Map;

@Service
public class AiEngineClient {

    private final RestTemplate restTemplate;
    private final String aiEngineUrl;
    private final UploadService uploadService;

    public AiEngineClient(
            @Value("${ai-engine.url}") String aiEngineUrl,
            UploadService uploadService) {
        this.restTemplate = new RestTemplate();
        this.aiEngineUrl = aiEngineUrl;
        this.uploadService = uploadService;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> analyzeMedia(Upload upload) {
        Path filePath = uploadService.getFileAsResource(upload.getFileName());
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new FileSystemResource(filePath.toFile()));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        String endpoint = upload.getMediaType().equalsIgnoreCase("IMAGE") ? "/analyze/image" : "/analyze/video";
        String url = aiEngineUrl + endpoint;

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (Map<String, Object>) response.getBody();
            } else {
                throw new RuntimeException("AI Engine returned status code: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("Communication with AI Engine failed: " + e.getMessage(), e);
        }
    }
}
