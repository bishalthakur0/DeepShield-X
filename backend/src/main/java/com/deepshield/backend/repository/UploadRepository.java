package com.deepshield.backend.repository;

import com.deepshield.backend.model.Upload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface UploadRepository extends JpaRepository<Upload, UUID> {
    List<Upload> findByUserIdOrderByUploadTimeDesc(UUID userId);
    List<Upload> findAllByOrderByUploadTimeDesc();
}
