package project.gis.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.gis.dto.LandResultDto;
import project.gis.repository.LandRepository;

import java.util.List;

@Service
public class LandService {

    @Autowired
    private LandRepository landRepository;

    /**
     * @param x X 좌표
     * @param y Y 좌표
     * @return 토지 정보 리스트
     */
    public List<LandResultDto> findLandByPoint(double x, double y) {
        return landRepository.findLandByPoint(x, y);
    }

}
