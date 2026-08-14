package com.capstone.team40.configuration;

import io.swagger.v3.oas.models.OpenAPI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;

@Configuration
public class OpenAPIConfiguration
{
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Stay Ease Application")
                        .version("1.0.0")
                        .description("Stay Ease Application REST endpoints.")
                        .contact(new Contact()
                                .name("Capstone Team 40")
                                .email("prashant.khandelwal@apexon.com")));
    }
}
