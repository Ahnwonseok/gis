package project.gis.repository;

import project.gis.dto.LandResultDto;

import java.util.List;

public interface LandRepositoryCustom {
    
    /**
     * QueryDSL을 사용하여 특정 좌표가 포함된 토지를 조회
     * @param x X 좌표
     * @param y Y 좌표
     * @return 토지 정보 리스트
     */
    List<LandResultDto> findLandByPoint(double x, double y);
}
