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
import java.util.*;

@RestController
@RequestMapping("/api")
public class BusController {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String serviceKey = "793e910884a18a6955614818e50eb25d7ea73fab714542fb5379d983464d589f";

    /**
     * 좌표 기준 반경 내 버스 정류장 조회 (새로운 API 사용)
     * 1. getBusStationAroundListv2 - 근처 정류장 찾기
     * 2. getBusStationViaRouteListv2 - 각 정류장의 경유 노선 조회
     * 3. getBusRouteStationListv2 - 각 노선의 상세 정보 조회
     * @param x 경도 (longitude)
     * @param y 위도 (latitude)
     * @return 버스 정류장 정보 (JSON) - 가장 가까운 3개 정류장과 각 정류장의 버스 정보 포함
     */
    @GetMapping("/station")
    public ResponseEntity<String> getBusStationByPoint(
            @RequestParam double x,
            @RequestParam double y
    ) throws IOException {
        try {
            // 1단계: 근처 정류장 찾기
            List<JsonNode> nearbyStations = getBusStationAroundList(x, y);
            
            if (nearbyStations.isEmpty()) {
                ObjectNode emptyResult = objectMapper.createObjectNode();
                emptyResult.put("count", 0);
                emptyResult.set("lane", objectMapper.createArrayNode());
                ObjectNode emptyRoot = objectMapper.createObjectNode();
                emptyRoot.set("result", emptyResult);
                return ResponseEntity.ok(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(emptyRoot));
            }

            ArrayNode laneArray = objectMapper.createArrayNode();
            
            // 각 정류장에 대해 상세 정보 수집
            for (JsonNode station : nearbyStations) {
                int stationId = station.get("stationId").asInt();
                String stationName = station.has("stationName") ? station.get("stationName").asText() : "";
                double stationX = station.has("x") ? station.get("x").asDouble() : 0.0;
                double stationY = station.has("y") ? station.get("y").asDouble() : 0.0;
                int distance = station.has("distance") ? station.get("distance").asInt() : 0;
                
                // 2단계: 정류장 경유 노선 조회
                List<JsonNode> routeList = getBusStationViaRouteList(stationId);
                
                if (routeList.isEmpty()) {
                    continue;
                }
                
                // 방면 정보 추출 (가장 많이 나타나는 routeDestName)
                String direction = getMostFrequentDirection(routeList);
                
                // 3단계: 각 노선의 상세 정보 조회
                ArrayNode busListArray = objectMapper.createArrayNode();
                Map<Integer, JsonNode> routeDetailCache = new HashMap<>();
                
                for (JsonNode route : routeList) {
                    int routeId = route.get("routeId").asInt();
                    String routeName = route.has("routeName") ? route.get("routeName").asText() : "";
                    String routeDestName = route.has("routeDestName") ? route.get("routeDestName").asText() : "";
                    
                    // 노선 상세 정보 조회 (캐시 사용)
                    JsonNode routeDetail = routeDetailCache.get(routeId);
                    if (routeDetail == null) {
                        routeDetail = getBusRouteStationList(routeId);
                        if (routeDetail != null) {
                            routeDetailCache.put(routeId, routeDetail);
                        }
                    }
                    
                    ObjectNode busObject = objectMapper.createObjectNode();
                    busObject.put("busID", routeId);
                    busObject.put("busNo", routeName);
                    busObject.put("routeDestName", routeDestName);
                    
                    if (routeDetail != null) {
                        busObject.set("laneDetail", routeDetail);
                    }
                    
                    busListArray.add(busObject);
                }
                
                // 정류장 정보 객체 생성
                ObjectNode laneObject = objectMapper.createObjectNode();
                laneObject.put("stationID", stationId);
                laneObject.put("stationName", stationName);
                laneObject.put("x", stationX);
                laneObject.put("y", stationY);
                laneObject.put("distance", distance);
                if (direction != null && !direction.isEmpty()) {
                    laneObject.put("direction", direction);
                }
                laneObject.set("busList", busListArray);
                
                laneArray.add(laneObject);
            }
            
            // 최종 응답 생성
            ObjectNode result = objectMapper.createObjectNode();
            result.put("count", laneArray.size());
            result.set("lane", laneArray);
            
            ObjectNode root = objectMapper.createObjectNode();
            root.set("result", result);
            
            String responseBody = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(root);
            System.out.println("Final Response: " + responseBody);
            
            return ResponseEntity.ok(responseBody);
            
            } catch (Exception e) {
            System.err.println("Error in getBusStationByPoint: " + e.getMessage());
                e.printStackTrace();
            return ResponseEntity.status(500).body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    /**
     * 1단계: 근처 정류장 찾기 API 호출
     * @param x 경도
     * @param y 위도
     * @return 가장 가까운 3개 정류장 리스트
     */
    private List<JsonNode> getBusStationAroundList(double x, double y) {
        List<JsonNode> stations = new ArrayList<>();
        
        try {
            String urlInfo = "https://apis.data.go.kr/6410000/busstationservice/v2/getBusStationAroundListv2" +
                    "?serviceKey=" + serviceKey +
                    "&x=" + x +
                    "&y=" + y +
                    "&format=json";
            
            URL url = new URL(urlInfo);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Content-type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            
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
                
                JsonNode rootNode = objectMapper.readTree(sb.toString());
                JsonNode responseNode = rootNode.get("response");
                
                if (responseNode != null) {
                    JsonNode msgBody = responseNode.get("msgBody");
                    if (msgBody != null && msgBody.has("busStationAroundList")) {
                        JsonNode busStationAroundListNode = msgBody.get("busStationAroundList");
                        
                        // busStationAroundList가 배열인지 확인
                        if (busStationAroundListNode.isArray()) {
                            ArrayNode stationArray = (ArrayNode) busStationAroundListNode;
                            
                            // distance 기준으로 정렬하고 상위 3개만 선택
                            List<JsonNode> stationList = new ArrayList<>();
                            for (JsonNode station : stationArray) {
                                stationList.add(station);
                            }
                            
                            stationList.sort((a, b) -> {
                                int distA = a.has("distance") ? a.get("distance").asInt() : Integer.MAX_VALUE;
                                int distB = b.has("distance") ? b.get("distance").asInt() : Integer.MAX_VALUE;
                                return Integer.compare(distA, distB);
                            });
                            
                            // 상위 3개만 반환
                            stations = stationList.subList(0, Math.min(3, stationList.size()));
                        } else if (busStationAroundListNode.isObject()) {
                            // 단일 객체인 경우 리스트에 추가
                            stations.add(busStationAroundListNode);
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error getting bus station around list: " + e.getMessage());
            e.printStackTrace();
        }
        
        return stations;
    }

    /**
     * 2단계: 정류장 경유 노선 조회 API 호출
     * @param stationId 정류장 ID
     * @return 경유 노선 리스트
     */
    private List<JsonNode> getBusStationViaRouteList(int stationId) {
        List<JsonNode> routes = new ArrayList<>();
        
        try {
            String urlInfo = "https://apis.data.go.kr/6410000/busstationservice/v2/getBusStationViaRouteListv2" +
                    "?serviceKey=" + serviceKey +
                    "&stationId=" + stationId +
                    "&format=json";
            
            URL url = new URL(urlInfo);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Content-type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            
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
                
                JsonNode rootNode = objectMapper.readTree(sb.toString());
                JsonNode responseNode = rootNode.get("response");
                
                if (responseNode != null) {
                    JsonNode msgBody = responseNode.get("msgBody");
                    if (msgBody != null && msgBody.has("busRouteList")) {
                        JsonNode busRouteListNode = msgBody.get("busRouteList");
                        
                        // busRouteList가 배열인지 확인
                        if (busRouteListNode.isArray()) {
                            ArrayNode routeArray = (ArrayNode) busRouteListNode;
                            for (JsonNode route : routeArray) {
                                routes.add(route);
                            }
                        } else if (busRouteListNode.isObject()) {
                            // 단일 객체인 경우 리스트에 추가
                            routes.add(busRouteListNode);
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error getting bus station via route list for stationId " + stationId + ": " + e.getMessage());
            e.printStackTrace();
        }
        
        return routes;
    }

    /**
     * 3단계: 노선 상세 정보 조회 API 호출
     * @param routeId 노선 ID
     * @return 노선 상세 정보 (JsonNode) - station 배열과 turningPointIdx 포함
     */
    private JsonNode getBusRouteStationList(int routeId) {
        try {
            String urlInfo = "https://apis.data.go.kr/6410000/busrouteservice/v2/getBusRouteStationListv2" +
                    "?serviceKey=" + serviceKey +
                    "&routeId=" + routeId +
                    "&format=json";
            
            URL url = new URL(urlInfo);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Content-type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            
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
                
                JsonNode rootNode = objectMapper.readTree(sb.toString());
                JsonNode responseNode = rootNode.get("response");
                
                if (responseNode != null) {
                    JsonNode msgBody = responseNode.get("msgBody");
                    if (msgBody != null && msgBody.has("busRouteStationList")) {
                        JsonNode busRouteStationListNode = msgBody.get("busRouteStationList");
                        
                        // busRouteStationList가 배열이 아니면 null 반환
                        if (!busRouteStationListNode.isArray()) {
                            return null;
                        }
                        
                        ArrayNode stationArray = (ArrayNode) busRouteStationListNode;
                        
                        // station 배열 변환 (stationId -> stationID로 통일)
                        ArrayNode convertedStationArray = objectMapper.createArrayNode();
                        for (JsonNode station : stationArray) {
                            ObjectNode convertedStation = objectMapper.createObjectNode();
                            
                            // 모든 필드 복사
                            station.fieldNames().forEachRemaining(key -> {
                                JsonNode value = station.get(key);
                                
                                // stationId를 stationID로 변환
                                if ("stationId".equals(key)) {
                                    convertedStation.put("stationID", value.asInt());
                                } else {
                                    convertedStation.set(key, value);
                                }
                            });
                            
                            convertedStationArray.add(convertedStation);
                        }
                        
                        // 노선 상세 정보 객체 생성
                        ObjectNode laneDetail = objectMapper.createObjectNode();
                        laneDetail.set("station", convertedStationArray);
                        
                        // turningPointIdx 찾기 (turnYn이 "Y"인 첫 번째 정류장의 stationSeq - 1)
                        int turningPointIdx = convertedStationArray.size(); // 기본값: 배열 끝
                        for (JsonNode station : convertedStationArray) {
                            if (station.has("turnYn") && "Y".equals(station.get("turnYn").asText())) {
                                if (station.has("stationSeq")) {
                                    turningPointIdx = station.get("stationSeq").asInt() - 1;
                                }
                                break;
                            }
                        }
                        laneDetail.put("turningPointIdx", turningPointIdx);
                        
                        return laneDetail;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error getting bus route station list for routeId " + routeId + ": " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }

    /**
     * 경유 노선 리스트에서 가장 많이 나타나는 방면(routeDestName) 반환
     * @param routeList 경유 노선 리스트
     * @return 가장 많이 나타나는 방면명
     */
    private String getMostFrequentDirection(List<JsonNode> routeList) {
        Map<String, Integer> directionCount = new HashMap<>();
        
        for (JsonNode route : routeList) {
            if (route.has("routeDestName")) {
                String directionName = route.get("routeDestName").asText();
                directionCount.put(directionName, directionCount.getOrDefault(directionName, 0) + 1);
            }
        }
        
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

