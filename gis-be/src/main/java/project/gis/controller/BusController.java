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
     * 좌표 기준 반경 내 버스 정류장 조회 (간단한 정보만)
     * @param x 경도 (longitude)
     * @param y 위도 (latitude)
     * @param radius 반경 (미터 단위, 기본값: 50)
     * @return 버스 정류장 정보 (JSON) - stationClass가 1인 것만 필터링, 간단한 정보만 반환
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

        // JSON 파싱 및 필터링 (간단한 정보만)
        if (responseCode == HttpURLConnection.HTTP_OK) {
            try {
                JsonNode rootNode = objectMapper.readTree(responseBody);
                JsonNode resultNode = rootNode.get("result");
                
                if (resultNode != null && resultNode.has("lane")) {
                    ArrayNode laneArray = (ArrayNode) resultNode.get("lane");
                    ArrayNode filteredLaneArray = objectMapper.createArrayNode();
                    
                    // stationClass가 1인 것만 필터링 (간단한 정보만 유지, direction 포함)
                    for (JsonNode lane : laneArray) {
                        if (lane.has("stationClass") && lane.get("stationClass").asInt() == 1) {
                            ObjectNode laneObject = objectMapper.createObjectNode();
                            
                            // 기본 정보만 복사
                            if (lane.has("stationID")) {
                                int stationID = lane.get("stationID").asInt();
                                laneObject.put("stationID", stationID);
                                
                                // direction 정보 추가
                                String direction = getBusStationDirection(stationID, apiKey);
                                if (direction != null) {
                                    laneObject.put("direction", direction);
                                }
                            }
                            if (lane.has("stationName")) {
                                laneObject.put("stationName", lane.get("stationName").asText());
                            }
                            if (lane.has("x")) {
                                laneObject.put("x", lane.get("x").asDouble());
                            }
                            if (lane.has("y")) {
                                laneObject.put("y", lane.get("y").asDouble());
                            }
                            if (lane.has("busOnlyCentralLane")) {
                                laneObject.put("busOnlyCentralLane", lane.get("busOnlyCentralLane").asInt());
                            }
                            
                            // busList는 간단한 정보만 (busID, type, busNo)
                            if (lane.has("busList")) {
                                ArrayNode busListArray = (ArrayNode) lane.get("busList");
                                ArrayNode simpleBusList = objectMapper.createArrayNode();
                                
                                for (JsonNode bus : busListArray) {
                                    ObjectNode simpleBus = objectMapper.createObjectNode();
                                    if (bus.has("busID")) {
                                        simpleBus.put("busID", bus.get("busID").asInt());
                                    }
                                    if (bus.has("type")) {
                                        simpleBus.put("type", bus.get("type").asInt());
                                    }
                                    if (bus.has("busNo")) {
                                        simpleBus.put("busNo", bus.get("busNo").asText());
                                    }
                                    simpleBusList.add(simpleBus);
                                }
                                laneObject.set("busList", simpleBusList);
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
     * 정류장 상세 정보 조회 (버스 노선, 다음 정류장 등)
     * @param stationID 정류장 ID
     * @return 정류장 상세 정보 (JSON)
     */
    @GetMapping("/station/detail")
    public ResponseEntity<String> getBusStationDetail(
            @RequestParam int stationID
    ) throws IOException {
        // ODsay Api Key 정보
        String apiKey = "B5gRiR7GMNZ0cVrmZT9OLQ";

        // 먼저 pointBusStation에서 해당 정류장의 기본 정보 가져오기
        String urlInfo = "https://api.odsay.com/v1/api/busStationInfo?lang=0&stationID=" + stationID + "&apiKey=" + apiKey;
        
        URL url = new URL(urlInfo);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-type", "application/json");
        conn.setRequestProperty("Accept", "application/json");
        conn.setRequestProperty("Referer", "http://localhost:3000");
        
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
        
        if (responseCode == HttpURLConnection.HTTP_OK) {
            try {
                JsonNode rootNode = objectMapper.readTree(responseBody);
                JsonNode resultNode = rootNode.get("result");
                
                if (resultNode != null) {
                    ObjectNode detailResult = objectMapper.createObjectNode();
                    
                    // 정류장 기본 정보
                    if (resultNode.has("stationID")) {
                        detailResult.put("stationID", resultNode.get("stationID").asInt());
                    }
                    if (resultNode.has("stationName")) {
                        detailResult.put("stationName", resultNode.get("stationName").asText());
                    }
                    if (resultNode.has("x")) {
                        detailResult.put("x", resultNode.get("x").asDouble());
                    }
                    if (resultNode.has("y")) {
                        detailResult.put("y", resultNode.get("y").asDouble());
                    }
                    
                    // direction 정보
                    String direction = getBusStationDirection(stationID, apiKey);
                    if (direction != null) {
                        detailResult.put("direction", direction);
                    }
                    
                    // 버스 리스트 및 상세 정보
                    if (resultNode.has("lane")) {
                        ArrayNode laneArray = (ArrayNode) resultNode.get("lane");
                        ArrayNode enrichedBusList = objectMapper.createArrayNode();
                        
                        // 중복 API 호출 방지를 위한 Map
                        Map<Integer, JsonNode> busLaneDetailCache = new HashMap<>();
                        Map<Integer, JsonNode> busNextStationMap = getBusNextStationInfo(stationID, apiKey);
                        
                        for (JsonNode lane : laneArray) {
                            ObjectNode busObject = objectMapper.createObjectNode();
                            
                            if (lane.has("busID")) {
                                int busID = lane.get("busID").asInt();
                                
                                // 기본 버스 정보
                                if (lane.has("busNo")) {
                                    busObject.put("busNo", lane.get("busNo").asText());
                                }
                                if (lane.has("type")) {
                                    busObject.put("type", lane.get("type").asInt());
                                }
                                busObject.put("busID", busID);
                                
                                // 노선 정보 추가
                                if (!busLaneDetailCache.containsKey(busID)) {
                                    JsonNode laneDetail = getBusLaneDetail(busID, apiKey);
                                    if (laneDetail != null) {
                                        busLaneDetailCache.put(busID, laneDetail);
                                    }
                                }
                                
                                JsonNode laneDetail = busLaneDetailCache.get(busID);
                                if (laneDetail != null) {
                                    busObject.set("laneDetail", laneDetail);
                                }
                                
                                // 다음 정류장 정보 추가
                                JsonNode nextStationInfo = busNextStationMap.get(busID);
                                if (nextStationInfo != null) {
                                    if (nextStationInfo.has("busDirectionName")) {
                                        busObject.put("nextStationName", nextStationInfo.get("busDirectionName").asText());
                                    }
                                    if (nextStationInfo.has("busDirectionStationID")) {
                                        busObject.put("nextStationID", nextStationInfo.get("busDirectionStationID").asInt());
                                    }
                                }
                            }
                            
                            enrichedBusList.add(busObject);
                        }
                        
                        detailResult.set("busList", enrichedBusList);
                    }
                    
                    ObjectNode responseRoot = objectMapper.createObjectNode();
                    responseRoot.set("result", detailResult);
                    
                    responseBody = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(responseRoot);
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

    /**
     * 정류장 ID로 busStationInfo API를 호출하여 각 버스의 다음 정류장 정보 반환
     * @param stationID 정류장 ID
     * @param apiKey ODsay API Key
     * @return Map<busID, 다음 정류장 정보 JsonNode>
     */
    private Map<Integer, JsonNode> getBusNextStationInfo(int stationID, String apiKey) {
        Map<Integer, JsonNode> busNextStationMap = new HashMap<>();
        
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
                
                // JSON 파싱하여 각 버스의 다음 정류장 정보 수집
                JsonNode rootNode = objectMapper.readTree(sb.toString());
                JsonNode resultNode = rootNode.get("result");
                
                if (resultNode != null && resultNode.has("lane")) {
                    ArrayNode laneArray = (ArrayNode) resultNode.get("lane");
                    
                    // 각 lane에서 busID와 다음 정류장 정보 추출
                    for (JsonNode lane : laneArray) {
                        if (lane.has("busID")) {
                            int busID = lane.get("busID").asInt();
                            // 다음 정류장 정보만 추출 (busDirectionName, busDirectionStationID)
                            ObjectNode nextStationInfo = objectMapper.createObjectNode();
                            if (lane.has("busDirectionName")) {
                                nextStationInfo.put("busDirectionName", lane.get("busDirectionName").asText());
                            }
                            if (lane.has("busDirectionStationID")) {
                                nextStationInfo.put("busDirectionStationID", lane.get("busDirectionStationID").asInt());
                            }
                            busNextStationMap.put(busID, nextStationInfo);
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error getting bus next station info for stationID " + stationID + ": " + e.getMessage());
            e.printStackTrace();
        }
        
        return busNextStationMap;
    }

    /**
     * 버스 ID로 busLaneDetail API를 호출하여 노선 정보 반환
     * @param busID 버스 ID
     * @param apiKey ODsay API Key
     * @return 노선 정보 (JsonNode) - null이면 오류 발생
     */
    private JsonNode getBusLaneDetail(int busID, String apiKey) {
        try {
            String urlInfo = "https://api.odsay.com/v1/api/busLaneDetail?lang=0&busID=" + busID + "&apiKey=" + apiKey;
            
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
                
                // JSON 파싱하여 result 반환
                JsonNode rootNode = objectMapper.readTree(sb.toString());
                JsonNode resultNode = rootNode.get("result");
                
                if (resultNode != null) {
                    return resultNode;
                }
            }
        } catch (Exception e) {
            System.err.println("Error getting bus lane detail for busID " + busID + ": " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
}

