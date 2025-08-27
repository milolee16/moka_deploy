package com.moca.app.notices;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeDto {
    private Long id;
    private String category; // Add category field
    private String title;
    private String content;
    private String writer;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static NoticeDto from(Notice notice) {
        return NoticeDto.builder()
                .id(notice.getId())
                .category(notice.getCategory()) // Include category
                .title(notice.getTitle())
                .content(notice.getContent())
                .writer(notice.getWriter())
                .createdAt(notice.getCreatedAt())
                .updatedAt(notice.getUpdatedAt())
                .build();
    }
}