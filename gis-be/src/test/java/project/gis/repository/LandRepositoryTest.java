package project.gis.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import project.gis.dto.LandResultDto;

import java.util.List;

@SpringBootTest
@ActiveProfiles("test")
public class LandRepositoryTest {

    @Autowired
    private LandRepository landRepository;

    @Test
    public void testFindLandByPoint() {
        // 테스트용 좌표 (실제 POLYGON 내부 좌표로 수정)
        double x = 953750;  // POLYGON 중앙 X 좌표
        double y = 1952850; // POLYGON 중앙 Y 좌표

        // QueryDSL 방식 테스트
        List<LandResultDto> results = landRepository.findLandByPoint(x, y);

        System.out.println("QueryDSL 결과 개수: " + results.size());
        results.forEach(result -> {
            System.out.println("ID: " + result.getId() +
                             ", LotNo: " + result.getLotNo() +
                             ", Owner: " + result.getOwner() +
                             ", Geom: " + result.getGeom());
        });
    }
}
