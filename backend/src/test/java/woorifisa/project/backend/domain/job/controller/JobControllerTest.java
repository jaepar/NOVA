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
import woorifisa.project.backend.domain.job.dto.response.JobOpeningResponse;
import woorifisa.project.backend.domain.job.service.JobService;
import woorifisa.project.backend.global.exception.CustomException;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static woorifisa.project.backend.global.response.status.BaseExceptionResponseStatus.JOB_NOT_FOUND;

@WebMvcTest(JobController.class)
class JobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JobService jobService;

    @MockitoBean
    private JpaMetamodelMappingContext jpaMetamodelMappingContext;

    @Test
    @DisplayName("public users can find job openings")
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
                        "Backend Developer",
                        "IT",
                        "ENTRY",
                        "FULL_TIME",
                        "Company policy",
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
                .andExpect(jsonPath("$.data.job_openings[0].opening_title").value("Backend Developer"))
                .andExpect(jsonPath("$.data.job_openings[0].job_category").value("IT"))
                .andExpect(jsonPath("$.data.job_openings[0].experience").value("ENTRY"))
                .andExpect(jsonPath("$.data.job_openings[0].employment_type").value("FULL_TIME"))
                .andExpect(jsonPath("$.data.job_openings[0].salary").value("Company policy"))
                .andExpect(jsonPath("$.data.job_openings[0].deadline_type").value("UNTIL_FILLED"))
                .andExpect(jsonPath("$.data.job_openings[0].created_at").value("2026-05-13T12:30:00"));
    }

    @Test
    @DisplayName("public users can find a job opening detail")
    void findJobOpeningPublic() throws Exception {
        JobOpeningResponse response = new JobOpeningResponse(
                1L,
                "ABC Company",
                "SEOUL",
                "Backend Developer",
                "IT",
                "ENTRY",
                "Annual 35M KRW or more",
                "UNTIL_FILLED",
                "2",
                "Java/Spring experience",
                "Any",
                "Any",
                "Backend development",
                "1 year or more",
                "FULL_TIME",
                "Meal support, insurance",
                "Seoul Gangnam-gu",
                "Company introduction"
        );
        when(jobService.findJobOpening(1L)).thenReturn(response);

        mockMvc.perform(get("/jobs/{jobId}", 1L)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.code").value(20000))
                .andExpect(jsonPath("$.data.job_id").value(1))
                .andExpect(jsonPath("$.data.company").value("ABC Company"))
                .andExpect(jsonPath("$.data.region").value("SEOUL"))
                .andExpect(jsonPath("$.data.opening_title").value("Backend Developer"))
                .andExpect(jsonPath("$.data.job_category").value("IT"))
                .andExpect(jsonPath("$.data.experience").value("ENTRY"))
                .andExpect(jsonPath("$.data.salary").value("Annual 35M KRW or more"))
                .andExpect(jsonPath("$.data.deadline_type").value("UNTIL_FILLED"))
                .andExpect(jsonPath("$.data.recruit_count").value("2"))
                .andExpect(jsonPath("$.data.preferred").value("Java/Spring experience"))
                .andExpect(jsonPath("$.data.age").value("Any"))
                .andExpect(jsonPath("$.data.gender").value("Any"))
                .andExpect(jsonPath("$.data.job_role").value("Backend development"))
                .andExpect(jsonPath("$.data.work_period").value("1 year or more"))
                .andExpect(jsonPath("$.data.employment_type").value("FULL_TIME"))
                .andExpect(jsonPath("$.data.benefits").value("Meal support, insurance"))
                .andExpect(jsonPath("$.data.address").value("Seoul Gangnam-gu"))
                .andExpect(jsonPath("$.data.introduce").value("Company introduction"));
    }

    @Test
    @DisplayName("return custom error when job opening detail does not exist")
    void findJobOpeningNotFound() throws Exception {
        when(jobService.findJobOpening(999L)).thenThrow(new CustomException(JOB_NOT_FOUND));

        mockMvc.perform(get("/jobs/{jobId}", 999L)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value(JOB_NOT_FOUND.getCode()))
                .andExpect(jsonPath("$.message").value(JOB_NOT_FOUND.getMessage()))
                .andExpect(jsonPath("$.data").doesNotExist());
    }
}
