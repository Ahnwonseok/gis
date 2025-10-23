package project.gis.repository;

import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import project.gis.entity.StoreInfo;

@SpringBootTest
class StoreInfoRepositoryTest {

    @Autowired
    private StoreInfoRepository repo;

    @Test
    void saveStore() {
        GeometryFactory factory = new GeometryFactory();
        Point point = factory.createPoint(new Coordinate(127.0276, 37.4979)); // 강남역

        StoreInfo store = StoreInfo.builder()
                .storeName("스타벅스 강남역점")
                .category("카페")
                .address("서울 강남구 테헤란로 101")
                .geom(point)
                .build();

        repo.save(store);
    }

}