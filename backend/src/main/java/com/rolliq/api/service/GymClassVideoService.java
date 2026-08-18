package com.rolliq.api.service;

import com.rolliq.api.dto.gymclass.CreateGymClassVideoRequest;
import com.rolliq.api.dto.gymclass.GymClassVideoResponse;
import com.rolliq.api.exception.ApiException;
import com.rolliq.api.model.GymClassVideo;
import com.rolliq.api.repository.GymClassEntryRepository;
import com.rolliq.api.repository.GymClassVideoRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GymClassVideoService {

    private final GymClassVideoRepository videoRepository;
    private final GymClassEntryRepository classEntryRepository;
    private final GymAccessService gymAccessService;

    public List<GymClassVideoResponse> list(UUID gymId, UUID classId, UUID userId) {
        gymAccessService.requireMembership(gymId, userId);
        requireClassInGym(gymId, classId);
        return videoRepository.findByGymClassEntryIdOrderBySequenceNumberAsc(classId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public GymClassVideoResponse create(
            UUID gymId, UUID classId, UUID userId, CreateGymClassVideoRequest request) {
        gymAccessService.requireTrainerOrOwner(gymId, userId);
        requireClassInGym(gymId, classId);
        GymClassVideo video = new GymClassVideo();
        video.setGymClassEntryId(classId);
        video.setUrl(request.url());
        video.setTechniques(request.techniques() != null ? request.techniques() : List.of());
        video.setSequenceNumber(request.sequenceNumber());
        return toResponse(videoRepository.save(video));
    }

    @Transactional
    public void delete(UUID gymId, UUID classId, UUID videoId, UUID userId) {
        gymAccessService.requireTrainerOrOwner(gymId, userId);
        requireClassInGym(gymId, classId);
        GymClassVideo video =
                videoRepository
                        .findByIdAndGymClassEntryId(videoId, classId)
                        .orElseThrow(() -> ApiException.notFound("Video not found"));
        videoRepository.delete(video);
    }

    private void requireClassInGym(UUID gymId, UUID classId) {
        if (classEntryRepository.findByIdAndGymId(classId, gymId).isEmpty()) {
            throw ApiException.notFound("Class entry not found");
        }
    }

    private GymClassVideoResponse toResponse(GymClassVideo video) {
        return new GymClassVideoResponse(
                video.getId(),
                video.getGymClassEntryId(),
                video.getUrl(),
                video.getTechniques(),
                video.getSequenceNumber());
    }
}
