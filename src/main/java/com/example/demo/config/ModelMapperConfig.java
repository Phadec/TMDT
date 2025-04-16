package com.example.demo.config;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.text.SimpleDateFormat;
import java.util.Date;

@Configuration
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);
        
        // Add conversions for Date objects
        modelMapper.createTypeMap(Date.class, String.class)
            .setConverter(context -> {
                Date source = context.getSource();
                return source != null 
                    ? new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").format(source) 
                    : null;
            });
        
        return modelMapper;
    }
}
