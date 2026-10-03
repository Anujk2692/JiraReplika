package com.jirareplika;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(classes = JiraApplication.class)
@ActiveProfiles("dev")
class JiraApplicationTests {

    @Test
    void contextLoads() {
    }
}
