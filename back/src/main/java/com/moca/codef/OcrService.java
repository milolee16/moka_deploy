package com.moca.codef;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Service
public class CodefService {

    @Value("${codef.client-id}")
    private String clientId;

    @Value("${codef.client-secret}")
    private String clientSecret;

    @Value("${codef.public-key}")
    private String publicKey;

    @Value("${codef.mode:demo}")
    private String mode;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 1. Access Token 발급
     */
    public String getAccessToken() throws Exception {
        String url = "https://development.codef.io/oauth/token";
        if ("production".equalsIgnoreCase(mode)) {
            url = "https://api.codef.io/oauth/token";
        }

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String body = String.format(
                "{\"grant_type\":\"client_credentials\",\"client_id\":\"%s\",\"client_secret\":\"%s\"}",
                clientId, clientSecret
        );

        HttpEntity<String> request = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

        JsonNode jsonNode = objectMapper.readTree(response.getBody());
        return jsonNode.get("access_token").asText();
    }

    /**
     * 2. 운전면허증 OCR 호출
     */
    public Map<String, Object> ocrDriverLicense(MultipartFile imageFile) throws Exception {
        String token = getAccessToken();

        String url = "https://development.codef.io/v1/kr/public/a/ocr-drivers-license";
        if ("production".equalsIgnoreCase(mode)) {
            url = "https://api.codef.io/v1/kr/public/a/ocr-drivers-license";
        }

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.setBearerAuth(token);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("organization", "0000");
        body.add("type", "3"); // 1: 앞면, 2: 뒷면, 3: 앞/뒷면 자동인식

        // MultipartFile을 RestTemplate으로 보내기 위한 처리
        InputStreamResource imageResource = new InputStreamResource(imageFile.getInputStream()) {
            @Override
            public String getFilename() {
                return imageFile.getOriginalFilename();
            }
            @Override
            public long contentLength() {
                return imageFile.getSize();
            }
        };
        body.add("image", imageResource);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

        return objectMapper.readValue(response.getBody(), new TypeReference<>() {});
    }
}
