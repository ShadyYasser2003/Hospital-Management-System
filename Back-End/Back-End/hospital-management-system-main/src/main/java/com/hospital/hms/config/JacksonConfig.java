package com.hospital.hms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import tools.jackson.databind.cfg.DateTimeFeature;
import tools.jackson.databind.json.JsonMapper;

/**
 * Jackson 3.x configuration — ensures LocalDate/LocalTime/LocalDateTime
 * serialize as ISO-8601 strings (not arrays or timestamps) for the frontend.
 *
 * In Jackson 3.x, date/time-related SerializationFeature constants were moved
 * to tools.jackson.databind.cfg.DateTimeFeature.
 */
@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public JsonMapper objectMapper() {
        return JsonMapper.builder()
                .disable(DateTimeFeature.WRITE_DATES_AS_TIMESTAMPS)
                .disable(DateTimeFeature.WRITE_DATE_TIMESTAMPS_AS_NANOSECONDS)
                .build();
    }
}
