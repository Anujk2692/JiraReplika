package com.jirareplika.dto;

import jakarta.validation.constraints.NotBlank;

public class CommentCreateRequest {
    @NotBlank(message = "Comment content cannot be blank")
    private String content;
    public CommentCreateRequest() {}
    public CommentCreateRequest(String content) { this.content = content; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
