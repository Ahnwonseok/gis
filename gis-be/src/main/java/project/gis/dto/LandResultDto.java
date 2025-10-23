package project.gis.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LandResultDto {
    private Long id;
    private String lotNo;
    private String owner;
    private String geom;
}
