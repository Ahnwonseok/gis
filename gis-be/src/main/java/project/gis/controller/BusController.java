package project.gis.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
                
                // 3단계: 각 노선의 상세 정보 조회
                ArrayNode busListArray = objectMapper.createArrayNode();
                Map<Integer, JsonNode> routeDetailCache = new HashMap<>();
                Map<String, Integer> nextStationCount = new HashMap<>(); // 다음 정류장별 카운트
                
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
                    
                    // 현재 정류장의 다음 정류장 찾기 및 stationSeq 찾기
                    String nextStationName = null;
                    int currentStationSeq = -1;
                    if (routeDetail != null && routeDetail.has("station")) {
                        JsonNode stationArray = routeDetail.get("station");
                        if (stationArray.isArray()) {
                            for (int i = 0; i < stationArray.size(); i++) {
                                JsonNode routeStation = stationArray.get(i);
                                if (routeStation.has("stationID") && routeStation.get("stationID").asInt() == stationId) {
                                    // 현재 정류장의 stationSeq 저장
                                    if (routeStation.has("stationSeq")) {
                                        currentStationSeq = routeStation.get("stationSeq").asInt();
                                    }
                                    
                                    // 다음 정류장 확인
                                    if (i + 1 < stationArray.size()) {
                                        JsonNode nextStation = stationArray.get(i + 1);
                                        if (nextStation.has("stationName")) {
                                            nextStationName = nextStation.get("stationName").asText();
                                            // 다음 정류장 카운트 증가
                                            nextStationCount.put(nextStationName, 
                                                nextStationCount.getOrDefault(nextStationName, 0) + 1);
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    
                    // 버스 도착 정보 조회 (stationSeq가 있는 경우에만)
                    Integer locationNo1 = null;
                    Integer predictTimeSec1 = null;
                    if (currentStationSeq > 0) {
                        JsonNode arrivalInfo = getBusArrivalItem(stationId, routeId, currentStationSeq);
                        if (arrivalInfo != null) {
                            if (arrivalInfo.has("locationNo1")) {
                                locationNo1 = arrivalInfo.get("locationNo1").asInt();
                            }
                            if (arrivalInfo.has("predictTimeSec1")) {
                                predictTimeSec1 = arrivalInfo.get("predictTimeSec1").asInt();
                            }
                        }
                    }
                    
                    ObjectNode busObject = objectMapper.createObjectNode();
                    busObject.put("busID", routeId);
                    busObject.put("busNo", routeName);
                    busObject.put("routeDestName", routeDestName);
                    if (nextStationName != null) {
                        busObject.put("nextStationName", nextStationName);
                    }
                    if (locationNo1 != null) {
                        busObject.put("locationNo1", locationNo1);
                    }
                    if (predictTimeSec1 != null) {
                        busObject.put("predictTimeSec1", predictTimeSec1);
                    }
                    
                    if (routeDetail != null) {
                        busObject.set("laneDetail", routeDetail);
                    }
                    
                    busListArray.add(busObject);
                }
                
                // 방면 정보 추출 (가장 많이 나타나는 다음 정류장명)
                String direction = getMostFrequentNextStation(nextStationCount);
                
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
     * 정류장 상세 정보 조회 (stationID로 특정 정류장의 버스 정보 조회)
     * @param stationID 정류장 ID
     * @return 정류장 상세 정보 (버스 목록 포함)
     */
    @GetMapping("/station/detail")
    public ResponseEntity<String> getBusStationDetail(
            @RequestParam int stationID
    ) throws IOException {
        try {
            // 2단계: 정류장 경유 노선 조회
            List<JsonNode> routeList = getBusStationViaRouteList(stationID);
            
            if (routeList.isEmpty()) {
                ObjectNode emptyResult = objectMapper.createObjectNode();
                emptyResult.put("stationID", stationID);
                emptyResult.set("busList", objectMapper.createArrayNode());
                ObjectNode emptyRoot = objectMapper.createObjectNode();
                emptyRoot.set("result", emptyResult);
                return ResponseEntity.ok(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(emptyRoot));
            }

            // 정류장 기본 정보 (첫 번째 노선에서 가져오기)
            String stationName = "";
            double stationX = 0.0;
            double stationY = 0.0;
            
            // 3단계: 각 노선의 상세 정보 조회
            ArrayNode busListArray = objectMapper.createArrayNode();
            Map<Integer, JsonNode> routeDetailCache = new HashMap<>();
            Map<String, Integer> nextStationCount = new HashMap<>(); // 다음 정류장별 카운트
            
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
                
                // 현재 정류장의 다음 정류장 찾기 및 stationSeq 찾기
                String nextStationName = null;
                int currentStationSeq = -1;
                if (routeDetail != null && routeDetail.has("station")) {
                    JsonNode stationArray = routeDetail.get("station");
                    if (stationArray.isArray()) {
                        for (int i = 0; i < stationArray.size(); i++) {
                            JsonNode routeStation = stationArray.get(i);
                            if (routeStation.has("stationID") && routeStation.get("stationID").asInt() == stationID) {
                                // 정류장 기본 정보 저장 (첫 번째 발견 시)
                                if (stationName.isEmpty() && routeStation.has("stationName")) {
                                    stationName = routeStation.get("stationName").asText();
                                }
                                if (stationX == 0.0 && routeStation.has("x")) {
                                    stationX = routeStation.get("x").asDouble();
                                }
                                if (stationY == 0.0 && routeStation.has("y")) {
                                    stationY = routeStation.get("y").asDouble();
                                }
                                
                                // 현재 정류장의 stationSeq 저장
                                if (routeStation.has("stationSeq")) {
                                    currentStationSeq = routeStation.get("stationSeq").asInt();
                                }
                                
                                // 다음 정류장 확인
                                if (i + 1 < stationArray.size()) {
                                    JsonNode nextStation = stationArray.get(i + 1);
                                    if (nextStation.has("stationName")) {
                                        nextStationName = nextStation.get("stationName").asText();
                                        // 다음 정류장 카운트 증가
                                        nextStationCount.put(nextStationName, 
                                            nextStationCount.getOrDefault(nextStationName, 0) + 1);
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
                
                // 버스 도착 정보 조회 (stationSeq가 있는 경우에만)
                Integer locationNo1 = null;
                Integer predictTimeSec1 = null;
                if (currentStationSeq > 0) {
                    JsonNode arrivalInfo = getBusArrivalItem(stationID, routeId, currentStationSeq);
                    if (arrivalInfo != null) {
                        if (arrivalInfo.has("locationNo1")) {
                            locationNo1 = arrivalInfo.get("locationNo1").asInt();
                        }
                        if (arrivalInfo.has("predictTimeSec1")) {
                            predictTimeSec1 = arrivalInfo.get("predictTimeSec1").asInt();
                        }
                    }
                }
                
                ObjectNode busObject = objectMapper.createObjectNode();
                busObject.put("busID", routeId);
                busObject.put("busNo", routeName);
                busObject.put("routeDestName", routeDestName);
                if (nextStationName != null) {
                    busObject.put("nextStationName", nextStationName);
                }
                if (locationNo1 != null) {
                    busObject.put("locationNo1", locationNo1);
                }
                if (predictTimeSec1 != null) {
                    busObject.put("predictTimeSec1", predictTimeSec1);
                }
                
                if (routeDetail != null) {
                    busObject.set("laneDetail", routeDetail);
                }
                
                busListArray.add(busObject);
            }
            
            // 방면 정보 추출 (가장 많이 나타나는 다음 정류장명)
            String direction = getMostFrequentNextStation(nextStationCount);
            
            // 정류장 정보 객체 생성
            ObjectNode result = objectMapper.createObjectNode();
            result.put("stationID", stationID);
            result.put("stationName", stationName);
            result.put("x", stationX);
            result.put("y", stationY);
            if (direction != null && !direction.isEmpty()) {
                result.put("direction", direction);
            }
            result.set("busList", busListArray);
            
            ObjectNode root = objectMapper.createObjectNode();
            root.set("result", result);
            
            String responseBody = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(root);
            return ResponseEntity.ok(responseBody);
            
        } catch (Exception e) {
            System.err.println("Error in getBusStationDetail: " + e.getMessage());
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
     * 다음 정류장 카운트에서 가장 많이 나타나는 다음 정류장명 반환
     * @param nextStationCount 다음 정류장별 카운트 맵
     * @return 가장 많이 나타나는 다음 정류장명
     */
    private String getMostFrequentNextStation(Map<String, Integer> nextStationCount) {
        if (nextStationCount.isEmpty()) {
            return null;
        }
        
        String mostFrequentNextStation = null;
        int maxCount = 0;
        for (Map.Entry<String, Integer> entry : nextStationCount.entrySet()) {
            if (entry.getValue() > maxCount) {
                maxCount = entry.getValue();
                mostFrequentNextStation = entry.getKey();
            }
        }
        
        return mostFrequentNextStation;
    }

    /**
     * 버스 도착 정보 조회 API 호출
     * @param stationId 정류장 ID
     * @param routeId 노선 ID
     * @param staOrder 정류장 순서 (stationSeq)
     * @return 버스 도착 정보 (locationNo1, predictTimeSec1 포함)
     */
    private JsonNode getBusArrivalItem(int stationId, int routeId, int staOrder) {
        try {
            String urlInfo = "https://apis.data.go.kr/6410000/busarrivalservice/v2/getBusArrivalItemv2" +
                    "?serviceKey=" + serviceKey +
                    "&stationId=" + stationId +
                    "&routeId=" + routeId +
                    "&staOrder=" + staOrder +
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
                    if (msgBody != null && msgBody.has("busArrivalItem")) {
                        JsonNode busArrivalItem = msgBody.get("busArrivalItem");
                        
                        // 배열인 경우 첫 번째 항목 반환
                        if (busArrivalItem.isArray() && busArrivalItem.size() > 0) {
                            return busArrivalItem.get(0);
                        } else if (busArrivalItem.isObject()) {
                            return busArrivalItem;
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error getting bus arrival item for stationId " + stationId + 
                    ", routeId " + routeId + ", staOrder " + staOrder + ": " + e.getMessage());
            // 에러가 발생해도 계속 진행 (도착 정보는 선택적)
        }
        
        return null;
    }

    /**
     * 버스 도착 정보 조회 API
     * @param stationId 정류장 ID
     * @param routeId 노선 ID
     * @param staOrder 정류장 순서 (stationSeq)
     * @return 버스 도착 정보 (locationNo1, predictTimeSec1 포함)
     */
    @GetMapping("/bus/arrival")
    public ResponseEntity<String> getBusArrival(
            @RequestParam int stationId,
            @RequestParam int routeId,
            @RequestParam int staOrder
    ) {
        try {
            JsonNode arrivalInfo = getBusArrivalItem(stationId, routeId, staOrder);
            
            if (arrivalInfo != null) {
                ObjectNode response = objectMapper.createObjectNode();
                response.set("result", arrivalInfo);
                return ResponseEntity.ok(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(response));
            } else {
                ObjectNode errorResponse = objectMapper.createObjectNode();
                errorResponse.put("error", "버스 도착 정보를 찾을 수 없습니다.");
                return ResponseEntity.status(404).body(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(errorResponse));
            }
        } catch (Exception e) {
            System.err.println("Error in getBusArrival: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    /**
     * 네이버 클로바 OCR 프록시 엔드포인트
     * CORS 문제를 해결하기 위해 백엔드를 통해 OCR API 호출
     */
    @PostMapping("/ocr/recognize")
    public ResponseEntity<String> recognizeOCR(
            @RequestParam("message") String message,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        try {
            String clovaOcrUrl = "https://xkrzt7gj72.apigw.ntruss.com/custom/v1/48680/c0040045314eaa9dd8625b3015fe86447f0cdb70ba931d7e1f6939e019330e58/general";
            String clovaOcrSecret = "eFRUenNlWEhLdmJyQkhuTlBqWUFxZFRYT3NoWU5oSkY=";

            // multipart/form-data 요청 생성
            java.net.URL url = new java.net.URL(clovaOcrUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("X-OCR-SECRET", clovaOcrSecret);
            conn.setDoOutput(true);

            // multipart/form-data 형식으로 데이터 전송
            String boundary = "----WebKitFormBoundary" + System.currentTimeMillis();
            conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

            try (java.io.OutputStream os = conn.getOutputStream();
                 java.io.PrintWriter writer = new java.io.PrintWriter(new java.io.OutputStreamWriter(os, "UTF-8"), true)) {
                
                // message 필드
                writer.append("--" + boundary).append("\r\n");
                writer.append("Content-Disposition: form-data; name=\"message\"").append("\r\n");
                writer.append("Content-Type: text/plain; charset=UTF-8").append("\r\n");
                writer.append("\r\n");
                writer.append(message).append("\r\n");
                writer.flush();

                // file 필드
                writer.append("--" + boundary).append("\r\n");
                writer.append("Content-Disposition: form-data; name=\"file\"; filename=\"" + file.getOriginalFilename() + "\"").append("\r\n");
                writer.append("Content-Type: " + file.getContentType()).append("\r\n");
                writer.append("\r\n");
                writer.flush();

                // 파일 데이터 전송
                file.getInputStream().transferTo(os);
                os.flush();

                writer.append("\r\n");
                writer.append("--" + boundary + "--").append("\r\n");
                writer.flush();
            }

            // 응답 읽기
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

                return ResponseEntity.ok(sb.toString());
            } else {
                BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = bufferedReader.readLine()) != null) {
                    sb.append(line);
                }
                bufferedReader.close();
                conn.disconnect();

                return ResponseEntity.status(responseCode).body(sb.toString());
            }
        } catch (Exception e) {
            System.err.println("Error in OCR recognition: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}

