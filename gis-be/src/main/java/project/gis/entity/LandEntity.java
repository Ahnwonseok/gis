package project.gis.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.locationtech.jts.geom.Geometry;

@Entity
@Table(name = "tstm_lotlnd")
public class LandEntity {
    @Id
    private Long id;

    private String lotNo;
    private String owner;
    private Geometry geom;
}