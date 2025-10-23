package project.gis.dto;

import lombok.*;
import org.locationtech.jts.geom.Point;
import project.gis.entity.StoreInfo;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreInfoDto {
    private Long storeId;
    private String storeName;
    private String category;
    private String address;
    private String phone;
    private Double sales;
    private double lon;
    private double lat;

    public static StoreInfoDto fromEntity(StoreInfo entity) {
        Point geom = entity.getGeom();
        return StoreInfoDto.builder()
                .storeId(entity.getStoreId())
                .storeName(entity.getStoreName())
                .category(entity.getCategory())
                .address(entity.getAddress())
                .phone(entity.getPhone())
                .sales(entity.getSales())
                .lon(geom.getX())
                .lat(geom.getY())
                .build();
    }
}