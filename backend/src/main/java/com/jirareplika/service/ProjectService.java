package com.jirareplika.service;

import com.jirareplika.dto.ProjectCreateRequest;
import com.jirareplika.dto.ProjectDto;
import com.jirareplika.model.Project;
import com.jirareplika.model.User;
import com.jirareplika.repository.ProjectRepository;
import com.jirareplika.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> getAllProjects(User user) {
        return projectRepository.findProjectsForUser(user.getId()).stream()
            .map(ProjectDto::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectDto getProjectById(Long id) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + id));
        return ProjectDto.fromEntity(project);
    }

    @Transactional(readOnly = true)
    public ProjectDto getProjectByKey(String key) {
        Project project = projectRepository.findByKey(key.toUpperCase())
            .orElseThrow(() -> new IllegalArgumentException("Project not found with key: " + key));
        return ProjectDto.fromEntity(project);
    }

    @Transactional
    public ProjectDto createProject(ProjectCreateRequest request, User currentUser) {
        String key = request.getKey().trim().toUpperCase();
        if (projectRepository.existsByKey(key)) {
            throw new IllegalArgumentException("Project key " + key + " is already taken");
        }

        User lead = currentUser;
        if (request.getLeadId() != null) {
            lead = userRepository.findById(request.getLeadId()).orElse(currentUser);
        }

        Project project = new Project();
        project.setName(request.getName().trim());
        project.setKey(key);
        project.setDescription(request.getDescription());
        project.setCategory(request.getCategory() != null ? request.getCategory() : "SOFTWARE");
        project.setLead(lead);

        Set<User> members = new HashSet<>();
        members.add(lead);
        if (request.getMemberIds() != null && !request.getMemberIds().isEmpty()) {
            members.addAll(userRepository.findAllById(request.getMemberIds()));
        }
        project.setMembers(members);

        Project saved = projectRepository.save(project);
        return ProjectDto.fromEntity(saved);
    }

    @Transactional
    public ProjectDto updateProject(Long id, ProjectCreateRequest request) {
        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + id));

        project.setName(request.getName().trim());
        project.setDescription(request.getDescription());
        if (request.getCategory() != null) project.setCategory(request.getCategory());

        if (request.getLeadId() != null) {
            User lead = userRepository.findById(request.getLeadId())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + request.getLeadId()));
            project.setLead(lead);
            project.getMembers().add(lead);
        }

        if (request.getMemberIds() != null) {
            Set<User> members = new HashSet<>(userRepository.findAllById(request.getMemberIds()));
            members.add(project.getLead());
            project.setMembers(members);
        }

        return ProjectDto.fromEntity(projectRepository.save(project));
    }

    @Transactional
    public ProjectDto addMember(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        project.getMembers().add(user);
        return ProjectDto.fromEntity(projectRepository.save(project));
    }

    @Transactional
    public ProjectDto removeMember(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        if (project.getLead().getId().equals(userId)) {
            throw new IllegalArgumentException("Cannot remove project lead from members");
        }

        project.getMembers().removeIf(u -> u.getId().equals(userId));
        return ProjectDto.fromEntity(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new IllegalArgumentException("Project not found: " + id);
        }
        projectRepository.deleteById(id);
    }
}
