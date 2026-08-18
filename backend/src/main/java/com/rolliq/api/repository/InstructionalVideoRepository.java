package com.rolliq.api.repository;

import com.rolliq.api.model.InstructionalVideo;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InstructionalVideoRepository extends JpaRepository<InstructionalVideo, UUID> {

    List<InstructionalVideo> findByInstructionalIdOrderBySequenceNumberAsc(UUID instructionalId);
}
