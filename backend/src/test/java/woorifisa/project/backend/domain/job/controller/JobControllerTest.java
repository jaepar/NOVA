package woorifisa.project.backend.domain.job.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import woorifisa.project.backend.domain.job.dto.response.JobOpeningItem;
import woorifisa.project.backend.domain.job.dto.response.JobOpeningListResponse;
import woorifisa.project.backend.domain.job.service.JobService;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(JobController.class)
class JobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JobService jobService;

    @MockitoBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Test
    @DisplayName("비로그인 사용자도 구인구직 공고 목록을 조회할 수 있다")
    void findJobOpeningsPublic() throws Exception {
        JobOpeningListResponse response = new JobOpeningListResponse(
                1,
                1,
                0,
                10,
                List.of(new JobOpeningItem(
                        1L,
                        "ABC Company",
                        "SEOUL",
                        "백엔드 개발자 모집",
                        "IT",
                        "ENTRY",
                        "FULL_TIME",
                        "회사 내규에 따름",
                        "UNTIL_FILLED",
                        LocalDateTime.of(2026, 5, 13, 12, 30)
                ))
        );
        when(jobService.findJobOpenings(0, 10)).thenReturn(response);

        mockMvc.perform(get("/jobs")
                        .param("page", "0")
                        .param("size", "10")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value(20000))
                .andExpect(jsonPath("$.data.total_count").value(1))
                .andExpect(jsonPath("$.data.total_pages").value(1))
                .andExpect(jsonPath("$.data.page").value(0))
                .andExpect(jsonPath("$.data.size").value(10))
                .andExpect(jsonPath("$.data.job_openings", hasSize(1)))
                .andExpect(jsonPath("$.data.job_openings[0].job_id").value(1))
                .andExpect(jsonPath("$.data.job_openings[0].company").value("ABC Company"))
                .andExpect(jsonPath("$.data.job_openings[0].region").value("SEOUL"))
                .andExpect(jsonPath("$.data.job_openings[0].opening_title").value("백엔드 개발자 모집"))
                .andExpect(jsonPath("$.data.job_openings[0].job_category").value("IT"))
                .andExpect(jsonPath("$.data.job_openings[0].experience").value("ENTRY"))
                .andExpect(jsonPath("$.data.job_openings[0].employment_type").value("FULL_TIME"))
                .andExpect(jsonPath("$.data.job_openings[0].salary").value("회사 내규에 따름"))
                .andExpect(jsonPath("$.data.job_openings[0].deadline_type").value("UNTIL_FILLED"))
                .andExpect(jsonPath("$.data.job_openings[0].created_at").value("2026-05-13T12:30:00"));
    }
}
