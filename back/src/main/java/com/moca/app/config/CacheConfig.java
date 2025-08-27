package com.moca.app.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager();

        // 렌탈 통계용 캐시들 설정
        cacheManager.setCacheNames(java.util.Arrays.asList(
                "dashboardStats",    // 대시보드 기본 통계 (5분)
                "monthlyStats",      // 월별 통계 (10분)
                "vehicleTypeStats",  // 차량 타입별 통계 (15분)
                "regionStats",       // 지역별 통계 (15분)
                "dailyStats",        // 일별 통계 (2분)
                "revenueStats"       // 매출 통계 (10분)
        ));

        return cacheManager;
    }
}

// 또는 Redis를 사용하고 싶다면 (선택사항):
/*
@Configuration
@EnableCaching
@ConditionalOnProperty(name = "app.cache.type", havingValue = "redis")
public class RedisCacheConfig {

    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory(new RedisStandaloneConfiguration("localhost", 6379));
    }

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(5)) // 기본 5분 캐시
            .disableCachingNullValues();

        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        cacheConfigurations.put("dashboardStats", config.entryTtl(Duration.ofMinutes(5)));
        cacheConfigurations.put("monthlyStats", config.entryTtl(Duration.ofMinutes(10)));
        cacheConfigurations.put("vehicleTypeStats", config.entryTtl(Duration.ofMinutes(15)));
        cacheConfigurations.put("regionStats", config.entryTtl(Duration.ofMinutes(15)));
        cacheConfigurations.put("dailyStats", config.entryTtl(Duration.ofMinutes(2)));
        cacheConfigurations.put("revenueStats", config.entryTtl(Duration.ofMinutes(10)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(config)
                .withInitialCacheConfigurations(cacheConfigurations)
                .build();
    }
}
*/