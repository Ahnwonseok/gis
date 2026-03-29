package project.gis.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import project.gis.dto.LocationShareDto;

@Service
public class LocationShareService {

    private static final String ROOM_KEY_PREFIX = "share:room:";
    private static final String PARTICIPANT_FIELD_PREFIX = "p:";
    private static final Duration TTL = Duration.ofMinutes(30);
    private static final int MAX_PARTICIPANTS = 12;

    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    public LocationShareService(StringRedisTemplate stringRedisTemplate, ObjectMapper objectMapper) {
        this.stringRedisTemplate = stringRedisTemplate;
        this.objectMapper = objectMapper;
    }

    public void saveParticipantPosition(
            String roomId, String participantId, double latitude, double longitude, Double accuracy) {
        String key = roomKey(roomId);
        String field = participantField(participantId);
        Long size = stringRedisTemplate.opsForHash().size(key);
        Boolean exists = stringRedisTemplate.opsForHash().hasKey(key, field);
        if (size != null
                && size >= MAX_PARTICIPANTS
                && (exists == null || !exists)) {
            throw new IllegalStateException("ROOM_FULL");
        }
        LocationShareDto dto = new LocationShareDto(
                latitude, longitude, accuracy, System.currentTimeMillis());
        try {
            String json = objectMapper.writeValueAsString(dto);
            stringRedisTemplate.opsForHash().put(key, field, json);
            stringRedisTemplate.expire(key, TTL);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("위치 공유 데이터 직렬화 실패", e);
        }
    }

    /** 전송이 오래 없으면 오프라인으로 보고 제거 (탭 닫기 등) */
    private static final long STALE_MS = 90_000;

    public void removeParticipant(String roomId, String participantId) {
        String key = roomKey(roomId);
        stringRedisTemplate.opsForHash().delete(key, participantField(participantId));
        Long size = stringRedisTemplate.opsForHash().size(key);
        if (size != null && size == 0) {
            stringRedisTemplate.delete(key);
        }
    }

    public Map<String, LocationShareDto> getParticipants(String roomId) {
        String key = roomKey(roomId);
        Map<Object, Object> raw = stringRedisTemplate.opsForHash().entries(key);
        Map<String, LocationShareDto> out = new LinkedHashMap<>();
        long now = System.currentTimeMillis();
        for (Map.Entry<Object, Object> e : raw.entrySet()) {
            String k = e.getKey().toString();
            if (!k.startsWith(PARTICIPANT_FIELD_PREFIX)) {
                continue;
            }
            String pid = k.substring(PARTICIPANT_FIELD_PREFIX.length());
            try {
                LocationShareDto dto = objectMapper.readValue(e.getValue().toString(), LocationShareDto.class);
                if (dto.getUpdatedAt() == null || now - dto.getUpdatedAt() > STALE_MS) {
                    stringRedisTemplate.opsForHash().delete(key, k);
                    continue;
                }
                out.put(pid, dto);
            } catch (JsonProcessingException ex) {
                stringRedisTemplate.opsForHash().delete(key, k);
            }
        }
        Long sz = stringRedisTemplate.opsForHash().size(key);
        if (sz != null && sz == 0) {
            stringRedisTemplate.delete(key);
        }
        return out;
    }

    private static String roomKey(String roomId) {
        return ROOM_KEY_PREFIX + roomId;
    }

    private static String participantField(String participantId) {
        return PARTICIPANT_FIELD_PREFIX + participantId;
    }
}
