package com.clinica.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@org.springframework.scheduling.annotation.EnableScheduling
@SpringBootApplication
public class ClinicaBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClinicaBackendApplication.class, args);
    }
}
