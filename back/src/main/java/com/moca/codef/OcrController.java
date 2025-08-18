package com.moca.codef;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/ocr/driver-license")
public class OcrController {
    private final OcrService ocrService;

    @PostMapping("/recognize")
    public ResponseEntity<?> recognize(@RequestParam("file") MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            Map<String, Object> result = ocrService.recognizeDriverLicense(bytes);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
