package project.gis.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import project.gis.dto.StoreInfoDto;
import project.gis.service.StoreInfoService;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreInfoController {

    private final StoreInfoService storeInfoService;

    @PostMapping
    public StoreInfoDto create(@RequestBody StoreInfoDto dto) {
        return storeInfoService.save(dto);
    }

    @GetMapping
    public List<StoreInfoDto> findAll() {
        return storeInfoService.findAll();
    }

    @GetMapping("/{id}")
    public StoreInfoDto findById(@PathVariable Long id) {
        return storeInfoService.findById(id);
    }

    @GetMapping("/search")
    public List<StoreInfoDto> findByCategory(@RequestParam String category) {
        return storeInfoService.findByCategory(category);
    }

    @GetMapping("/near")
    public List<StoreInfoDto> findWithinRadius(
            @RequestParam double lon,
            @RequestParam double lat,
            @RequestParam(defaultValue = "1000") double radius
    ) {
        return storeInfoService.findWithinRadius(lon, lat, radius);
    }

    @PutMapping("/{id}")
    public StoreInfoDto update(@PathVariable Long id, @RequestBody StoreInfoDto dto) {
        StoreInfoDto existing = storeInfoService.findById(id);
        dto.setStoreId(existing.getStoreId());
        return storeInfoService.save(dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        storeInfoService.delete(id);
    }
}