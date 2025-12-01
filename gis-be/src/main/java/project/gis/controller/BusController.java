package project.gis.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class BusController {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 좌표 기준 반경 내 버스 정류장 조회
     * @param x 경도 (longitude)
     * @param y 위도 (latitude)
     * @param radius 반경 (미터 단위, 기본값: 50)
     * @return 버스 정류장 정보 (JSON) - stationClass가 1인 것만 필터링
     */
    @GetMapping("/station")
    public ResponseEntity<String> getBusStationByPoint(
            @RequestParam double x,
            @RequestParam double y,
            @RequestParam(defaultValue = "50") int radius
    ) throws IOException {
        // ODsay Api Key 정보
        String apiKey = "B5gRiR7GMNZ0cVrmZT9OLQ";

        String urlInfo = "https://api.odsay.com/v1/api/pointBusStation?lang=0&x=" + x
                + "&y=" + y + "&radius=" + radius + "&apiKey=" + apiKey;
        
        // http 연결
        URL url = new URL(urlInfo);
        HttpURLConnection conn = (HttpURLConnection)url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-type", "application/json");
        conn.setRequestProperty("Accept", "application/json");
        conn.setRequestProperty("Referer", "http://localhost:3000");

        // 응답 코드 확인
        int responseCode = conn.getResponseCode();
        
        BufferedReader bufferedReader;
        if (responseCode == HttpURLConnection.HTTP_OK) {
            bufferedReader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        } else {
            bufferedReader = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
        }

        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = bufferedReader.readLine()) != null) {
            sb.append(line);
        }
        bufferedReader.close();
        conn.disconnect();

        String responseBody = sb.toString();
        System.out.println("Original Response: " + responseBody);

        // JSON 파싱 및 필터링
        if (responseCode == HttpURLConnection.HTTP_OK) {
            try {
                JsonNode rootNode = objectMapper.readTree(responseBody);
                JsonNode resultNode = rootNode.get("result");
                
                if (resultNode != null && resultNode.has("lane")) {
                    ArrayNode laneArray = (ArrayNode) resultNode.get("lane");
                    ArrayNode filteredLaneArray = objectMapper.createArrayNode();
                    
                    // stationClass가 1인 것만 필터링하고 direction 추가
                    for (JsonNode lane : laneArray) {
                        if (lane.has("stationClass") && lane.get("stationClass").asInt() == 1) {
                            ObjectNode laneObject = lane.deepCopy();
                            
                            // 각 정류장에 대해 busStationInfo API 호출하여 direction 찾기
                            if (lane.has("stationID")) {
                                String direction = getBusStationDirection(lane.get("stationID").asInt(), apiKey);
                                if (direction != null) {
                                    laneObject.put("direction", direction);
                                }
                            }
                            
                            filteredLaneArray.add(laneObject);
                        }
                    }
                    
                    // 필터링된 결과로 새로운 JSON 생성
                    ObjectNode filteredResult = objectMapper.createObjectNode();
                    filteredResult.set("count", objectMapper.valueToTree(filteredLaneArray.size()));
                    filteredResult.set("lane", filteredLaneArray);
                    
                    ObjectNode filteredRoot = objectMapper.createObjectNode();
                    filteredRoot.set("result", filteredResult);
                    
                    responseBody = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(filteredRoot);
                    System.out.println("Filtered Response: " + responseBody);
                }
            } catch (Exception e) {
                System.err.println("Error parsing JSON: " + e.getMessage());
                e.printStackTrace();
            }
        }

        return ResponseEntity.status(responseCode).body(responseBody);
    }

    /**
     * 정류장 ID로 busStationInfo API를 호출하여 가장 많이 나타나는 busDirectionName 반환
     * @param stationID 정류장 ID
     * @param apiKey ODsay API Key
     * @return 가장 많이 나타나는 방향명 (busDirectionName)
     */
    private String getBusStationDirection(int stationID, String apiKey) {
        try {
            String urlInfo = "https://api.odsay.com/v1/api/busStationInfo?lang=0&stationID=" + stationID + "&apiKey=" + apiKey;
            
            URL url = new URL(urlInfo);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Content-type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            conn.setRequestProperty("Referer", "http://localhost:3000");
            
            int responseCode = conn.getResponseCode();
            
            if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = bufferedReader.readLine()) != null) {
                    sb.append(line);
                }
                bufferedReader.close();
                conn.disconnect();
                
                // JSON 파싱하여 busDirectionName 수집
                JsonNode rootNode = objectMapper.readTree(sb.toString());
                JsonNode resultNode = rootNode.get("result");
                
                if (resultNode != null && resultNode.has("lane")) {
                    ArrayNode laneArray = (ArrayNode) resultNode.get("lane");
                    Map<String, Integer> directionCount = new HashMap<>();
                    
                    // 각 lane에서 busDirectionName 수집
                    for (JsonNode lane : laneArray) {
                        if (lane.has("busDirectionName")) {
                            String directionName = lane.get("busDirectionName").asText();
                            directionCount.put(directionName, directionCount.getOrDefault(directionName, 0) + 1);
                        }
                    }
                    
                    // 가장 많이 나타나는 busDirectionName 찾기
                    String mostFrequentDirection = null;
                    int maxCount = 0;
                    for (Map.Entry<String, Integer> entry : directionCount.entrySet()) {
                        if (entry.getValue() > maxCount) {
                            maxCount = entry.getValue();
                            mostFrequentDirection = entry.getKey();
                        }
                    }
                    
                    return mostFrequentDirection;
                }
            }
        } catch (Exception e) {
            System.err.println("Error getting bus station direction for stationID " + stationID + ": " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
}

