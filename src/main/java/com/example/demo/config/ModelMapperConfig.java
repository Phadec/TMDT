package com.example.demo.config;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {
    
    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration()
                // Giúp map không cần quan tâm thứ tự, nhưng tên phải giống như nhau
                .setMatchingStrategy(MatchingStrategies.STRICT);
        return new ModelMapper();
    }
}
