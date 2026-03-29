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

    public Map<String, LocationShareDto> getParticipants(String roomId) {
        Map<Object, Object> raw = stringRedisTemplate.opsForHash().entries(roomKey(roomId));
        Map<String, LocationShareDto> out = new LinkedHashMap<>();
        for (Map.Entry<Object, Object> e : raw.entrySet()) {
            String k = e.getKey().toString();
            if (!k.startsWith(PARTICIPANT_FIELD_PREFIX)) {
                continue;
            }
            String pid = k.substring(PARTICIPANT_FIELD_PREFIX.length());
            try {
                out.put(pid, objectMapper.readValue(e.getValue().toString(), LocationShareDto.class));
            } catch (JsonProcessingException ex) {
                stringRedisTemplate.opsForHash().delete(roomKey(roomId), k);
            }
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
