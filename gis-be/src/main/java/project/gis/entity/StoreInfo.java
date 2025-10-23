package project.gis.entity;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "store_info")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "store_id")
    private Long storeId;

    @Column(name = "store_name", nullable = false, length = 100)
    private String storeName;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "address", length = 200)
    private String address;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "sales")
    private Double sales;

    // Point 타입 (longitude, latitude)
    @Column(name = "geom", columnDefinition = "geometry(Point,4326)", nullable = false)
    private Point geom;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}