// NoticeRequestDto.java

package com.moca.app.notices;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class NoticeRequestDto {
    private String category;
    private String title;
    private String content;
    private String writer;

    // DTO를 Entity로 변환하여 DB에 저장할 수 있도록 함
    public Notice toEntity() {
        // 👈 2. 이 부분을 빌더 패턴으로 수정합니다.
        return Notice.builder()
                .category(this.category)
                .title(this.title)
                .content(this.content)
                .writer(this.writer)
                .build();
    }
}