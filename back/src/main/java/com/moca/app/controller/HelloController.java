package com.moca.app.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/hello")
public class HelloController {

    @GetMapping
    public Map<String, Object> hello() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "안녕하세요! Spring Boot와 React가 연결되었습니다! 🎉");
        response.put("timestamp", LocalDateTime.now());
        response.put("status", "success");
        return response;
    }

    @GetMapping("/test")
    public String simpleTest() {
        return "Spring Boot API 테스트 성공!";
    }
}