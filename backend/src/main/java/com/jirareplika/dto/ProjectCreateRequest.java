package com.jirareplika.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Set;

public class ProjectCreateRequest {
    @NotBlank(message = "Project name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Project key is required")
    @Pattern(regexp = "^[A-Z0-9]{2,10}$")
    private String key;

    private String description;
    private String category = "SOFTWARE";
    private Long leadId;
    private Set<Long> memberIds;

    public ProjectCreateRequest() {}
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Long getLeadId() { return leadId; }
    public void setLeadId(Long leadId) { this.leadId = leadId; }
    public Set<Long> getMemberIds() { return memberIds; }
    public void setMemberIds(Set<Long> memberIds) { this.memberIds = memberIds; }
}
