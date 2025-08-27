package com.moca.app.notices;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {

    private final NoticeRepository noticeRepository;

    public List<NoticeDto> findAllNotices() {
        return noticeRepository.findAll().stream()
                .map(NoticeDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 공지사항 생성
     */
    @Transactional // 데이터를 변경하므로 readOnly = false (기본값)
    public NoticeDto createNotice(NoticeRequestDto requestDto) {
        Notice notice = requestDto.toEntity();
        Notice savedNotice = noticeRepository.save(notice);
        return NoticeDto.from(savedNotice);
    }

    /**
     * 공지사항 수정
     */
    @Transactional
    public NoticeDto updateNotice(Long id, NoticeRequestDto requestDto) {
        // ID로 기존 공지사항을 찾음. 없으면 예외 발생
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 공지사항이 없습니다. id=" + id));

        // 찾은 공지사항의 내용을 업데이트
        notice.update(requestDto.getCategory(), requestDto.getTitle(), requestDto.getContent());

        return NoticeDto.from(notice);
    }

    /**
     * 공지사항 삭제
     */
    @Transactional
    public void deleteNotice(Long id) {
        // ID로 공지사항 존재 여부 확인. 없으면 예외 발생
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 공지사항이 없습니다. id=" + id));

        noticeRepository.delete(notice);
    }
}
