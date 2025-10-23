import React, { useEffect, useRef, useState } from 'react';
import api from '../api/axiosInstance';

const VWorldMap = () => {
  const mapRef = useRef(null);
  const geoLayerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    // 전역 오류 핸들러 추가
    const handleGlobalError = (event) => {
      // OpenLayers 중복 로드 오류는 무시
      if (event.error && event.error.message && 
          event.error.message.includes('Namespace "ol" already declared')) {
        console.log('OpenLayers 중복 로드 오류 무시됨');
        return;
      }
      
      console.error('전역 오류 발생:', event.error);
      console.error('오류 파일:', event.filename);
      console.error('오류 라인:', event.lineno);
      console.error('오류 컬럼:', event.colno);
      
      if (!error) {
        setError(`스크립트 오류: ${event.error?.message || '알 수 없는 오류'}`);
      }
    };

    const handleUnhandledRejection = (event) => {
      console.error('처리되지 않은 Promise 거부:', event.reason);
      if (!error) {
        setError(`Promise 오류: ${event.reason?.message || '알 수 없는 오류'}`);
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    try {
      // 이미 스크립트가 로드되어 있는지 확인
      if (window.vworld && window.vworld.Map) {
        console.log('VWorld API가 이미 로드되어 있음');
        setTimeout(() => {
          try {
            initializeMap();
          } catch (err) {
            console.error('기존 VWorld API 초기화 오류:', err);
            setError(`지도 초기화 오류: ${err.message}`);
          }
        }, 100);
        return;
      }

      // 이미 로딩 중인 스크립트가 있는지 확인
      if (document.querySelector('script[src*="vworldMapInit"]')) {
        console.log('VWorld 스크립트가 이미 로딩 중');
        return;
      }

    const script = document.createElement('script');
    script.src = "https://map.vworld.kr/js/vworldMapInit.js.do?version=2.0&apiKey=08CCA73D-C320-32E2-909C-5A00BE873BD9";
    script.async = true;

    script.onload = () => {
        try {
          console.log('VWorld 스크립트 로드 완료');
          console.log('window.vworld:', window.vworld);
          console.log('window.vworld.Map:', window.vworld?.Map);
          
          // VWorld API가 완전히 초기화될 때까지 대기
          waitForVWorldAPI();
        } catch (err) {
          console.error('VWorld 스크립트 로드 후 처리 오류:', err);
          setError(`스크립트 로드 후 처리 오류: ${err.message}`);
        }
      };

      script.onerror = (err) => {
        console.error('VWorld 스크립트 로드 실패:', err);
        setError('지도 스크립트를 로드할 수 없습니다.');
      };

      document.head.appendChild(script);
      
      return () => {
        // 이벤트 리스너 제거
        window.removeEventListener('error', handleGlobalError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        
        // 컴포넌트 언마운트 시 스크립트 제거
        try {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        } catch (err) {
          console.error('스크립트 제거 오류:', err);
        }
      };
    } catch (err) {
      console.error('useEffect 초기화 오류:', err);
      setError(`초기화 오류: ${err.message}`);
    }

    // cleanup 함수 반환
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const waitForVWorldAPI = () => {
    try {
      let attempts = 0;
      const maxAttempts = 50; // 5초 동안 시도 (100ms * 50)
      
      const checkVWorld = () => {
        try {
          attempts++;
          console.log(`VWorld API 확인 시도 ${attempts}/${maxAttempts}`);
          
          // 다양한 방식으로 VWorld API 확인
          if (window.vworld && window.vworld.Map) {
            console.log('VWorld API 발견됨:', window.vworld);
            setTimeout(() => {
              try {
                initializeMap();
              } catch (err) {
                console.error('VWorld API 초기화 오류:', err);
                setError(`VWorld API 초기화 오류: ${err.message}`);
              }
            }, 100);
            return;
          }
          
          // 다른 가능한 전역 객체들 확인
          if (window.vw && window.vw.ol3) {
            console.log('VWorld ol3 API 발견됨:', window.vw.ol3);
            // OpenLayers 라이브러리 로드 필요
            try {
              loadOpenLayersLibrary();
            } catch (err) {
              console.error('OpenLayers 라이브러리 로드 오류:', err);
              setError(`OpenLayers 라이브러리 로드 오류: ${err.message}`);
            }
            return;
          }
          
          // OpenLayers 객체 확인
          if (window.ol && window.ol.Map) {
            console.log('OpenLayers API 발견됨:', window.ol);
            setTimeout(() => {
              try {
                initializeMap();
              } catch (err) {
                console.error('OpenLayers 초기화 오류:', err);
                setError(`OpenLayers 초기화 오류: ${err.message}`);
              }
            }, 100);
            return;
          }
          
          if (attempts < maxAttempts) {
            setTimeout(checkVWorld, 100);
          } else {
            console.error('VWorld API를 찾을 수 없습니다. 사용 가능한 전역 객체들:', {
              vworld: window.vworld,
              vw: window.vw,
              ol: window.ol,
              allKeys: Object.keys(window).filter(key => key.toLowerCase().includes('vworld') || key.toLowerCase().includes('ol'))
            });
            setError('VWorld API를 초기화할 수 없습니다.');
          }
        } catch (err) {
          console.error('VWorld API 확인 중 오류:', err);
          setError(`API 확인 오류: ${err.message}`);
        }
      };
      
      checkVWorld();
    } catch (err) {
      console.error('waitForVWorldAPI 초기화 오류:', err);
      setError(`API 대기 오류: ${err.message}`);
    }
  };

  const loadOpenLayersLibrary = () => {
    try {
      console.log('OpenLayers 라이브러리 로드 시작');
      
      // 이미 로드되어 있는지 확인
      if (window.ol && window.ol.Map) {
        console.log('OpenLayers가 이미 로드되어 있음');
        setTimeout(() => {
          try {
            initializeMap();
          } catch (err) {
            console.error('기존 OpenLayers 초기화 오류:', err);
            setError(`OpenLayers 초기화 오류: ${err.message}`);
          }
        }, 100);
        return;
      }
      
      // 이미 로딩 중인지 확인
      if (document.querySelector('script[src*="openlayers"]')) {
        console.log('OpenLayers 스크립트가 이미 로딩 중');
        // 이미 로딩 중이면 잠시 후 다시 확인
        setTimeout(() => {
          if (window.ol && window.ol.Map) {
            try {
              initializeMap();
            } catch (err) {
              console.error('로딩 중인 OpenLayers 초기화 오류:', err);
              setError(`OpenLayers 초기화 오류: ${err.message}`);
            }
          }
        }, 500);
        return;
      }

      // OpenLayers CSS 로드
      try {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = window.vw.ol3.ExtUrls.vmapcss;
        document.head.appendChild(cssLink);
      } catch (err) {
        console.error('CSS 로드 오류:', err);
      }

      // OpenLayers JavaScript 로드
      const olScript = document.createElement('script');
      olScript.src = window.vw.ol3.ExtUrls.openlayers;
      olScript.async = false;
      
      olScript.onload = () => {
        try {
          console.log('OpenLayers 라이브러리 로드 완료');
          console.log('window.ol:', window.ol);
          
          // jQuery 로드 (VWorld API에서 필요할 수 있음)
          if (!window.$) {
            const jqueryScript = document.createElement('script');
            jqueryScript.src = window.vw.ol3.ExtUrls.jquery;
            jqueryScript.async = false;
            
            jqueryScript.onload = () => {
              try {
                console.log('jQuery 로드 완료');
                setTimeout(() => {
                  try {
                    initializeMap();
                  } catch (err) {
                    console.error('jQuery 로드 후 초기화 오류:', err);
                    setError(`초기화 오류: ${err.message}`);
                  }
                }, 100);
              } catch (err) {
                console.error('jQuery 로드 완료 처리 오류:', err);
                setError(`jQuery 처리 오류: ${err.message}`);
              }
            };
            
            jqueryScript.onerror = () => {
              try {
                console.log('jQuery 로드 실패, OpenLayers만으로 진행');
                setTimeout(() => {
                  try {
                    initializeMap();
                  } catch (err) {
                    console.error('jQuery 실패 후 초기화 오류:', err);
                    setError(`초기화 오류: ${err.message}`);
                  }
                }, 100);
              } catch (err) {
                console.error('jQuery 실패 처리 오류:', err);
                setError(`jQuery 실패 처리 오류: ${err.message}`);
              }
            };
            
            document.head.appendChild(jqueryScript);
          } else {
            setTimeout(() => {
              try {
                initializeMap();
              } catch (err) {
                console.error('기존 jQuery로 초기화 오류:', err);
                setError(`초기화 오류: ${err.message}`);
              }
            }, 100);
          }
        } catch (err) {
          console.error('OpenLayers 로드 완료 처리 오류:', err);
          setError(`OpenLayers 처리 오류: ${err.message}`);
        }
      };
      
      olScript.onerror = (err) => {
        console.error('OpenLayers 라이브러리 로드 실패:', err);
        setError('OpenLayers 라이브러리를 로드할 수 없습니다.');
      };
      
      document.head.appendChild(olScript);
    } catch (err) {
      console.error('loadOpenLayersLibrary 초기화 오류:', err);
      setError(`OpenLayers 라이브러리 로드 오류: ${err.message}`);
    }
  };

  const initializeMap = () => {
    // 중복 초기화 방지
    if (isInitializing || mapLoaded) {
      console.log('지도가 이미 초기화 중이거나 완료됨');
      return;
    }
    
    // 이미 지도 객체가 있는지 확인
    if (mapRef.current) {
      console.log('지도 객체가 이미 존재함');
      setMapLoaded(true);
      return;
    }
    
    setIsInitializing(true);
    
    try {
      console.log('지도 초기화 시작');
      console.log('window.vworld 존재 여부:', !!window.vworld);
      console.log('window.vworld.Map 존재 여부:', !!window.vworld?.Map);
      
      // 다양한 API 방식 확인
      let mapAPI = null;
      let mapConstructor = null;
      
      if (window.vworld && window.vworld.Map) {
        mapAPI = window.vworld;
        mapConstructor = window.vworld.Map;
        console.log('VWorld API 사용');
      } else if (window.vw && window.vw.ol3 && window.ol && window.ol.Map) {
        mapAPI = window.vw.ol3;
        mapConstructor = window.ol.Map; // OpenLayers Map 사용
        console.log('VWorld ol3 API 사용');
      } else if (window.ol && window.ol.Map) {
        mapAPI = window.ol;
        mapConstructor = window.ol.Map;
        console.log('OpenLayers API 사용');
      } else {
        console.error('사용 가능한 지도 API가 없습니다.');
        console.log('현재 상태:', {
          vworld: !!window.vworld,
          'vw.ol3': !!(window.vw && window.vw.ol3),
          ol: !!window.ol,
          'ol.Map': !!(window.ol && window.ol.Map)
        });
        setError('지도 API를 찾을 수 없습니다.');
        return;
      }
      
      // DOM 요소가 존재하는지 확인 (재시도 로직 포함)
      let mapElement = document.getElementById('vmap');
      if (!mapElement) {
        console.log('지도 컨테이너 요소를 찾을 수 없음, 잠시 후 재시도...');
        // DOM이 아직 렌더링되지 않았을 수 있으므로 잠시 후 재시도
        setTimeout(() => {
          try {
            mapElement = document.getElementById('vmap');
            if (!mapElement) {
              console.error('지도 컨테이너 요소를 여전히 찾을 수 없습니다.');
              setError('지도 컨테이너를 찾을 수 없습니다.');
              setIsInitializing(false);
              return;
            }
            console.log('지도 컨테이너 요소 발견됨, 초기화 재시도');
            initializeMap();
          } catch (err) {
            console.error('DOM 요소 확인 재시도 중 오류:', err);
            setError(`DOM 요소 확인 오류: ${err.message}`);
            setIsInitializing(false);
          }
        }, 200);
        return;
      }

      console.log('지도 컨테이너 요소 확인됨:', mapElement);
      console.log('사용할 API:', mapAPI);
      console.log('사용할 Map 생성자:', mapConstructor);

      // 지도 생성
      let map;
      
      try {
        if (mapAPI === window.vworld) {
          // VWorld API 방식
          try {
            map = new mapConstructor("vmap");
            console.log('VWorld 기본 설정으로 지도 객체 생성 완료:', map);
          } catch (err) {
            console.log('VWorld 기본 설정 실패, 상세 설정으로 재시도:', err);
            map = new mapConstructor("vmap", {
              basemapType: mapAPI.BasemapType.GRAPHIC,
              controlDensity: mapAPI.DensityType.FULL,
              interaction: mapAPI.InteractionType.ALL,
        controlsAutoArrange: true,
              homePosition: mapAPI.PositionType.API_DEFAULT
            });
            console.log('VWorld 상세 설정으로 지도 객체 생성 완료:', map);
          }
        } else if (mapAPI === window.vw.ol3) {
          // VWorld ol3 + OpenLayers 방식
          const view = new window.ol.View({
            center: [14135006.54, 4518292.14],
            zoom: 7
          });
          
          // VWorld 타일 소스 사용
          const layer = new window.ol.layer.Tile({
            source: new window.ol.source.XYZ({
              url: mapAPI.MapUrls.base + '{z}/{x}/{y}.png',
              crossOrigin: 'anonymous'
            })
          });
          
          map = new mapConstructor({
            target: 'vmap',
            layers: [layer],
            view: view
          });
          console.log('VWorld ol3 + OpenLayers로 지도 객체 생성 완료:', map);
        } else {
          // 일반 OpenLayers 방식
          const view = new window.ol.View({
            center: [14135006.54, 4518292.14],
            zoom: 7
          });
          
          const layer = new window.ol.layer.Tile({
            source: new window.ol.source.OSM()
          });
          
          map = new mapConstructor({
            target: 'vmap',
            layers: [layer],
            view: view
          });
          console.log('OpenLayers로 지도 객체 생성 완료:', map);
        }
      } catch (err) {
        console.error('지도 생성 실패:', err);
        setError(`지도를 생성할 수 없습니다: ${err.message}`);
        return;
      }
      
      // 지도 중심점 설정 (VWorld API인 경우에만)
      if (mapAPI === window.vworld && map && map.setCenterAndZoom) {
      map.setCenterAndZoom(14135006.54, 4518292.14, 7);
        console.log('VWorld 지도 중심점 설정 완료');
      }
      mapRef.current = map;
      setMapLoaded(true);
      setIsInitializing(false);
      console.log('지도 초기화 완료');

      // 클릭 이벤트 (VWorld API 또는 OpenLayers인 경우)
      if (map && map.addEventListener) {
      map.addEventListener("click", async (evt) => {
          try {
            console.log('지도 클릭 이벤트 발생:', evt);
            
            let x, y;
            if (mapAPI === window.vworld && map.getCoordinateFromPixel) {
              // VWorld API 방식
              const position = map.getCoordinateFromPixel(evt.clientX, evt.clientY);
              [x, y] = position;
            } else {
              // OpenLayers 방식
              const coordinate = evt.coordinate;
              [x, y] = coordinate;
            }

            console.log('클릭 좌표:', { x, y });

        const res = await api.get(`/land/search?x=${x}&y=${y}`);
        const data = res.data;

            if (geoLayerRef.current && map.removeLayer) {
              map.removeLayer(geoLayerRef.current);
            }

            if (mapAPI === window.vworld && mapAPI.Layer) {
              // VWorld API 방식
              const geojsonLayer = new mapAPI.Layer("GeoJSON_LAYER");
              if (map.addLayer) {
        map.addLayer(geojsonLayer);
        geoLayerRef.current = geojsonLayer;

        data.forEach((feature) => {
          const geojson = JSON.parse(feature.geom);
                  if (mapAPI.Feature) {
                    const vector = new mapAPI.Feature(geojson);
          geojsonLayer.addFeature(vector);
                  }
                });
              }
            } else if (window.ol && window.ol.layer && window.ol.source) {
              // OpenLayers 방식
              const features = data.map(feature => {
                const geojson = JSON.parse(feature.geom);
                return new window.ol.Feature({
                  geometry: new window.ol.geom.Polygon(geojson.coordinates)
                });
              });

              const vectorSource = new window.ol.source.Vector({
                features: features
              });

              const vectorLayer = new window.ol.layer.Vector({
                source: vectorSource,
                style: new window.ol.style.Style({
                  stroke: new window.ol.style.Stroke({
                    color: 'red',
                    width: 2
                  }),
                  fill: new window.ol.style.Fill({
                    color: 'rgba(255, 0, 0, 0.1)'
                  })
                })
              });

              map.addLayer(vectorLayer);
              geoLayerRef.current = vectorLayer;
            }
          } catch (err) {
            console.error('클릭 이벤트 처리 중 오류:', err);
          }
        });
      }
    } catch (err) {
      console.error('지도 초기화 중 오류:', err);
      console.error('오류 상세:', err.message);
      console.error('오류 스택:', err.stack);
      setError(`지도를 초기화할 수 없습니다: ${err.message}`);
      setIsInitializing(false);
    }
  };

  if (error) {
    return (
      <div style={{ 
        width: "100%", 
        height: "600px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        border: "1px solid #ccc",
        backgroundColor: "#f5f5f5"
      }}>
        <div style={{ textAlign: "center" }}>
          <h3>지도 로드 오류</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>새로고침</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!mapLoaded && (
        <div style={{ 
          width: "100%", 
          height: "600px", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          border: "1px solid #ccc",
          backgroundColor: "#f5f5f5"
        }}>
          <div>
            {isInitializing ? "지도를 초기화하는 중..." : "지도를 로드하는 중..."}
          </div>
        </div>
      )}
      <div 
        id="vmap" 
        style={{ 
          width: "100%", 
          height: "600px",
          opacity: mapLoaded ? 1 : 0,
          transition: "opacity 0.3s ease"
        }} 
      />
    </div>
  );
};

export default VWorldMap;
