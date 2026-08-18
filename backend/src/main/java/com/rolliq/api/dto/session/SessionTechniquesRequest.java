package com.rolliq.api.dto.session;

import java.util.List;
import java.util.UUID;

public record SessionTechniquesRequest(List<UUID> techniqueIds) {}
