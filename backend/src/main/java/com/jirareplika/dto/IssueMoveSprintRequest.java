package com.jirareplika.dto;

public class IssueMoveSprintRequest {
    private Long sprintId;
    public IssueMoveSprintRequest() {}
    public IssueMoveSprintRequest(Long sprintId) { this.sprintId = sprintId; }
    public Long getSprintId() { return sprintId; }
    public void setSprintId(Long sprintId) { this.sprintId = sprintId; }
}
