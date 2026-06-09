package woorifisa.project.backend.domain.hospital.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import woorifisa.project.backend.domain.hospital.dto.request.CreateReservationRequest;
import woorifisa.project.backend.domain.hospital.dto.response.HospitalListResponse;
import woorifisa.project.backend.domain.hospital.entity.enums.DepartmentType;
import woorifisa.project.backend.domain.hospital.service.HospitalService;
import woorifisa.project.backend.global.auth.security.SessionUserPrincipal;
import woorifisa.project.backend.global.response.BaseResponse;

@RestController
@RequiredArgsConstructor
@RequestMapping("/hospital")
public class HospitalController {

    private final HospitalService hospitalService;

    @GetMapping
    public BaseResponse<HospitalListResponse> findHospitals(
        @AuthenticationPrincipal SessionUserPrincipal principal,
        @RequestParam(required = false) DepartmentType type
    ) {
        return BaseResponse.ok(hospitalService.findHospitals(type));
    }

    @PostMapping("/reservations")
    public BaseResponse<Void> createReservation(
        @AuthenticationPrincipal SessionUserPrincipal principal,
        @RequestBody CreateReservationRequest request
    ) {
        hospitalService.createReservation(principal.userId(), request);
        return BaseResponse.ok(null);
    }
}
