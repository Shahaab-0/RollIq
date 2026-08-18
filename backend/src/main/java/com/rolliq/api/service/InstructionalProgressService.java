package com.rolliq.api.service;

import com.rolliq.api.dto.instructional.InstructionalProgressResponse;
import com.rolliq.api.dto.instructional.UpdateProgressRequest;
import com.rolliq.api.exception.ApiException;
import com.rolliq.api.model.InstructionalProgress;
import com.rolliq.api.repository.InstructionalProgressRepository;
import com.rolliq.api.repository.InstructionalVideoRepository;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InstructionalProgressService {

    private static final Set<String> VALID_STATUSES =
            Set.of("want_to_watch", "in_progress", "completed");

    private final InstructionalProgressRepository progressRepository;
    private final InstructionalVideoRepository videoRepository;

    public List<InstructionalProgressResponse> listForUser(UUID userId) {
        return progressRepository.findByUserId(userId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public InstructionalProgressResponse upsert(UUID userId, UUID videoId, UpdateProgressRequest request) {
        if (!VALID_STATUSES.contains(request.status())) {
            throw ApiException.badRequest("Invalid status: " + request.status());
        }
        if (!videoRepository.existsById(videoId)) {
            throw ApiException.notFound("Video not found");
        }

        InstructionalProgress progress = progressRepository
                .findByUserIdAndVideoId(userId, videoId)
                .orElseGet(() -> {
                    InstructionalProgress created = new InstructionalProgress();
                    created.setUserId(userId);
                    created.setVideoId(videoId);
                    return created;
                });
        progress.setStatus(request.status());
        progress.setNotes(request.notes());
        return toResponse(progressRepository.save(progress));
    }

    @Transactional
    public void delete(UUID userId, UUID videoId) {
        progressRepository.deleteByUserIdAndVideoId(userId, videoId);
    }

    private InstructionalProgressResponse toResponse(InstructionalProgress progress) {
        return new InstructionalProgressResponse(
                progress.getVideoId(), progress.getStatus(), progress.getNotes());
    }
}
