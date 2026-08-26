package com.rolliq.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RollIqApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(RollIqApiApplication.class, args);
    }
}
