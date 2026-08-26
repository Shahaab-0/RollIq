package com.rolliq.api.service;

import com.rolliq.api.dto.gymclass.GymAttendeeResponse;
import com.rolliq.api.exception.ApiException;
import com.rolliq.api.model.GymClassAttendance;
import com.rolliq.api.repository.GymAttendeeSummary;
import com.rolliq.api.repository.GymClassAttendanceRepository;
import com.rolliq.api.repository.GymClassEntryRepository;
import com.rolliq.api.repository.GymMembershipRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GymClassAttendanceService {

    private final GymClassAttendanceRepository attendanceRepository;
    private final GymClassEntryRepository classEntryRepository;
    private final GymMembershipRepository membershipRepository;
    private final GymAccessService gymAccessService;

    public List<GymAttendeeResponse> list(UUID gymId, UUID classId, UUID userId) {
        gymAccessService.requireMembership(gymId, userId);
        requireClassInGym(gymId, classId);
        return attendanceRepository.findRosterForClass(gymId, classId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void mark(UUID gymId, UUID classId, UUID targetUserId, UUID actingUserId) {
        gymAccessService.requireTrainerOrOwner(gymId, actingUserId);
        requireClassInGym(gymId, classId);
        if (!membershipRepository.existsByGymIdAndUserId(gymId, targetUserId)) {
            throw ApiException.badRequest("This user is not a member of this gym");
        }
        if (attendanceRepository.findByGymClassEntryIdAndUserId(classId, targetUserId).isPresent()) {
            return;
        }
        GymClassAttendance attendance = new GymClassAttendance();
        attendance.setGymClassEntryId(classId);
        attendance.setUserId(targetUserId);
        attendance.setMarkedBy(actingUserId);
        attendanceRepository.save(attendance);
    }

    @Transactional
    public void unmark(UUID gymId, UUID classId, UUID targetUserId, UUID actingUserId) {
        gymAccessService.requireTrainerOrOwner(gymId, actingUserId);
        requireClassInGym(gymId, classId);
        attendanceRepository
                .findByGymClassEntryIdAndUserId(classId, targetUserId)
                .ifPresent(attendanceRepository::delete);
    }

    private void requireClassInGym(UUID gymId, UUID classId) {
        if (classEntryRepository.findByIdAndGymId(classId, gymId).isEmpty()) {
            throw ApiException.notFound("Class entry not found");
        }
    }

    private GymAttendeeResponse toResponse(GymAttendeeSummary summary) {
        return new GymAttendeeResponse(summary.getUserId(), summary.getDisplayName(), summary.getPresent());
    }
}
