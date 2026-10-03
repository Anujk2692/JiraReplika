package com.jirareplika.service;

import com.jirareplika.dto.IssueCreateRequest;
import com.jirareplika.dto.IssueDto;
import com.jirareplika.dto.IssueUpdateRequest;
import com.jirareplika.model.*;
import com.jirareplika.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class IssueService {

    private final IssueRepository issueRepository;
    private final ProjectRepository projectRepository;
    private final SprintRepository sprintRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final ActivityLogService activityLogService;

    public IssueService(
        IssueRepository issueRepository,
        ProjectRepository projectRepository,
        SprintRepository sprintRepository,
        UserRepository userRepository,
        CommentRepository commentRepository,
        ActivityLogService activityLogService
    ) {
        this.issueRepository = issueRepository;
        this.projectRepository = projectRepository;
        this.sprintRepository = sprintRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.activityLogService = activityLogService;
    }

    @Transactional(readOnly = true)
    public List<IssueDto> filterIssues(
        Long projectId,
        Long sprintId,
        IssueStatus status,
        Long assigneeId,
        IssuePriority priority,
        IssueType type,
        String search
    ) {
        List<Issue> issues = issueRepository.filterIssues(
            projectId,
            sprintId,
            status,
            assigneeId,
            priority,
            type,
            (search != null && !search.isBlank()) ? search.trim() : null
        );

        return issues.stream().map(this::enrichDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<IssueDto> getBacklogIssues(Long projectId) {
        return issueRepository.findByProjectIdAndSprintIsNullOrderByOrderIndexAsc(projectId).stream()
            .map(this::enrichDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<IssueDto> getIssuesAssignedToUser(Long userId) {
        return issueRepository.findByAssigneeIdOrderByUpdatedAtDesc(userId).stream()
            .map(this::enrichDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public IssueDto getIssueById(Long id) {
        Issue issue = issueRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Issue not found: " + id));
        return enrichDto(issue);
    }

    @Transactional(readOnly = true)
    public IssueDto getIssueByKey(String key) {
        Issue issue = issueRepository.findByIssueKey(key.toUpperCase().trim())
            .orElseThrow(() -> new IllegalArgumentException("Issue not found: " + key));
        return enrichDto(issue);
    }

    @Transactional
    public IssueDto createIssue(IssueCreateRequest request, User currentUser) {
        Project project = projectRepository.findById(request.getProjectId())
            .orElseThrow(() -> new IllegalArgumentException("Project not found: " + request.getProjectId()));

        long counter = (project.getIssueCounter() != null ? project.getIssueCounter() : 0L) + 1;
        project.setIssueCounter(counter);
        projectRepository.save(project);

        String issueKey = project.getKey() + "-" + counter;

        Issue issue = new Issue();
        issue.setIssueKey(issueKey);
        issue.setSummary(request.getSummary().trim());
        issue.setDescription(request.getDescription());
        issue.setType(request.getType() != null ? request.getType() : IssueType.TASK);
        issue.setPriority(request.getPriority() != null ? request.getPriority() : IssuePriority.MEDIUM);
        issue.setStatus(request.getStatus() != null ? request.getStatus() : IssueStatus.TO_DO);
        issue.setProject(project);
        issue.setReporter(currentUser);

        if (request.getAssigneeId() != null) {
            userRepository.findById(request.getAssigneeId()).ifPresent(issue::setAssignee);
        }
        if (request.getSprintId() != null) {
            sprintRepository.findById(request.getSprintId()).ifPresent(issue::setSprint);
        }
        if (request.getParentId() != null) {
            issueRepository.findById(request.getParentId()).ifPresent(issue::setParent);
        }

        issue.setStoryPoints(request.getStoryPoints());
        issue.setDueDate(request.getDueDate());
        if (request.getLabels() != null) issue.setLabels(request.getLabels());

        Issue saved = issueRepository.save(issue);
        activityLogService.logActivity(saved, currentUser, "CREATED", null, null, "Created issue " + issueKey);
        return enrichDto(saved);
    }

    @Transactional
    public IssueDto updateIssue(Long id, IssueUpdateRequest request, User currentUser) {
        Issue issue = issueRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Issue not found: " + id));

        if (request.getSummary() != null && !request.getSummary().isBlank()) issue.setSummary(request.getSummary().trim());
        if (request.getDescription() != null) issue.setDescription(request.getDescription());
        if (request.getType() != null) issue.setType(request.getType());

        if (request.getPriority() != null && issue.getPriority() != request.getPriority()) {
            activityLogService.logActivity(issue, currentUser, "PRIORITY_CHANGE", "Priority", issue.getPriority().name(), request.getPriority().name());
            issue.setPriority(request.getPriority());
        }
        if (request.getStatus() != null && issue.getStatus() != request.getStatus()) {
            activityLogService.logActivity(issue, currentUser, "STATUS_CHANGE", "Status", issue.getStatus().name(), request.getStatus().name());
            issue.setStatus(request.getStatus());
        }
        if (request.getAssigneeId() != null) {
            User newAssignee = userRepository.findById(request.getAssigneeId()).orElse(null);
            String oldName = issue.getAssignee() != null ? issue.getAssignee().getName() : "Unassigned";
            String newName = newAssignee != null ? newAssignee.getName() : "Unassigned";
            activityLogService.logActivity(issue, currentUser, "ASSIGNEE_CHANGE", "Assignee", oldName, newName);
            issue.setAssignee(newAssignee);
        }
        if (request.getSprintId() != null) {
            issue.setSprint(sprintRepository.findById(request.getSprintId()).orElse(null));
        }
        if (request.getParentId() != null) {
            issue.setParent(issueRepository.findById(request.getParentId()).orElse(null));
        }
        if (request.getStoryPoints() != null) issue.setStoryPoints(request.getStoryPoints());
        if (request.getDueDate() != null) issue.setDueDate(request.getDueDate());
        if (request.getLabels() != null) issue.setLabels(request.getLabels());

        return enrichDto(issueRepository.save(issue));
    }

    @Transactional
    public IssueDto updateStatus(Long id, IssueStatus newStatus, Double orderIndex, User currentUser) {
        Issue issue = issueRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Issue not found: " + id));

        if (issue.getStatus() != newStatus) {
            activityLogService.logActivity(issue, currentUser, "STATUS_CHANGE", "Status", issue.getStatus().name(), newStatus.name());
            issue.setStatus(newStatus);
        }
        if (orderIndex != null) issue.setOrderIndex(orderIndex);

        return enrichDto(issueRepository.save(issue));
    }

    @Transactional
    public IssueDto updateAssignee(Long id, Long assigneeId, User currentUser) {
        Issue issue = issueRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Issue not found: " + id));

        User newAssignee = assigneeId != null ? userRepository.findById(assigneeId).orElse(null) : null;
        String oldName = issue.getAssignee() != null ? issue.getAssignee().getName() : "Unassigned";
        String newName = newAssignee != null ? newAssignee.getName() : "Unassigned";

        if (!oldName.equals(newName)) {
            activityLogService.logActivity(issue, currentUser, "ASSIGNEE_CHANGE", "Assignee", oldName, newName);
            issue.setAssignee(newAssignee);
        }

        return enrichDto(issueRepository.save(issue));
    }

    @Transactional
    public IssueDto moveSprint(Long id, Long sprintId, User currentUser) {
        Issue issue = issueRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Issue not found: " + id));

        Sprint sprint = sprintId != null ? sprintRepository.findById(sprintId).orElse(null) : null;
        String oldSprint = issue.getSprint() != null ? issue.getSprint().getName() : "Backlog";
        String newSprint = sprint != null ? sprint.getName() : "Backlog";

        activityLogService.logActivity(issue, currentUser, "SPRINT_MOVE", "Sprint", oldSprint, newSprint);
        issue.setSprint(sprint);

        return enrichDto(issueRepository.save(issue));
    }

    @Transactional
    public void deleteIssue(Long id) {
        if (!issueRepository.existsById(id)) {
            throw new IllegalArgumentException("Issue not found: " + id);
        }
        issueRepository.deleteById(id);
    }

    private IssueDto enrichDto(Issue issue) {
        IssueDto dto = IssueDto.fromEntity(issue);
        dto.setCommentsCount(commentRepository.countByIssueId(issue.getId()));
        return dto;
    }
}
