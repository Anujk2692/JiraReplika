package com.jirareplika.controller;

import com.jirareplika.dto.SprintCreateRequest;
import com.jirareplika.dto.SprintDto;
import com.jirareplika.dto.SprintUpdateRequest;
import com.jirareplika.service.SprintService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class SprintController {

    private final SprintService sprintService;

    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    @GetMapping("/projects/{projectId}/sprints")
    public ResponseEntity<List<SprintDto>> getSprintsForProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(sprintService.getSprintsForProject(projectId));
    }

    @GetMapping("/sprints/{id}")
    public ResponseEntity<SprintDto> getSprintById(@PathVariable Long id) {
        return ResponseEntity.ok(sprintService.getSprintById(id));
    }

    @PostMapping("/projects/{projectId}/sprints")
    public ResponseEntity<SprintDto> createSprint(@PathVariable Long projectId, @Valid @RequestBody SprintCreateRequest request) {
        return ResponseEntity.ok(sprintService.createSprint(projectId, request));
    }

    @PutMapping("/sprints/{id}")
    public ResponseEntity<SprintDto> updateSprint(@PathVariable Long id, @RequestBody SprintUpdateRequest request) {
        return ResponseEntity.ok(sprintService.updateSprint(id, request));
    }

    @PostMapping("/sprints/{id}/start")
    public ResponseEntity<SprintDto> startSprint(@PathVariable Long id) {
        return ResponseEntity.ok(sprintService.startSprint(id));
    }

    @PostMapping("/sprints/{id}/complete")
    public ResponseEntity<SprintDto> completeSprint(@PathVariable Long id) {
        return ResponseEntity.ok(sprintService.completeSprint(id));
    }

    @DeleteMapping("/sprints/{id}")
    public ResponseEntity<Void> deleteSprint(@PathVariable Long id) {
        sprintService.deleteSprint(id);
        return ResponseEntity.noContent().build();
    }
}
