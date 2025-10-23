import React, { useEffect, useRef } from 'react';
import api from '../api/axiosInstance';

const VWorldMap = () => {
  const mapRef = useRef(null);
  const geoLayerRef = useRef(null);

  useEffect(() => {
    // HTML에서 로드된 VWorld API 사용
    const checkAndInitialize = () => {
      // VWorld API가 완전히 로드될 때까지 잠시 대기 (최대 15초)
      let attempts = 0;
      const maxAttempts = 150; // 15초 (150 * 100ms)
      
      const checkVWorld = () => {
        attempts++;
        console.log(`VWorld API 확인 시도 ${attempts}/${maxAttempts}:`, typeof window.vworld);
        
        if (typeof window.vworld !== 'undefined' && window.vworld.init) {
          console.log('VWorld API 로드 완료:', window.vworld);
          initializeMap();
        } else if (attempts < maxAttempts) {
          setTimeout(checkVWorld, 100);
        } else {
          console.error('VWorld API 로딩 타임아웃: 15초 후에도 로드되지 않았습니다.');
          console.log('현재 window.vworld 상태:', window.vworld);
          console.log('window 객체에서 vworld 관련 속성들:', Object.keys(window).filter(key => key.includes('vworld') || key.includes('VWorld')));
          
          // VWorld API 에러 메시지 확인
          if (window.vworldErrMsg) {
            console.error('VWorld API 에러 메시지:', window.vworldErrMsg);
          }
          
          // VWorld API 유효성 확인
          if (window.vworldIsValid !== undefined) {
            console.log('VWorld API 유효성:', window.vworldIsValid);
          }
          
          // 수동으로 VWorld API 초기화 시도
          tryManualInitialization();
          
          // VWorld API가 실패할 경우 대안 제공
          setTimeout(() => {
            if (typeof window.vworld === 'undefined' || !window.vworld.init) {
              console.log('VWorld API 로드 실패 - 대안 맵 표시');
              showAlternativeMap();
            }
          }, 2000);
        }
      };
      
      checkVWorld();
    };

    // 수동 초기화 함수
    const tryManualInitialization = () => {
      console.log('수동 초기화 시도 중...');
      
      // 다른 가능한 VWorld 객체 이름들 확인
      const possibleNames = ['VWorld', 'VWORLD', 'vWorld', 'Vworld'];
      for (const name of possibleNames) {
        if (window[name]) {
          console.log(`${name} 객체 발견:`, window[name]);
          window.vworld = window[name];
          initializeMap();
          return;
        }
      }
      
      // VWorld API를 다시 로드 시도
      console.log('VWorld API 재로드 시도...');
      const script = document.createElement('script');
      script.src = "https://map.vworld.kr/js/vworldMapInit.js.do?version=2.0&apiKey=08CCA73D-C320-32E2-909C-5A00BE873BD9&t=" + Date.now();
      script.onload = () => {
        console.log('VWorld API 재로드 완료');
        setTimeout(() => {
          if (typeof window.vworld !== 'undefined' && window.vworld.init) {
            initializeMap();
          } else {
            console.error('재로드 후에도 VWorld API를 찾을 수 없습니다.');
          }
        }, 1000);
      };
      script.onerror = () => {
        console.error('VWorld API 재로드 실패');
      };
      document.head.appendChild(script);
    };

    // 대안 맵 표시 함수
    const showAlternativeMap = () => {
      const mapContainer = document.getElementById('vmap');
      if (mapContainer) {
        mapContainer.innerHTML = `
          <div style="
            width: 100%; 
            height: 100%; 
            background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            border: 2px dashed #ccc;
            color: #666;
            font-family: Arial, sans-serif;
          ">
            <h3>🗺️ 맵 로딩 중...</h3>
            <p>VWorld API를 로드하는 중입니다.</p>
            <p style="font-size: 12px; margin-top: 10px;">
              API 키 또는 네트워크 문제로 인해 맵이 로드되지 않을 수 있습니다.
            </p>
            <button onclick="window.location.reload()" style="
              margin-top: 15px;
              padding: 8px 16px;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            ">새로고침</button>
          </div>
        `;
      }
    };

    // 페이지 로드 완료 후 초기화 시도
    if (document.readyState === 'complete') {
      checkAndInitialize();
    } else {
      window.addEventListener('load', checkAndInitialize);
    }

    const initializeMap = () => {
      try {
        console.log('VWorld API 초기화 시작');
        
        // VWorld API 초기화
        window.vworld.init("vmap", "map-first", 
          function() {        
            console.log('VWorld 맵 초기화 성공');
            const apiMap = this.vmap; // 브이월드맵 apiMap에 셋팅 
            apiMap.setBaseLayer(apiMap.vworldBaseMap); // 기본맵 설정 
            apiMap.setControlsType({"simpleMap":true}); // 간단한 화면
            apiMap.addVWORLDControl("zoomBar"); // panzoombar등록
            apiMap.setCenterAndZoom(14135006.54, 4518292.14, 7); // 화면중심점과 레벨로 이동
            
            mapRef.current = apiMap;

            // 클릭 이벤트
            apiMap.addEventListener("click", async (evt) => {
              const { clientX, clientY } = evt;
              const position = apiMap.getCoordinateFromPixel(clientX, clientY);
              const [x, y] = position;

              try {
                const res = await api.get(`/land/search?x=${x}&y=${y}`);
                const data = res.data;

                if (geoLayerRef.current) apiMap.removeLayer(geoLayerRef.current);

                const geojsonLayer = new window.vworld.Layer("GeoJSON_LAYER");
                apiMap.addLayer(geojsonLayer);
                geoLayerRef.current = geojsonLayer;

                data.forEach((feature) => {
                  const geojson = JSON.parse(feature.geom);
                  const vector = new window.vworld.Feature(geojson);
                  geojsonLayer.addFeature(vector);
                });
              } catch (error) {
                console.error('API 호출 중 오류:', error);
              }
            });
          },
          function (obj){ // 3D initCall(성공)
            console.log('3D 맵 초기화 성공:', obj);
          },
          function (msg){ // 3D failCall(실패)
            console.error('3D 맵 초기화 실패:', msg);
          }
        );
      } catch (error) {
        console.error('맵 초기화 중 오류 발생:', error);
      }
    };

    return () => {
      window.removeEventListener('load', checkAndInitialize);
    };
  }, []);

  return <div id="vmap" style={{ width: "100%", height: "600px" }} />;
};

export default VWorldMap;
