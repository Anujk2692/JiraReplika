package com.jirareplika.dto;

import com.jirareplika.model.SprintStatus;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public class SprintCreateRequest {
    @NotBlank(message = "Sprint name is required")
    private String name;
    private String goal;
    private LocalDate startDate;
    private LocalDate endDate;
    private SprintStatus status = SprintStatus.FUTURE;

    public SprintCreateRequest() {}
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
}
