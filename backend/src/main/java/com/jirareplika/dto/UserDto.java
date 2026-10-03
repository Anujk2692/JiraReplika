package com.jirareplika.dto;

import com.jirareplika.model.Role;
import com.jirareplika.model.User;

public class UserDto {
    private Long id;
    private String email;
    private String name;
    private String avatarUrl;
    private Role role;

    public UserDto() {}

    public UserDto(Long id, String email, String name, String avatarUrl, Role role) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.avatarUrl = avatarUrl;
        this.role = role;
    }

    public static UserDto fromEntity(User user) {
        if (user == null) return null;
        return new UserDto(user.getId(), user.getEmail(), user.getName(), user.getAvatarUrl(), user.getRole());
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
