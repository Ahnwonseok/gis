package project.gis.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.gis.dto.LocationShareParticipantsResponse;
import project.gis.dto.LocationSharePostRequest;
import project.gis.service.LocationShareService;

import java.util.UUID;

@RestController
@RequestMapping("/api/share")
public class LocationShareController {

    private final LocationShareService locationShareService;

    public LocationShareController(LocationShareService locationShareService) {
        this.locationShareService = locationShareService;
    }

    @PostMapping("/{roomId}/position")
    public ResponseEntity<Void> updatePosition(
            @PathVariable String roomId, @RequestBody LocationSharePostRequest body) {
        if (!isValidUuid(roomId)) {
            return ResponseEntity.badRequest().build();
        }
        if (body == null
                || body.getParticipantId() == null
                || !isValidUuid(body.getParticipantId())
                || Double.isNaN(body.getLatitude())
                || Double.isNaN(body.getLongitude())
                || Math.abs(body.getLatitude()) > 90
                || Math.abs(body.getLongitude()) > 180) {
            return ResponseEntity.badRequest().build();
        }
        try {
            locationShareService.saveParticipantPosition(
                    roomId,
                    body.getParticipantId(),
                    body.getLatitude(),
                    body.getLongitude(),
                    body.getAccuracy());
            return ResponseEntity.ok().build();
        } catch (IllegalStateException e) {
            if ("ROOM_FULL".equals(e.getMessage())) {
                return ResponseEntity.status(409).build();
            }
            throw e;
        }
    }

    @DeleteMapping("/{roomId}/participants/{participantId}")
    public ResponseEntity<Void> leaveRoom(
            @PathVariable String roomId, @PathVariable String participantId) {
        if (!isValidUuid(roomId) || !isValidUuid(participantId)) {
            return ResponseEntity.badRequest().build();
        }
        locationShareService.removeParticipant(roomId, participantId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{roomId}/participants")
    public ResponseEntity<LocationShareParticipantsResponse> listParticipants(@PathVariable String roomId) {
        if (!isValidUuid(roomId)) {
            return ResponseEntity.badRequest().build();
        }
        LocationShareParticipantsResponse res = new LocationShareParticipantsResponse();
        res.setParticipants(locationShareService.getParticipants(roomId));
        return ResponseEntity.ok(res);
    }

    private static boolean isValidUuid(String value) {
        if (value == null || value.length() > 64) {
            return false;
        }
        try {
            UUID.fromString(value);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
