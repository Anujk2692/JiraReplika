package com.jirareplika.dto;

import com.jirareplika.model.ActivityLog;
import java.time.LocalDateTime;

public class ActivityLogDto {
    private Long id;
    private Long issueId;
    private UserDto user;
    private String action;
    private String fieldName;
    private String oldValue;
    private String newValue;
    private LocalDateTime createdAt;

    public ActivityLogDto() {}

    public static ActivityLogDto fromEntity(ActivityLog log) {
        if (log == null) return null;
        ActivityLogDto dto = new ActivityLogDto();
        dto.setId(log.getId());
        dto.setIssueId(log.getIssue() != null ? log.getIssue().getId() : null);
        dto.setUser(UserDto.fromEntity(log.getUser()));
        dto.setAction(log.getAction());
        dto.setFieldName(log.getFieldName());
        dto.setOldValue(log.getOldValue());
        dto.setnewValue(log.getNewValue());
        dto.setCreatedAt(log.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getIssueId() { return issueId; }
    public void setIssueId(Long issueId) { this.issueId = issueId; }
    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getFieldName() { return fieldName; }
    public void setFieldName(String fieldName) { this.fieldName = fieldName; }
    public String getOldValue() { return oldValue; }
    public void setOldValue(String oldValue) { this.oldValue = oldValue; }
    public String getNewValue() { return newValue; }
    public void setnewValue(String newValue) { this.newValue = newValue; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
