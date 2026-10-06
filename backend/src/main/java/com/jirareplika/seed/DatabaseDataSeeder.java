package com.jirareplika.seed;

import com.jirareplika.model.*;
import com.jirareplika.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class DatabaseDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final SprintRepository sprintRepository;
    private final IssueRepository issueRepository;
    private final CommentRepository commentRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseDataSeeder(
        UserRepository userRepository,
        ProjectRepository projectRepository,
        SprintRepository sprintRepository,
        IssueRepository issueRepository,
        CommentRepository commentRepository,
        ActivityLogRepository activityLogRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.sprintRepository = sprintRepository;
        this.issueRepository = issueRepository;
        this.commentRepository = commentRepository;
        this.activityLogRepository = activityLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Upgrade any existing demo users with @jira.dev to @pm.dev
        userRepository.findAll().forEach(u -> {
            if (u.getEmail().endsWith("@jira.dev")) {
                u.setEmail(u.getEmail().replace("@jira.dev", "@pm.dev"));
                userRepository.save(u);
            }
        });

        if (userRepository.count() > 0) return;

        User alex = new User(null, "alex.admin@pm.dev", "Alex Rivera", passwordEncoder.encode("Password123!"), "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", Role.ROLE_ADMIN);
        User sarah = new User(null, "sarah.lead@pm.dev", "Sarah Chen", passwordEncoder.encode("Password123!"), "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80", Role.ROLE_PROJECT_LEAD);
        User david = new User(null, "david.dev@pm.dev", "David Miller", passwordEncoder.encode("Password123!"), "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", Role.ROLE_MEMBER);
        User elena = new User(null, "elena.qa@pm.dev", "Elena Rostova", passwordEncoder.encode("Password123!"), "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", Role.ROLE_MEMBER);

        userRepository.saveAll(List.of(alex, sarah, david, elena));

        Project project = new Project();
        project.setName("Cloud Infrastructure & App");
        project.setKey("CLOUD");
        project.setDescription("Next-generation cloud infrastructure, microservices platform, and multi-tenant applications.");
        project.setCategory("SOFTWARE");
        project.setLead(alex);
        project.setMembers(new HashSet<>(List.of(alex, sarah, david, elena)));
        project.setIssueCounter(10L);
        project = projectRepository.save(project);

        Sprint sprintClosed = new Sprint();
        sprintClosed.setName("Sprint 1 - Foundation & Schemas");
        sprintClosed.setGoal("Establish database schema, baseline security, and project architecture.");
        sprintClosed.setStartDate(LocalDate.now().minusWeeks(4));
        sprintClosed.setEndDate(LocalDate.now().minusWeeks(2));
        sprintClosed.setStatus(SprintStatus.CLOSED);
        sprintClosed.setProject(project);
        sprintRepository.save(sprintClosed);

        Sprint sprintActive = new Sprint();
        sprintActive.setName("Sprint 2 - Kanban Board & Task Hierarchy");
        sprintActive.setGoal("Deliver drag-and-drop Kanban workflow, issue assignment, and real-time sprint views.");
        sprintActive.setStartDate(LocalDate.now().minusDays(3));
        sprintActive.setEndDate(LocalDate.now().plusDays(11));
        sprintActive.setStatus(SprintStatus.ACTIVE);
        sprintActive.setProject(project);
        sprintActive = sprintRepository.save(sprintActive);

        Sprint sprintFuture = new Sprint();
        sprintFuture.setName("Sprint 3 - Advanced Analytics & Webhooks");
        sprintFuture.setGoal("Build burndown charts, velocity metrics, and external integration webhooks.");
        sprintFuture.setStartDate(LocalDate.now().plusDays(12));
        sprintFuture.setEndDate(LocalDate.now().plusDays(26));
        sprintFuture.setStatus(SprintStatus.FUTURE);
        sprintFuture.setProject(project);
        sprintRepository.save(sprintFuture);

        Issue epic1 = createIssue(project, null, "CLOUD-1", "Identity, RBAC and Multi-tenant Workspace Architecture",
            "Establish unified identity provider, OAuth2/JWT tokens, granular RBAC permissions across projects.",
            IssueType.EPIC, IssuePriority.HIGHEST, IssueStatus.DONE, alex, alex, 13, LocalDate.now().plusDays(5), Set.of("Architecture", "Security"));

        Issue story1 = createIssue(project, sprintActive, "CLOUD-2", "Drag and drop Kanban board with animated state transitions",
            "Enable smooth drag and drop cards across columns: Backlog, To Do, In Progress, In Review, and Done.",
            IssueType.STORY, IssuePriority.HIGH, IssueStatus.IN_PROGRESS, sarah, david, 8, LocalDate.now().plusDays(3), Set.of("Frontend", "UX"));

        Issue task1 = createIssue(project, sprintActive, "CLOUD-3", "PostgreSQL schema indexing for high-frequency queries",
            "Add B-tree indexes for project_id, sprint_id, status, and assignee_id to ensure sub-50ms API response times.",
            IssueType.TASK, IssuePriority.MEDIUM, IssueStatus.DONE, alex, david, 3, LocalDate.now().minusDays(1), Set.of("Database", "Performance"));

        Issue bug1 = createIssue(project, sprintActive, "CLOUD-4", "Fix modal backdrop focus trap on Safari mobile",
            "When opening issue details drawer on mobile WebKit, keyboard focus slips behind the modal backdrop.",
            IssueType.BUG, IssuePriority.HIGH, IssueStatus.IN_REVIEW, elena, david, 2, LocalDate.now().plusDays(2), Set.of("Bug", "Mobile"));

        Issue task2 = createIssue(project, sprintActive, "CLOUD-5", "Assignee multi-select filter and 'Only My Issues' toggle",
            "Provide quick filter bar on top of the board to toggle user-specific tasks or filter by priority badges.",
            IssueType.TASK, IssuePriority.LOW, IssueStatus.TO_DO, sarah, sarah, 5, LocalDate.now().plusDays(7), Set.of("Frontend"));

        Issue bug2 = createIssue(project, sprintActive, "CLOUD-6", "JWT expiration handling and silent token refresh",
            "Expired access tokens should automatically refresh or gracefully route the user to login modal without losing edits.",
            IssueType.BUG, IssuePriority.HIGHEST, IssueStatus.TO_DO, alex, elena, 5, LocalDate.now().plusDays(4), Set.of("Security"));

        Issue backlog1 = createIssue(project, null, "CLOUD-7", "Export sprint reports to PDF and CSV formats",
            "Allow project leads to export burndown summaries and completed issue logs for sprint reviews.",
            IssueType.STORY, IssuePriority.LOW, IssueStatus.BACKLOG, sarah, null, 5, LocalDate.now().plusDays(20), Set.of("Reports"));

        Issue backlog2 = createIssue(project, null, "CLOUD-8", "Automated GitHub and GitLab pull request status linking",
            "Detect branch names containing issue keys (e.g. CLOUD-2-kanban) and sync PR review status.",
            IssueType.STORY, IssuePriority.MEDIUM, IssueStatus.BACKLOG, alex, david, 8, LocalDate.now().plusDays(25), Set.of("DevOps"));

        Comment comment1 = new Comment();
        comment1.setIssue(story1);
        comment1.setAuthor(david);
        comment1.setContent("I have wired up HTML5 Drag & Drop and touch event fallbacks. Tested smoothly on desktop and mobile.");
        commentRepository.save(comment1);

        Comment comment2 = new Comment();
        comment2.setIssue(story1);
        comment2.setAuthor(sarah);
        comment2.setContent("Looks great David! Let's make sure the column status update PATCH request is optimistic.");
        commentRepository.save(comment2);

        Comment comment3 = new Comment();
        comment3.setIssue(bug1);
        comment3.setAuthor(elena);
        comment3.setContent("Confirmed the issue on iOS Safari 17.2. Adding inert attribute fixes the focus trap.");
        commentRepository.save(comment3);

        activityLogRepository.save(new ActivityLog(story1, david, "STATUS_CHANGE", "Status", "TO_DO", "IN_PROGRESS"));
        activityLogRepository.save(new ActivityLog(bug1, elena, "STATUS_CHANGE", "Status", "IN_PROGRESS", "IN_REVIEW"));
        activityLogRepository.save(new ActivityLog(task1, david, "STATUS_CHANGE", "Status", "IN_REVIEW", "DONE"));
    }

    private Issue createIssue(
        Project project,
        Sprint sprint,
        String key,
        String summary,
        String description,
        IssueType type,
        IssuePriority priority,
        IssueStatus status,
        User reporter,
        User assignee,
        Integer points,
        LocalDate dueDate,
        Set<String> labels
    ) {
        Issue issue = new Issue();
        issue.setProject(project);
        issue.setSprint(sprint);
        issue.setIssueKey(key);
        issue.setSummary(summary);
        issue.setDescription(description);
        issue.setType(type);
        issue.setPriority(priority);
        issue.setStatus(status);
        issue.setReporter(reporter);
        issue.setAssignee(assignee);
        issue.setStoryPoints(points);
        issue.setDueDate(dueDate);
        issue.setLabels(new HashSet<>(labels));
        issue.setOrderIndex((double) System.currentTimeMillis());
        return issueRepository.save(issue);
    }
}
