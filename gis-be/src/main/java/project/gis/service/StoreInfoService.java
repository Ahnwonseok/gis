package project.gis.service;

import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.gis.dto.StoreInfoDto;
import project.gis.entity.StoreInfo;
import project.gis.repository.StoreInfoRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StoreInfoService {

    private final StoreInfoRepository storeInfoRepository;
    private final GeometryFactory geometryFactory = new GeometryFactory();

    @Transactional
    public StoreInfoDto save(StoreInfoDto dto) {
        Point point = geometryFactory.createPoint(new Coordinate(dto.getLon(), dto.getLat()));

        StoreInfo entity = StoreInfo.builder()
                .storeName(dto.getStoreName())
                .category(dto.getCategory())
                .address(dto.getAddress())
                .phone(dto.getPhone())
                .sales(dto.getSales())
                .geom(point)
                .build();

        return StoreInfoDto.fromEntity(storeInfoRepository.save(entity));
    }

    public List<StoreInfoDto> findAll() {
        return storeInfoRepository.findAll()
                .stream().map(StoreInfoDto::fromEntity).toList();
    }

    public StoreInfoDto findById(Long id) {
        return storeInfoRepository.findById(id)
                .map(StoreInfoDto::fromEntity)
                .orElseThrow(() -> new RuntimeException("Store not found"));
    }

    public List<StoreInfoDto> findByCategory(String category) {
        return storeInfoRepository.findByCategory(category)
                .stream().map(StoreInfoDto::fromEntity).toList();
    }

    public List<StoreInfoDto> findWithinRadius(double lon, double lat, double radius) {
        return storeInfoRepository.findWithinRadius(lon, lat, radius)
                .stream().map(StoreInfoDto::fromEntity).toList();
    }

    @Transactional
    public void delete(Long id) {
        storeInfoRepository.deleteById(id);
    }
}
