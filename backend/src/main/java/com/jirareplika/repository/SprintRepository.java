package com.jirareplika.repository;

import com.jirareplika.model.Sprint;
import com.jirareplika.model.SprintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {
    List<Sprint> findByProjectIdOrderByCreatedAtAsc(Long projectId);
    Optional<Sprint> findFirstByProjectIdAndStatus(Long projectId, SprintStatus status);
}
