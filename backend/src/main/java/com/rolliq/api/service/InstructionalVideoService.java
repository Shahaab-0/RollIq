package com.rolliq.api.service;

import com.rolliq.api.dto.instructional.CreateVideoRequest;
import com.rolliq.api.dto.instructional.InstructionalVideoResponse;
import com.rolliq.api.exception.ApiException;
import com.rolliq.api.model.InstructionalVideo;
import com.rolliq.api.repository.InstructionalRepository;
import com.rolliq.api.repository.InstructionalVideoRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InstructionalVideoService {

    private final InstructionalVideoRepository videoRepository;
    private final InstructionalRepository instructionalRepository;

    public List<InstructionalVideoResponse> listForInstructional(UUID instructionalId) {
        return videoRepository.findByInstructionalIdOrderBySequenceNumberAsc(instructionalId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public InstructionalVideoResponse create(UUID instructionalId, CreateVideoRequest request) {
        if (!instructionalRepository.existsById(instructionalId)) {
            throw ApiException.notFound("Instructional not found");
        }
        InstructionalVideo video = new InstructionalVideo();
        video.setInstructionalId(instructionalId);
        video.setTitle(request.title());
        video.setSequenceNumber(request.sequenceNumber());
        video.setUrl(request.url());
        video.setDurationMinutes(request.durationMinutes());
        return toResponse(videoRepository.save(video));
    }

    private InstructionalVideoResponse toResponse(InstructionalVideo video) {
        return new InstructionalVideoResponse(
                video.getId(),
                video.getInstructionalId(),
                video.getTitle(),
                video.getSequenceNumber(),
                video.getUrl(),
                video.getDurationMinutes());
    }
}
