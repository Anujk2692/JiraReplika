package com.jirareplika.dto;

import com.jirareplika.model.Project;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

public class ProjectDto {
    private Long id;
    private String name;
    private String key;
    private String description;
    private String category;
    private UserDto lead;
    private Set<UserDto> members = new HashSet<>();
    private Long issueCounter;
    private LocalDateTime createdAt;

    public ProjectDto() {}

    public static ProjectDto fromEntity(Project project) {
        if (project == null) return null;
        ProjectDto dto = new ProjectDto();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setKey(project.getKey());
        dto.setDescription(project.getDescription());
        dto.setCategory(project.getCategory());
        dto.setLead(UserDto.fromEntity(project.getLead()));
        if (project.getMembers() != null) {
            dto.setMembers(project.getMembers().stream().map(UserDto::fromEntity).collect(Collectors.toSet()));
        }
        dto.setIssueCounter(project.getIssueCounter());
        dto.setCreatedAt(project.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public UserDto getLead() { return lead; }
    public void setLead(UserDto lead) { this.lead = lead; }
    public Set<UserDto> getMembers() { return members; }
    public void setMembers(Set<UserDto> members) { this.members = members; }
    public Long getIssueCounter() { return issueCounter; }
    public void setIssueCounter(Long issueCounter) { this.issueCounter = issueCounter; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
