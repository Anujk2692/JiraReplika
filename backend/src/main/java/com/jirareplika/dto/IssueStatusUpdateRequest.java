package com.jirareplika.dto;

import com.jirareplika.model.IssueStatus;
import jakarta.validation.constraints.NotNull;

public class IssueStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private IssueStatus status;
    private Double orderIndex;

    public IssueStatusUpdateRequest() {}
    public IssueStatusUpdateRequest(IssueStatus status) { this.status = status; }
    public IssueStatus getStatus() { return status; }
    public void setStatus(IssueStatus status) { this.status = status; }
    public Double getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Double orderIndex) { this.orderIndex = orderIndex; }
}
