# QueryDSL을 사용한 PostGIS 공간 쿼리 변환 (Custom Repository 패턴)

## 개요
기존의 네이티브 SQL 쿼리를 QueryDSL로 변환하여 타입 안전성과 동적 쿼리 작성의 장점을 활용할 수 있습니다. Custom Repository 패턴을 사용하여 깔끔한 구조로 구현했습니다.

## 프로젝트 구조
```
src/main/java/project/gis/
├── dto/
│   └── LandResultDto.java          # 결과를 담을 DTO 클래스
├── entity/
│   └── LandEntity.java             # 기본 엔티티 (테이블 필드만)
├── repository/
│   ├── LandRepository.java         # JPA Repository + Custom 인터페이스
│   ├── LandRepositoryCustom.java   # Custom 메서드 인터페이스
│   └── LandRepositoryImpl.java     # QueryDSL 구현체
├── service/
│   └── LandService.java            # 비즈니스 로직
└── controller/
    └── LandController.java         # REST API
```

## 기존 네이티브 쿼리
```sql
SELECT id, lot_no, owner, ST_AsGeoJSON(geom) AS geom
FROM tstm_lotlnd
WHERE ST_Contains(
    geom,
    ST_SetSRID(ST_Point(:x, :y), 5181)
)
```

## Custom Repository 패턴 구현

### 1. LandRepositoryCustom 인터페이스
```java
public interface LandRepositoryCustom {
    List<LandResultDto> findLandByPoint(double x, double y);
}
```

### 2. LandRepositoryImpl 구현체
```java
@Repository
public class LandRepositoryImpl implements LandRepositoryCustom {
    
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<LandResultDto> findLandByPoint(double x, double y) {
        QLandEntity land = QLandEntity.landEntity;
        
        return queryFactory()
                .select(Projections.constructor(LandResultDto.class,
                        land.id,
                        land.lotNo,
                        land.owner,
                        Expressions.stringTemplate("ST_AsGeoJSON({0})", 
                                Expressions.stringTemplate("geom"))
                ))
                .from(land)
                .where(Expressions.booleanTemplate("ST_Contains({0}, {1})",
                        Expressions.stringTemplate("geom"),
                        Expressions.stringTemplate("ST_SetSRID(ST_Point({0}, {1}), 5181)", x, y)
                ))
                .fetch();
    }
}
```

### 3. LandRepository 인터페이스
```java
@Repository
public interface LandRepository extends JpaRepository<LandEntity, Long>, LandRepositoryCustom {
    
    // 기존 네이티브 쿼리 (참고용으로 유지)
    @Query(value = "...", nativeQuery = true)
    List<Map<String, Object>> findLandByPointNative(@Param("x") double x, @Param("y") double y);
}
```

### 4. LandResultDto 클래스
```java
public class LandResultDto {
    private Long id;
    private String lotNo;
    private String owner;
    private String geom;
    
    // 생성자, getter, setter
}
```

## 주요 특징

### 장점
- **깔끔한 구조**: Custom Repository 패턴으로 관심사 분리
- **타입 안전성**: 컴파일 타임에 오류 검출
- **동적 쿼리**: 조건에 따라 쿼리 동적 생성 가능
- **재사용성**: 공통 쿼리 로직을 메서드로 분리 가능
- **유지보수성**: Java 코드로 쿼리 작성으로 가독성 향상

### LandEntity 설계 원칙
- **테이블 필드만 매핑**: 실제 테이블의 컬럼만 엔티티에 포함
- **추가 속성 없음**: 계산된 값이나 조인된 값은 DTO로 분리
- **Geometry 컬럼 제외**: PostGIS geometry는 템플릿으로만 접근

## PostGIS 함수 사용법
```java
// ST_AsGeoJSON 함수 사용
Expressions.stringTemplate("ST_AsGeoJSON({0})", 
    Expressions.stringTemplate("geom"))

// ST_Contains 함수 사용
Expressions.booleanTemplate("ST_Contains({0}, {1})",
    Expressions.stringTemplate("geom"),
    Expressions.stringTemplate("ST_SetSRID(ST_Point({0}, {1}), 5181)", x, y)
)
```

## API 사용법
```bash
# QueryDSL 방식 (권장)
GET /api/land/point?x=123.456&y=37.789

# 네이티브 쿼리 방식 (비교용)
GET /api/land/point/native?x=123.456&y=37.789
```

## 사용 예시
```java
@Service
public class LandService {
    
    @Autowired
    private LandRepository landRepository;
    
    public List<LandResultDto> findLandByPoint(double x, double y) {
        return landRepository.findLandByPoint(x, y);  // QueryDSL 방식
    }
    
    public List<Map<String, Object>> findLandByPointNative(double x, double y) {
        return landRepository.findLandByPointNative(x, y);  // 네이티브 쿼리 방식
    }
}
```

## 주의사항
- PostGIS 함수는 `Expressions.stringTemplate()` 또는 `Expressions.booleanTemplate()` 사용
- geometry 컬럼은 엔티티에 직접 매핑하지 않고 템플릿으로 접근
- 좌표계(SRID) 설정이 중요 (현재 5181 사용)
- Custom Repository 구현체는 `Repository명 + Impl` 패턴을 따라야 함
