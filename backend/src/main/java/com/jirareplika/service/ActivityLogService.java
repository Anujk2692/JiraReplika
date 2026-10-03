package com.jirareplika.service;

import com.jirareplika.dto.ActivityLogDto;
import com.jirareplika.model.ActivityLog;
import com.jirareplika.model.Issue;
import com.jirareplika.model.User;
import com.jirareplika.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    @Transactional(readOnly = true)
    public List<ActivityLogDto> getActivityLogsForIssue(Long issueId) {
        return activityLogRepository.findByIssueIdOrderByCreatedAtDesc(issueId).stream()
            .map(ActivityLogDto::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional
    public void logActivity(Issue issue, User user, String action, String fieldName, String oldValue, String newValue) {
        ActivityLog log = new ActivityLog(issue, user, action, fieldName, oldValue, newValue);
        activityLogRepository.save(log);
    }
}
