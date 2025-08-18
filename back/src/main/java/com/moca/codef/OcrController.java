package com.moca.codef;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/codef/ocr")
public class OcrController {

    private final CodefService codefService;

    public OcrController(CodefService codefService) {
        this.codefService = codefService;
    }

    @PostMapping("/driver-license")
    public ResponseEntity<?> ocrDriverLicense(@RequestParam("image") MultipartFile imageFile) {
        if (imageFile.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "이미지 파일이 없습니다."));
        }
        try {
            Map<String, Object> result = codefService.ocrDriverLicense(imageFile);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().