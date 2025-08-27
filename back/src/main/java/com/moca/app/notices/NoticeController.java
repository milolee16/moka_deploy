package com.moca.app.notices;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notices") // application.properties의 context-path와 조합되어 최종 경로는 /api/notices가 됩니다.
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    // 공지사항 전체 조회 API
    @GetMapping
    public ResponseEntity<List<NoticeDto>> getAllNotices() {
        List<NoticeDto> notices = noticeService.findAllNotices();
        return ResponseEntity.ok(notices);
    }

    // 1. 공지사항 생성 API (POST) - ADMIN만 가능
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NoticeDto> createNotice(@RequestBody NoticeRequestDto requestDto) {
        NoticeDto createdNotice = noticeService.createNotice(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNotice);
    }

    // 2. 공지사항 수정 API (PUT) - ADMIN만 가능
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NoticeDto> updateNotice(@PathVariable Long id, @RequestBody NoticeRequestDto requestDto) {
        NoticeDto updatedNotice = noticeService.updateNotice(id, requestDto);
        return ResponseEntity.ok(updatedNotice);
    }

    // 3. 공지사항 삭제 API (DELETE) - ADMIN만 가능
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteNotice(@PathVariable Long id) {
        noticeService.deleteNotice(id);
        return ResponseEntity.noContent().build(); // 성공 시 204 No Content 응답
    }
}