package project.gis.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.gis.entity.LandEntity;

@Repository
public interface LandRepository extends JpaRepository<LandEntity, Long>, LandRepositoryCustom {

}