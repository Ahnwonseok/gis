package project.gis.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class LocationShareDto {

    private double latitude;
    private double longitude;
    private Double accuracy;
    private Long updatedAt;

    public LocationShareDto() {
    }

    public LocationShareDto(double latitude, double longitude, Double accuracy, Long updatedAt) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.accuracy = accuracy;
        this.updatedAt = updatedAt;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public Double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(Double accuracy) {
        this.accuracy = accuracy;
    }

    public Long getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Long updatedAt) {
        this.updatedAt = updatedAt;
    }
}
