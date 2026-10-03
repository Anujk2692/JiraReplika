package com.jirareplika.dto;

import java.util.HashMap;
import java.util.Map;

public class DashboardStatsDto {
    private long totalIssues;
    private long completedIssues;
    private int totalStoryPoints;
    private int completedStoryPoints;
    private Map<String, Long> statusDistribution = new HashMap<>();
    private Map<String, Long> priorityDistribution = new HashMap<>();
    private Map<String, Long> typeDistribution = new HashMap<>();
    private Map<String, Long> assigneeWorkload = new HashMap<>();
    private SprintDto activeSprint;

    public DashboardStatsDto() {}
    public long getTotalIssues() { return totalIssues; }
    public void setTotalIssues(long totalIssues) { this.totalIssues = totalIssues; }
    public long getCompletedIssues() { return completedIssues; }
    public void setCompletedIssues(long completedIssues) { this.completedIssues = completedIssues; }
    public int getTotalStoryPoints() { return totalStoryPoints; }
    public void setTotalStoryPoints(int totalStoryPoints) { this.totalStoryPoints = totalStoryPoints; }
    public int getCompletedStoryPoints() { return completedStoryPoints; }
    public void setCompletedStoryPoints(int completedStoryPoints) { this.completedStoryPoints = completedStoryPoints; }
    public Map<String, Long> getStatusDistribution() { return statusDistribution; }
    public void setStatusDistribution(Map<String, Long> statusDistribution) { this.statusDistribution = statusDistribution; }
    public Map<String, Long> getPriorityDistribution() { return priorityDistribution; }
    public void setPriorityDistribution(Map<String, Long> priorityDistribution) { this.priorityDistribution = priorityDistribution; }
    public Map<String, Long> getTypeDistribution() { return typeDistribution; }
    public void setTypeDistribution(Map<String, Long> typeDistribution) { this.typeDistribution = typeDistribution; }
    public Map<String, Long> getAssigneeWorkload() { return assigneeWorkload; }
    public void setAssigneeWorkload(Map<String, Long> assigneeWorkload) { this.assigneeWorkload = assigneeWorkload; }
    public SprintDto getActiveSprint() { return activeSprint; }
    public void setActiveSprint(SprintDto activeSprint) { this.activeSprint = activeSprint; }
}
