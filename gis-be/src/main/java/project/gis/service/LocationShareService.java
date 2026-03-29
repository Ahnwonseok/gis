package project.gis.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.util.Optional;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import project.gis.dto.LocationShareDto;

@Service
public class LocationShareService {

    private static final String KEY_PREFIX = "share:loc:";
    private static final Duration TTL = Duration.ofMinutes(30);

    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    public LocationShareService(StringRedisTemplate stringRedisTemplate, ObjectMapper objectMapper) {
        this.stringRedisTemplate = stringRedisTemplate;
        this.objectMapper = objectMapper;
    }

    public void savePosition(String sessionId, double latitude, double longitude, Double accuracy) {
        LocationShareDto dto = new LocationShareDto(
                latitude, longitude, accuracy, System.currentTimeMillis());
        try {
            String json = objectMapper.writeValueAsString(dto);
            stringRedisTemplate.opsForValue().set(redisKey(sessionId), json, TTL);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("위치 공유 데이터 직렬화 실패", e);
        }
    }

    public Optional<LocationShareDto> getPosition(String sessionId) {
        String json = stringRedisTemplate.opsForValue().get(redisKey(sessionId));
        if (json == null || json.isEmpty()) {
            return Optional.empty();
        }
        try {
            return Optional.of(objectMapper.readValue(json, LocationShareDto.class));
        } catch (JsonProcessingException e) {
            stringRedisTemplate.delete(redisKey(sessionId));
            return Optional.empty();
        }
    }

    private static String redisKey(String sessionId) {
        return KEY_PREFIX + sessionId;
    }
}
