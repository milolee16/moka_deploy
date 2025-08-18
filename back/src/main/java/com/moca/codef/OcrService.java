package com.moca.codef;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class OcrService {
    @Value("${codef.client-id}") private String clientId;
    @Value("${codef.client-secret}") private String clientSecret;
    @Value("${codef.public-key}") private String publicKey;
    @Value("${codef.mode:demo}") private String mode;

    private final ObjectMapper om = new ObjectMapper();
    private final RestTemplate rest = new RestTemplate();

    private String baseUrl() {
        return "production".equalsIgnoreCase(mode)
                ? "https://api.codef.io"
                : "https://development.codef.io";
    }

    public String getAccessToken() throws Exception {
        String url = baseUrl() + "/oauth/token";
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        String body = String.format(
                "{\"grant_type\":\"client_credentials\",\"client_id\":\"%s\",\"client_secret\":\"%s\"}",
                clientId, clientSecret
        );
        String resp = rest.postForObject(url, new HttpEntity<>(body, h), String.class);
        return om.readTree(resp).get("access_token").asText();
    }

    public Map<String, Object> recognizeDriverLicense(byte[] imageBytes) throws Exception {
        String token = getAccessToken();
        String url = baseUrl() + "/v1/kr/public/a/ocr/driver-license"; // 가이드 기준
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.MULTIPART_FORM_DATA);
        h.setBearerAuth(token);

        LinkedMultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
        ByteArrayResource res = new ByteArrayResource(imageBytes) {
            @Override public String getFilename() { return "license.jpg"; }
        };
        form.add("file", res);

        String response = rest.postForObject(url, new HttpEntity<>(form, h), String.class);
        return om.readValue(response, new TypeReference<>() {});
    }
}

