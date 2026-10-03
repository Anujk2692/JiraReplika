package com.jirareplika.service;

import com.jirareplika.dto.DashboardStatsDto;
import com.jirareplika.dto.SprintDto;
import com.jirareplika.model.IssueStatus;
import com.jirareplika.model.SprintStatus;
import com.jirareplika.repository.IssueRepository;
import com.jirareplika.repository.SprintRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final IssueRepository issueRepository;
    private final SprintRepository sprintRepository;

    public DashboardService(IssueRepository issueRepository, SprintRepository sprintRepository) {
        this.issueRepository = issueRepository;
        this.sprintRepository = sprintRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats(Long projectId) {
        DashboardStatsDto stats = new DashboardStatsDto();

        stats.setTotalIssues(issueRepository.countByProjectId(projectId));
        stats.setCompletedIssues(issueRepository.countByProjectIdAndStatus(projectId, IssueStatus.DONE));
        stats.setTotalStoryPoints(issueRepository.sumStoryPointsByProjectId(projectId));
        stats.setCompletedStoryPoints(issueRepository.sumCompletedStoryPointsByProjectId(projectId));

        Map<String, Long> statusDist = new HashMap<>();
        List<Object[]> statusCounts = issueRepository.countIssuesByStatusForProject(projectId);
        for (Object[] row : statusCounts) {
            statusDist.put(row[0].toString(), (Long) row[1]);
        }
        stats.setStatusDistribution(statusDist);

        Map<String, Long> priorityDist = new HashMap<>();
        List<Object[]> priorityCounts = issueRepository.countIssuesByPriorityForProject(projectId);
        for (Object[] row : priorityCounts) {
            priorityDist.put(row[0].toString(), (Long) row[1]);
        }
        stats.setPriorityDistribution(priorityDist);

        Map<String, Long> typeDist = new HashMap<>();
        List<Object[]> typeCounts = issueRepository.countIssuesByTypeForProject(projectId);
        for (Object[] row : typeCounts) {
            typeDist.put(row[0].toString(), (Long) row[1]);
        }
        stats.setTypeDistribution(typeDist);

        Map<String, Long> assigneeDist = new HashMap<>();
        List<Object[]> assigneeCounts = issueRepository.countIssuesByAssigneeForProject(projectId);
        for (Object[] row : assigneeCounts) {
            assigneeDist.put((String) row[0], (Long) row[1]);
        }
        stats.setAssigneeWorkload(assigneeDist);

        sprintRepository.findFirstByProjectIdAndStatus(projectId, SprintStatus.ACTIVE)
            .ifPresent(sprint -> stats.setActiveSprint(SprintDto.fromEntity(sprint)));

        return stats;
    }
}
