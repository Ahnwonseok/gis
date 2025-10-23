package project.gis.repository;

import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.stereotype.Repository;
import project.gis.dto.LandResultDto;
import project.gis.entity.QLandEntity;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;

@Repository
public class LandRepositoryImpl implements LandRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    private JPAQueryFactory queryFactory() {
        return new JPAQueryFactory(entityManager);
    }

    @Override
    public List<LandResultDto> findLandByPoint(double x, double y) {
        QLandEntity land = QLandEntity.landEntity;
        
        return queryFactory()
                .select(Projections.constructor(LandResultDto.class,
                        land.id,
                        land.lotNo,
                        land.owner,
                        Expressions.stringTemplate("ST_AsGeoJSON({0})", land.geom)
                ))
                .from(land)
                .where(Expressions.booleanTemplate("ST_Contains({0}, {1})",
                        land.geom,
                        Expressions.stringTemplate("ST_SetSRID(ST_Point({0}, {1}), 5181)", x, y)
                ))
                .fetch();
    }
}
