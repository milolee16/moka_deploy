package com.moca;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
//import org.springframework.data.jpa.repository.config.EnableJpaAuditing; // DB 사용 안 할 시 임시 주석 처리

@SpringBootApplication(
		scanBasePackages = "com.moca", // 컴포넌트 스캔 범위를 명시적으로 지정
		exclude = {
		DataSourceAutoConfiguration.class,
		JpaRepositoriesAutoConfiguration.class,
		HibernateJpaAutoConfiguration.class
})
//@EnableJpaAuditing // DB 사용 안 할 시 임시 주석 처리
public class AppApplication {

	public static void main(String[] args) {
		SpringApplication.run(AppApplication.class, args);
	}
}