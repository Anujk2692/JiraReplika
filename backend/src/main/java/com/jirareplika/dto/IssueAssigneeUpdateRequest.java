package com.jirareplika.dto;

public class IssueAssigneeUpdateRequest {
    private Long assigneeId;
    public IssueAssigneeUpdateRequest() {}
    public IssueAssigneeUpdateRequest(Long assigneeId) { this.assigneeId = assigneeId; }
    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }
}
