package com.easyvan.van_booking_service.dto;

import lombok.Data;
import java.util.Map;

@Data
public class Slip2GoResponseDTO {
    private boolean success;
    private String message;
    private Data data;

    @lombok.Data
    public static class Data {
        private String transRef;
        private String transDate;
        private String transTime;
        private Double amount;
        private Map<String, Object> sender;
        private Map<String, Object> receiver;
    }
}
