package com.moca.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling // 추가
@EnableAsync      // 추가
@SpringBootApplication
@EnableJpaAuditing // 생성/수정 시간 등을 자동으로 기록할 때 사용하는 기능입니다. 지금 당장 필요 없으면 지워도 됩니다.
public class AppApplication {

	public static void main(String[] args) {
		SpringApplication.run(AppApplication.class, args);
	}
}