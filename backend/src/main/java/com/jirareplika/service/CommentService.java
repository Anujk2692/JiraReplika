package com.jirareplika.service;

import com.jirareplika.dto.CommentCreateRequest;
import com.jirareplika.dto.CommentDto;
import com.jirareplika.model.Comment;
import com.jirareplika.model.Issue;
import com.jirareplika.model.User;
import com.jirareplika.repository.CommentRepository;
import com.jirareplika.repository.IssueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final IssueRepository issueRepository;
    private final ActivityLogService activityLogService;

    public CommentService(CommentRepository commentRepository, IssueRepository issueRepository, ActivityLogService activityLogService) {
        this.commentRepository = commentRepository;
        this.issueRepository = issueRepository;
        this.activityLogService = activityLogService;
    }

    @Transactional(readOnly = true)
    public List<CommentDto> getCommentsForIssue(Long issueId) {
        return commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId).stream()
            .map(CommentDto::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional
    public CommentDto addComment(Long issueId, CommentCreateRequest request, User currentUser) {
        Issue issue = issueRepository.findById(issueId)
            .orElseThrow(() -> new IllegalArgumentException("Issue not found: " + issueId));

        Comment comment = new Comment();
        comment.setIssue(issue);
        comment.setAuthor(currentUser);
        comment.setContent(request.getContent().trim());

        Comment saved = commentRepository.save(comment);
        activityLogService.logActivity(issue, currentUser, "COMMENT_ADDED", "Comment", null, "Added a comment");
        return CommentDto.fromEntity(saved);
    }

    @Transactional
    public void deleteComment(Long commentId, User currentUser) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + commentId));

        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You can only delete your own comments");
        }
        commentRepository.delete(comment);
    }
}
