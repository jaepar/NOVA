package woorifisa.project.backend.domain.hospital.dto.response;

import java.util.List;

import woorifisa.project.backend.domain.hospital.entity.Hospital;

public record HospitalListResponse(
    List<HospitalItem> items
) {
    public static HospitalListResponse from(List<Hospital> hospitals) {
        return new HospitalListResponse(
            hospitals.stream()
                .map(HospitalItem::from)
                .toList()
        );
    }
}
