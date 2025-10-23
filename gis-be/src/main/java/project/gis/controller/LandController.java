package project.gis.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import project.gis.dto.LandResultDto;
import project.gis.service.LandService;

import java.util.List;

@RestController
@RequestMapping("/api/land")
public class LandController {

    @Autowired
    private LandService landService;

    /**
     * @param x X 좌표
     * @param y Y 좌표
     * @return 토지 정보 리스트
     */
    @GetMapping("/search")
    public ResponseEntity<?> findLandByPoint(@RequestParam double x, @RequestParam double y) {
        List<LandResultDto> lands = landService.findLandByPoint(x, y);
        return ResponseEntity.ok(lands);
    }

}
