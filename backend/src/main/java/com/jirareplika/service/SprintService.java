package com.jirareplika.service;

import com.jirareplika.dto.SprintCreateRequest;
import com.jirareplika.dto.SprintDto;
import com.jirareplika.dto.SprintUpdateRequest;
import com.jirareplika.model.Issue;
import com.jirareplika.model.IssueStatus;
import com.jirareplika.model.Project;
import com.jirareplika.model.Sprint;
import com.jirareplika.model.SprintStatus;
import com.jirareplika.repository.IssueRepository;
import com.jirareplika.repository.ProjectRepository;
import com.jirareplika.repository.SprintRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final IssueRepository issueRepository;

    public SprintService(SprintRepository sprintRepository, ProjectRepository projectRepository, IssueRepository issueRepository) {
        this.sprintRepository = sprintRepository;
        this.projectRepository = projectRepository;
        this.issueRepository = issueRepository;
    }

    @Transactional(readOnly = true)
    public List<SprintDto> getSprintsForProject(Long projectId) {
        return sprintRepository.findByProjectIdOrderByCreatedAtAsc(projectId).stream().map(sprint -> {
            SprintDto dto = SprintDto.fromEntity(sprint);
            List<Issue> issues = issueRepository.findByProjectIdAndSprintIdOrderByOrderIndexAsc(projectId, sprint.getId());
            dto.setIssueCount(issues.size());
            int points = issues.stream().filter(i -> i.getStoryPoints() != null).mapToInt(Issue::getStoryPoints).sum();
            dto.setTotalStoryPoints(points);
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SprintDto getSprintById(Long id) {
        Sprint sprint = sprintRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Sprint not found: " + id));
        SprintDto dto = SprintDto.fromEntity(sprint);
        List<Issue> issues = issueRepository.findByProjectIdAndSprintIdOrderByOrderIndexAsc(sprint.getProject().getId(), sprint.getId());
        dto.setIssueCount(issues.size());
        dto.setTotalStoryPoints(issues.stream().filter(i -> i.getStoryPoints() != null).mapToInt(Issue::getStoryPoints).sum());
        return dto;
    }

    @Transactional
    public SprintDto createSprint(Long projectId, SprintCreateRequest request) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        Sprint sprint = new Sprint();
        sprint.setName(request.getName().trim());
        sprint.setGoal(request.getGoal());
        sprint.setStartDate(request.getStartDate());
        sprint.setEndDate(request.getEndDate());
        sprint.setStatus(request.getStatus() != null ? request.getStatus() : SprintStatus.FUTURE);
        sprint.setProject(project);

        return SprintDto.fromEntity(sprintRepository.save(sprint));
    }

    @Transactional
    public SprintDto updateSprint(Long sprintId, SprintUpdateRequest request) {
        Sprint sprint = sprintRepository.findById(sprintId)
            .orElseThrow(() -> new IllegalArgumentException("Sprint not found: " + sprintId));

        if (request.getName() != null && !request.getName().isBlank()) sprint.setName(request.getName().trim());
        if (request.getGoal() != null) sprint.setGoal(request.getGoal());
        if (request.getStartDate() != null) sprint.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) sprint.setEndDate(request.getEndDate());
        if (request.getStatus() != null) sprint.setStatus(request.getStatus());

        return SprintDto.fromEntity(sprintRepository.save(sprint));
    }

    @Transactional
    public SprintDto startSprint(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
            .orElseThrow(() -> new IllegalArgumentException("Sprint not found: " + sprintId));

        sprint.setStatus(SprintStatus.ACTIVE);
        if (sprint.getStartDate() == null) sprint.setStartDate(LocalDate.now());
        if (sprint.getEndDate() == null) sprint.setEndDate(LocalDate.now().plusWeeks(2));

        return SprintDto.fromEntity(sprintRepository.save(sprint));
    }

    @Transactional
    public SprintDto completeSprint(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
            .orElseThrow(() -> new IllegalArgumentException("Sprint not found: " + sprintId));

        sprint.setStatus(SprintStatus.CLOSED);
        sprint.setEndDate(LocalDate.now());

        List<Issue> issues = issueRepository.findByProjectIdAndSprintIdOrderByOrderIndexAsc(sprint.getProject().getId(), sprint.getId());
        for (Issue issue : issues) {
            if (issue.getStatus() != IssueStatus.DONE) {
                issue.setSprint(null);
                issueRepository.save(issue);
            }
        }

        return SprintDto.fromEntity(sprintRepository.save(sprint));
    }

    @Transactional
    public void deleteSprint(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
            .orElseThrow(() -> new IllegalArgumentException("Sprint not found: " + sprintId));

        List<Issue> issues = issueRepository.findByProjectIdAndSprintIdOrderByOrderIndexAsc(sprint.getProject().getId(), sprint.getId());
        for (Issue issue : issues) {
            issue.setSprint(null);
            issueRepository.save(issue);
        }

        sprintRepository.delete(sprint);
    }
}
