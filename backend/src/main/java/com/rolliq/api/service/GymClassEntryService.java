package com.rolliq.api.service;

import com.rolliq.api.dto.gymclass.CreateGymClassEntryRequest;
import com.rolliq.api.dto.gymclass.GymClassEntryResponse;
import com.rolliq.api.exception.ApiException;
import com.rolliq.api.model.Gym;
import com.rolliq.api.model.GymClassEntry;
import com.rolliq.api.repository.GymClassEntryRepository;
import com.rolliq.api.repository.GymClassEntrySummary;
import com.rolliq.api.repository.GymMembershipRepository;
import com.rolliq.api.repository.GymRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GymClassEntryService {

    private final GymClassEntryRepository classEntryRepository;
    private final GymAccessService gymAccessService;
    private final GymRepository gymRepository;
    private final GymMembershipRepository membershipRepository;
    private final PushNotificationService pushNotificationService;

    public List<GymClassEntryResponse> list(UUID gymId, UUID userId) {
        gymAccessService.requireMembership(gymId, userId);
        return classEntryRepository.findByGymIdWithVideoCount(gymId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public GymClassEntryResponse create(UUID gymId, UUID userId, CreateGymClassEntryRequest request) {
        gymAccessService.requireTrainerOrOwner(gymId, userId);
        GymClassEntry entry = new GymClassEntry();
        entry.setGymId(gymId);
        entry.setTitle(request.title());
        entry.setDescription(request.description());
        entry.setClassDate(request.classDate());
        entry.setCreatedBy(userId);
        entry = classEntryRepository.save(entry);
        notifyMembersOfNewClass(gymId, userId, entry.getTitle());
        return new GymClassEntryResponse(
                entry.getId(),
                entry.getGymId(),
                entry.getTitle(),
                entry.getDescription(),
                entry.getClassDate(),
                0);
    }

    @Transactional
    public void delete(UUID gymId, UUID classId, UUID userId) {
        gymAccessService.requireTrainerOrOwner(gymId, userId);
        GymClassEntry entry =
                classEntryRepository
                        .findByIdAndGymId(classId, gymId)
                        .orElseThrow(() -> ApiException.notFound("Class entry not found"));
        classEntryRepository.delete(entry);
    }

    private void notifyMembersOfNewClass(UUID gymId, UUID posterId, String classTitle) {
        Gym gym = gymRepository.findById(gymId).orElse(null);
        if (gym == null) return;
        List<UUID> recipients =
                membershipRepository.findByGymIdOrderByJoinedAtAsc(gymId).stream()
                        .map(m -> m.getUserId())
                        .filter(memberId -> !memberId.equals(posterId))
                        .toList();
        pushNotificationService.sendToUsers(
                recipients, gym.getName(), "New class recap: " + classTitle);
    }

    private GymClassEntryResponse toResponse(GymClassEntrySummary summary) {
        return new GymClassEntryResponse(
                summary.getId(),
                summary.getGymId(),
                summary.getTitle(),
                summary.getDescription(),
                summary.getClassDate(),
                summary.getVideoCount());
    }
}
