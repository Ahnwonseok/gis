package project.gis.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import project.gis.entity.StoreInfo;

import java.util.List;

public interface StoreInfoRepository extends JpaRepository<StoreInfo, Long> {

    // 업종별 조회
    List<StoreInfo> findByCategory(String category);

    // 반경 1km 이내 매장 검색
    @Query(value = """
        SELECT s.* 
        FROM store_info s
        WHERE ST_DWithin(
            s.geom::geography,
            ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
            :radius
        )
    """, nativeQuery = true)
    List<StoreInfo> findWithinRadius(
            @Param("lon") double lon,
            @Param("lat") double lat,
            @Param("radius") double radius  // 단위: 미터
    );
}
