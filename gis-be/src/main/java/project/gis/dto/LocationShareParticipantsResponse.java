package project.gis.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.LinkedHashMap;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class LocationShareParticipantsResponse {

    private Map<String, LocationShareDto> participants = new LinkedHashMap<>();

    public Map<String, LocationShareDto> getParticipants() {
        return participants;
    }

    public void setParticipants(Map<String, LocationShareDto> participants) {
        this.participants = participants;
    }
}
