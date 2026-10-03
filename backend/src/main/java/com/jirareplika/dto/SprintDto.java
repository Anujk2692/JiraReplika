package com.jirareplika.dto;

import com.jirareplika.model.Sprint;
import com.jirareplika.model.SprintStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class SprintDto {
    private Long id;
    private String name;
    private String goal;
    private LocalDate startDate;
    private LocalDate endDate;
    private SprintStatus status;
    private Long projectId;
    private LocalDateTime createdAt;
    private int issueCount;
    private int totalStoryPoints;

    public SprintDto() {}

    public static SprintDto fromEntity(Sprint sprint) {
        if (sprint == null) return null;
        SprintDto dto = new SprintDto();
        dto.setId(sprint.getId());
        dto.setName(sprint.getName());
        dto.setGoal(sprint.getGoal());
        dto.setStartDate(sprint.getStartDate());
        dto.setEndDate(sprint.getEndDate());
        dto.setStatus(sprint.getStatus());
        dto.setProjectId(sprint.getProject() != null ? sprint.getProject().getId() : null);
        dto.setCreatedAt(sprint.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public SprintStatus getStatus() { return status; }
    public void setStatus(SprintStatus status) { this.status = status; }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public int getIssueCount() { return issueCount; }
    public void setIssueCount(int issueCount) { this.issueCount = issueCount; }
    public int getTotalStoryPoints() { return totalStoryPoints; }
    public void setTotalStoryPoints(int totalStoryPoints) { this.totalStoryPoints = totalStoryPoints; }
}
