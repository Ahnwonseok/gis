package project.gis.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;


/**
 * QLandEntity is a Querydsl query type for LandEntity
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QLandEntity extends EntityPathBase<LandEntity> {

    private static final long serialVersionUID = 737454791L;

    public static final QLandEntity landEntity = new QLandEntity("landEntity");

    public final ComparablePath<org.locationtech.jts.geom.Geometry> geom = createComparable("geom", org.locationtech.jts.geom.Geometry.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath lotNo = createString("lotNo");

    public final StringPath owner = createString("owner");

    public QLandEntity(String variable) {
        super(LandEntity.class, forVariable(variable));
    }

    public QLandEntity(Path<? extends LandEntity> path) {
        super(path.getType(), path.getMetadata());
    }

    public QLandEntity(PathMetadata metadata) {
        super(LandEntity.class, metadata);
    }

}

