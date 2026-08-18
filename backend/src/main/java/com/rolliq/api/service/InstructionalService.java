package com.rolliq.api.service;

import com.rolliq.api.dto.instructional.CreateInstructionalRequest;
import com.rolliq.api.dto.instructional.InstructionalResponse;
import com.rolliq.api.model.Instructional;
import com.rolliq.api.repository.InstructionalRepository;
import com.rolliq.api.repository.InstructionalSummary;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InstructionalService {

    private final InstructionalRepository instructionalRepository;

    // Shared catalog -- no ownership filter on the list itself, but the
    // completed/in-progress counts are still scoped to the current user.
    public List<InstructionalResponse> list(UUID userId) {
        return instructionalRepository.findAllWithProgressSummary(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public InstructionalResponse create(UUID userId, CreateInstructionalRequest request) {
        Instructional instructional = new Instructional();
        instructional.setTitle(request.title());
        instructional.setInstructor(request.instructor());
        instructional.setCategory(request.category());
        instructional.setDifficulty(request.difficulty());
        instructional.setPlatform(request.platform());
        instructional.setUrl(request.url());
        instructional.setDescription(request.description());
        instructional.setReleaseYear(request.releaseYear());
        instructional.setCreatedBy(userId);
        instructional = instructionalRepository.save(instructional);

        return new InstructionalResponse(
                instructional.getId(),
                instructional.getTitle(),
                instructional.getInstructor(),
                instructional.getCategory(),
                instructional.getDifficulty(),
                instructional.getPlatform(),
                instructional.getUrl(),
                instructional.getDescription(),
                instructional.getReleaseYear(),
                0,
                0,
                0);
    }

    private InstructionalResponse toResponse(InstructionalSummary summary) {
        return new InstructionalResponse(
                summary.getId(),
                summary.getTitle(),
                summary.getInstructor(),
                summary.getCategory(),
                summary.getDifficulty(),
                summary.getPlatform(),
                summary.getUrl(),
                summary.getDescription(),
                summary.getReleaseYear(),
                summary.getVideoCount(),
                summary.getCompletedCount(),
                summary.getInProgressCount());
    }
}
