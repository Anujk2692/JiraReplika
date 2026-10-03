package com.jirareplika.controller;

import com.jirareplika.dto.CommentCreateRequest;
import com.jirareplika.dto.CommentDto;
import com.jirareplika.service.CommentService;
import com.jirareplika.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CommentController {

    private final CommentService commentService;
    private final UserService userService;

    public CommentController(CommentService commentService, UserService userService) {
        this.commentService = commentService;
        this.userService = userService;
    }

    @GetMapping("/issues/{issueId}/comments")
    public ResponseEntity<List<CommentDto>> getCommentsForIssue(@PathVariable Long issueId) {
        return ResponseEntity.ok(commentService.getCommentsForIssue(issueId));
    }

    @PostMapping("/issues/{issueId}/comments")
    public ResponseEntity<CommentDto> addComment(@PathVariable Long issueId, @Valid @RequestBody CommentCreateRequest request) {
        return ResponseEntity.ok(commentService.addComment(issueId, request, userService.getCurrentUser()));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id, userService.getCurrentUser());
        return ResponseEntity.noContent().build();
    }
}
