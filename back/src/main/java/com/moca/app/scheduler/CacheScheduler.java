package com.moca.app.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CacheScheduler {

    private final CacheManager cacheManager;

    /**
     * 매 5분마다 대시보드 통계 캐시 무효화
     */
    @Scheduled(fixedRate = 300000) // 5분 = 300,000ms
    public void evictDashboardStatsCache() {
        if (cacheManager.getCache("dashboardStats") != null) {
            cacheManager.getCache("dashboardStats").clear();
            log.debug("Dashboard stats cache cleared");
        }
    }

    /**
     * 매 10분마다 월별/매출 통계 캐시 무효화
     */
    @Scheduled(fixedRate = 600000) // 10분 = 600,000ms
    public void evictMonthlyStatsCache() {
        if (cacheManager.getCache("monthlyStats") != null) {
            cacheManager.getCache("monthlyStats").clear();
            log.debug("Monthly stats cache cleared");
        }

        if (cacheManager.getCache("revenueStats") != null) {
            cacheManager.getCache("revenueStats").clear();
            log.debug("Revenue stats cache cleared");
        }
    }

    /**
     * 매 15분마다 차량타입/지역별 통계 캐시 무효화
     */
    @Scheduled(fixedRate = 900000) // 15분 = 900,000ms
    public void evictVehicleAndRegionStatsCache() {
        if (cacheManager.getCache("vehicleTypeStats") != null) {
            cacheManager.getCache("vehicleTypeStats").clear();
            log.debug("Vehicle type stats cache cleared");
        }

        if (cacheManager.getCache("regionStats") != null) {
            cacheManager.getCache("regionStats").clear();
            log.debug("Region stats cache cleared");
        }
    }

    /**
     * 매 2분마다 일별 통계 캐시 무효화
     */
    @Scheduled(fixedRate = 120000) // 2분 = 120,000ms
    public void evictDailyStatsCache() {
        if (cacheManager.getCache("dailyStats") != null) {
            cacheManager.getCache("dailyStats").clear();
            log.debug("Daily stats cache cleared");
        }
    }

    /**
     * 매일 자정에 모든 캐시 초기화
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void clearAllCaches() {
        cacheManager.getCacheNames().forEach(cacheName -> {
            if (cacheManager.getCache(cacheName) != null) {
                cacheManager.getCache(cacheName).clear();
            }
        });
        log.info("All caches cleared at midnight");
    }
}