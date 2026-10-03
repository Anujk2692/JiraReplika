package com.jirareplika.dto;

import com.jirareplika.model.Issue;
import com.jirareplika.model.IssuePriority;
import com.jirareplika.model.IssueStatus;
import com.jirareplika.model.IssueType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

public class IssueDto {
    private Long id;
    private String issueKey;
    private String summary;
    private String description;
    private IssueType type;
    private IssuePriority priority;
    private IssueStatus status;
    private Long projectId;
    private String projectKey;
    private String projectName;
    private Long sprintId;
    private String sprintName;
    private Long parentId;
    private UserDto reporter;
    private UserDto assignee;
    private Integer storyPoints;
    private Double orderIndex;
    private LocalDate dueDate;
    private Set<String> labels = new HashSet<>();
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int subtaskCount;
    private int commentsCount;

    public IssueDto() {}

    public static IssueDto fromEntity(Issue issue) {
        if (issue == null) return null;
        IssueDto dto = new IssueDto();
        dto.setId(issue.getId());
        dto.setIssueKey(issue.getIssueKey());
        dto.setSummary(issue.getSummary());
        dto.setDescription(issue.getDescription());
        dto.setType(issue.getType());
        dto.setPriority(issue.getPriority());
        dto.setStatus(issue.getStatus());

        if (issue.getProject() != null) {
            dto.setProjectId(issue.getProject().getId());
            dto.setProjectKey(issue.getProject().getKey());
            dto.setProjectName(issue.getProject().getName());
        }

        if (issue.getSprint() != null) {
            dto.setSprintId(issue.getSprint().getId());
            dto.setSprintName(issue.getSprint().getName());
        }

        if (issue.getParent() != null) {
            dto.setParentId(issue.getParent().getId());
        }

        dto.setReporter(UserDto.fromEntity(issue.getReporter()));
        dto.setAssignee(UserDto.fromEntity(issue.getAssignee()));
        dto.setStoryPoints(issue.getStoryPoints());
        dto.setOrderIndex(issue.getOrderIndex());
        dto.setDueDate(issue.getDueDate());
        dto.setLabels(issue.getLabels() != null ? new HashSet<>(issue.getLabels()) : new HashSet<>());
        dto.setResolvedAt(issue.getResolvedAt());
        dto.setCreatedAt(issue.getCreatedAt());
        dto.setUpdatedAt(issue.getUpdatedAt());

        if (issue.getSubtasks() != null) {
            dto.setSubtaskCount(issue.getSubtasks().size());
        }

        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getIssueKey() { return issueKey; }
    public void setIssueKey(String issueKey) { this.issueKey = issueKey; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public IssueType getType() { return type; }
    public void setType(IssueType type) { this.type = type; }
    public IssuePriority getPriority() { return priority; }
    public void setPriority(IssuePriority priority) { this.priority = priority; }
    public IssueStatus getStatus() { return status; }
    public void setStatus(IssueStatus status) { this.status = status; }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getProjectKey() { return projectKey; }
    public void setProjectKey(String projectKey) { this.projectKey = projectKey; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public Long getSprintId() { return sprintId; }
    public void setSprintId(Long sprintId) { this.sprintId = sprintId; }
    public String getSprintName() { return sprintName; }
    public void setSprintName(String sprintName) { this.sprintName = sprintName; }
    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    public UserDto getReporter() { return reporter; }
    public void setReporter(UserDto reporter) { this.reporter = reporter; }
    public UserDto getAssignee() { return assignee; }
    public void setAssignee(UserDto assignee) { this.assignee = assignee; }
    public Integer getStoryPoints() { return storyPoints; }
    public void setStoryPoints(Integer storyPoints) { this.storyPoints = storyPoints; }
    public Double getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Double orderIndex) { this.orderIndex = orderIndex; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public Set<String> getLabels() { return labels; }
    public void setLabels(Set<String> labels) { this.labels = labels; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public int getSubtaskCount() { return subtaskCount; }
    public void setSubtaskCount(int subtaskCount) { this.subtaskCount = subtaskCount; }
    public int getCommentsCount() { return commentsCount; }
    public void setCommentsCount(int commentsCount) { this.commentsCount = commentsCount; }
}
