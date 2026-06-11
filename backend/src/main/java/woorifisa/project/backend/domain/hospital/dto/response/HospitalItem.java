package woorifisa.project.backend.domain.hospital.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import woorifisa.project.backend.domain.hospital.entity.Hospital;
import woorifisa.project.backend.domain.hospital.entity.enums.DepartmentType;

public record HospitalItem(
    @JsonProperty("hospital_id")
    Long hospitalId,
    String name,
    DepartmentType type,
    @JsonProperty("doctor_name")
    String doctorName,
    String address,
    @JsonProperty("open_time")
    String openTime,
    @JsonProperty("close_time")
    String closeTime,
    @JsonProperty("break_time")
    String breakTime,
    @JsonProperty("day_off")
    String dayOff
) {
    public static HospitalItem from(Hospital hospital) {
        return new HospitalItem(
            hospital.getHospitalId(),
            hospital.getName(),
            hospital.getType(),
            hospital.getDoctorName(),
            hospital.getAddress(),
            hospital.getOpenTime(),
            hospital.getCloseTime(),
            hospital.getBreakTime(),
            hospital.getDayOff()
        );
    }
}
