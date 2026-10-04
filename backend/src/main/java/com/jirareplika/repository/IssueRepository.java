package com.jirareplika.repository;

import com.jirareplika.model.Issue;
import com.jirareplika.model.IssuePriority;
import com.jirareplika.model.IssueStatus;
import com.jirareplika.model.IssueType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {
    Optional<Issue> findByIssueKey(String issueKey);
    List<Issue> findByProjectIdOrderByOrderIndexAsc(Long projectId);
    List<Issue> findByProjectIdAndSprintIdOrderByOrderIndexAsc(Long projectId, Long sprintId);
    List<Issue> findByProjectIdAndSprintIsNullOrderByOrderIndexAsc(Long projectId);
    List<Issue> findByAssigneeIdOrderByUpdatedAtDesc(Long assigneeId);

    @Query("SELECT i FROM Issue i WHERE i.project.id = :projectId " +
           "AND (:sprintId IS NULL OR i.sprint.id = :sprintId) " +
           "AND (:status IS NULL OR i.status = :status) " +
           "AND (:assigneeId IS NULL OR i.assignee.id = :assigneeId) " +
           "AND (:priority IS NULL OR i.priority = :priority) " +
           "AND (:type IS NULL OR i.type = :type) " +
           "AND (:searchPattern IS NULL OR LOWER(i.summary) LIKE :searchPattern OR LOWER(i.issueKey) LIKE :searchPattern) " +
           "ORDER BY i.orderIndex ASC")
    List<Issue> filterIssues(
        @Param("projectId") Long projectId,
        @Param("sprintId") Long sprintId,
        @Param("status") IssueStatus status,
        @Param("assigneeId") Long assigneeId,
        @Param("priority") IssuePriority priority,
        @Param("type") IssueType type,
        @Param("searchPattern") String searchPattern
    );

    long countByProjectId(Long projectId);
    long countByProjectIdAndStatus(Long projectId, IssueStatus status);

    @Query("SELECT COALESCE(SUM(i.storyPoints), 0) FROM Issue i WHERE i.project.id = :projectId")
    int sumStoryPointsByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT COALESCE(SUM(i.storyPoints), 0) FROM Issue i WHERE i.project.id = :projectId AND i.status = 'DONE'")
    int sumCompletedStoryPointsByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT i.assignee.name, COUNT(i) FROM Issue i WHERE i.project.id = :projectId AND i.assignee IS NOT NULL GROUP BY i.assignee.name")
    List<Object[]> countIssuesByAssigneeForProject(@Param("projectId") Long projectId);

    @Query("SELECT i.status, COUNT(i) FROM Issue i WHERE i.project.id = :projectId GROUP BY i.status")
    List<Object[]> countIssuesByStatusForProject(@Param("projectId") Long projectId);

    @Query("SELECT i.priority, COUNT(i) FROM Issue i WHERE i.project.id = :projectId GROUP BY i.priority")
    List<Object[]> countIssuesByPriorityForProject(@Param("projectId") Long projectId);

    @Query("SELECT i.type, COUNT(i) FROM Issue i WHERE i.project.id = :projectId GROUP BY i.type")
    List<Object[]> countIssuesByTypeForProject(@Param("projectId") Long projectId);
}
