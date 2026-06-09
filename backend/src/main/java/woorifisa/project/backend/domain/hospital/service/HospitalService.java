package woorifisa.project.backend.domain.hospital.service;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import woorifisa.project.backend.domain.hospital.dto.response.HospitalListResponse;
import woorifisa.project.backend.domain.hospital.entity.Hospital;
import woorifisa.project.backend.domain.hospital.entity.enums.DepartmentType;
import woorifisa.project.backend.domain.hospital.repository.HospitalRepository;

@Service
@RequiredArgsConstructor
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    public HospitalListResponse findHospitals(DepartmentType type) {
        List<Hospital> hospitals = type == null
            ? hospitalRepository.findAll()
            : hospitalRepository.findAllByType(type);

        return HospitalListResponse.from(hospitals);
    }
}
