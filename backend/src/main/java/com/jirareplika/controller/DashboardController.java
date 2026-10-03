package com.jirareplika.controller;

import com.jirareplika.dto.DashboardStatsDto;
import com.jirareplika.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects/{projectId}/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardStatsDto> getDashboardStats(@PathVariable Long projectId) {
        return ResponseEntity.ok(dashboardService.getDashboardStats(projectId));
    }
}
