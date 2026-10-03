package com.jirareplika.controller;

import com.jirareplika.dto.*;
import com.jirareplika.model.*;
import com.jirareplika.service.IssueService;
import com.jirareplika.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueService issueService;
    private final UserService userService;

    public IssueController(IssueService issueService, UserService userService) {
        this.issueService = issueService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<IssueDto>> filterIssues(
        @RequestParam Long projectId,
        @RequestParam(required = false) Long sprintId,
        @RequestParam(required = false) IssueStatus status,
        @RequestParam(required = false) Long assigneeId,
        @RequestParam(required = false) IssuePriority priority,
        @RequestParam(required = false) IssueType type,
        @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(issueService.filterIssues(projectId, sprintId, status, assigneeId, priority, type, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IssueDto> getIssueById(@PathVariable Long id) {
        return ResponseEntity.ok(issueService.getIssueById(id));
    }

    @GetMapping("/key/{key}")
    public ResponseEntity<IssueDto> getIssueByKey(@PathVariable String key) {
        return ResponseEntity.ok(issueService.getIssueByKey(key));
    }

    @GetMapping("/backlog")
    public ResponseEntity<List<IssueDto>> getBacklogIssues(@RequestParam Long projectId) {
        return ResponseEntity.ok(issueService.getBacklogIssues(projectId));
    }

    @GetMapping("/my-issues")
    public ResponseEntity<List<IssueDto>> getMyIssues() {
        return ResponseEntity.ok(issueService.getIssuesAssignedToUser(userService.getCurrentUser().getId()));
    }

    @PostMapping
    public ResponseEntity<IssueDto> createIssue(@Valid @RequestBody IssueCreateRequest request) {
        return ResponseEntity.ok(issueService.createIssue(request, userService.getCurrentUser()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IssueDto> updateIssue(@PathVariable Long id, @RequestBody IssueUpdateRequest request) {
        return ResponseEntity.ok(issueService.updateIssue(id, request, userService.getCurrentUser()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<IssueDto> updateStatus(@PathVariable Long id, @Valid @RequestBody IssueStatusUpdateRequest request) {
        return ResponseEntity.ok(issueService.updateStatus(id, request.getStatus(), request.getOrderIndex(), userService.getCurrentUser()));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<IssueDto> updateAssignee(@PathVariable Long id, @RequestBody IssueAssigneeUpdateRequest request) {
        return ResponseEntity.ok(issueService.updateAssignee(id, request.getAssigneeId(), userService.getCurrentUser()));
    }

    @PatchMapping("/{id}/move-sprint")
    public ResponseEntity<IssueDto> moveSprint(@PathVariable Long id, @RequestBody IssueMoveSprintRequest request) {
        return ResponseEntity.ok(issueService.moveSprint(id, request.getSprintId(), userService.getCurrentUser()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long id) {
        issueService.deleteIssue(id);
        return ResponseEntity.noContent().build();
    }
}
