package com.deepshield.backend.service;

import com.deepshield.backend.model.Upload;
import com.deepshield.backend.repository.UploadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class UploadService {

    private final UploadRepository uploadRepository;
    private final LogService logService;
    private final Path fileStorageLocation;

    public UploadService(UploadRepository uploadRepository, LogService logService) {
        this.uploadRepository = uploadRepository;
        this.logService = logService;
        
        // Define directory to store physical media files
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @Transactional
    public Upload saveUpload(MultipartFile file, UUID userId, String mediaType) {
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file.");
        }

        // Clean name and create a unique random identifier to prevent collisions
        String fileExtension = getFileExtension(originalFileName);
        String savedFileName = UUID.randomUUID().toString() + fileExtension;

        try {
            // Check for malicious path traversal
            if (savedFileName.contains("..")) {
                throw new IllegalArgumentException("Filename contains invalid path sequence " + savedFileName);
            }

            // Copy file to the target location
            Path targetLocation = this.fileStorageLocation.resolve(savedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Construct accessible URL/path
            String fileUrl = "/api/upload/files/" + savedFileName;

            Upload upload = new Upload(userId, mediaType.toUpperCase(), originalFileName, fileUrl);
            upload.setFileName(savedFileName); // Store actual saved filename
            Upload savedUpload = uploadRepository.save(upload);

            logService.logEvent("MEDIA_UPLOADED", "User " + userId + " uploaded " + mediaType + ": " + originalFileName);
            return savedUpload;

        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }

    public Upload getUploadById(UUID id) {
        return uploadRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Upload record not found with ID: " + id));
    }

    public List<Upload> getHistory(UUID userId) {
        return uploadRepository.findByUserIdOrderByUploadTimeDesc(userId);
    }

    public List<Upload> getAllUploads() {
        return uploadRepository.findAllByOrderByUploadTimeDesc();
    }

    @Transactional
    public void updateStatus(UUID uploadId, String status) {
        Upload upload = getUploadById(uploadId);
        upload.setStatus(status);
        uploadRepository.save(upload);
    }

    public Path getFileAsResource(String filename) {
        return this.fileStorageLocation.resolve(filename).normalize();
    }

    private String getFileExtension(String filename) {
        int lastIndex = filename.lastIndexOf('.');
        if (lastIndex == -1) {
            return ""; // No extension
        }
        return filename.substring(lastIndex);
    }
}
