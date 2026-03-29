package project.gis;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class GisApplicationTests {

    @MockitoBean
    @SuppressWarnings("unused")
    private StringRedisTemplate stringRedisTemplate;

    @Test
    void contextLoads() {
    }

}
