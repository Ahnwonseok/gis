package project.gis.controller;

import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import project.gis.dto.LocationShareDto;
import project.gis.service.LocationShareService;

@RestController
@RequestMapping("/api/share")
public class LocationShareController {

    private final LocationShareService locationShareService;

    public LocationShareController(LocationShareService locationShareService) {
        this.locationShareService = locationShareService;
    }

    @PostMapping("/{sessionId}")
    public ResponseEntity<Void> updatePosition(
            @PathVariable String sessionId,
            @RequestBody LocationShareDto body) {
        if (!isValidSessionId(sessionId)) {
            return ResponseEntity.badRequest().build();
        }
        if (body == null
                || Double.isNaN(body.getLatitude())
                || Double.isNaN(body.getLongitude())
                || Math.abs(body.getLatitude()) > 90
                || Math.abs(body.getLongitude()) > 180) {
            return ResponseEntity.badRequest().build();
        }
        locationShareService.savePosition(
                sessionId, body.getLatitude(), body.getLongitude(), body.getAccuracy());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<LocationShareDto> getPosition(@PathVariable String sessionId) {
        if (!isValidSessionId(sessionId)) {
            return ResponseEntity.badRequest().build();
        }
        return locationShareService
                .getPosition(sessionId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private static boolean isValidSessionId(String sessionId) {
        if (sessionId == null || sessionId.length() > 64) {
            return false;
        }
        try {
            UUID.fromString(sessionId);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
