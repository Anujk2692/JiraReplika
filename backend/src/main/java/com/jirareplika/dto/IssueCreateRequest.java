package com.jirareplika.dto;

import com.jirareplika.model.IssuePriority;
import com.jirareplika.model.IssueStatus;
import com.jirareplika.model.IssueType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.Set;

public class IssueCreateRequest {
    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotBlank(message = "Summary is required")
    private String summary;

    private String description;
    private IssueType type = IssueType.TASK;
    private IssuePriority priority = IssuePriority.MEDIUM;
    private IssueStatus status = IssueStatus.TO_DO;

    private Long sprintId;
    private Long assigneeId;
    private Long parentId;
    private Integer storyPoints;
    private LocalDate dueDate;
    private Set<String> labels;

    public IssueCreateRequest() {}
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
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
    public Long getSprintId() { return sprintId; }
    public void setSprintId(Long sprintId) { this.sprintId = sprintId; }
    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }
    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    public Integer getStoryPoints() { return storyPoints; }
    public void setStoryPoints(Integer storyPoints) { this.storyPoints = storyPoints; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public Set<String> getLabels() { return labels; }
    public void setLabels(Set<String> labels) { this.labels = labels; }
}
