package com.jirareplika.controller;

import com.jirareplika.dto.ActivityLogDto;
import com.jirareplika.service.ActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues/{issueId}/activities")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    public ActivityLogController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    @GetMapping
    public ResponseEntity<List<ActivityLogDto>> getActivitiesForIssue(@PathVariable Long issueId) {
        return ResponseEntity.ok(activityLogService.getActivityLogsForIssue(issueId));
    }
}
