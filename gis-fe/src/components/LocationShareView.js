import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import api from '../api/axiosInstance';

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1a1a2e;
`;

const Toolbar = styled.div`
  flex-shrink: 0;
  padding: 12px 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
`;

const ToolbarRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-top: ${(p) => (p.$tight ? '0' : '8px')};
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
`;

const Btn = styled.button`
  padding: 10px 16px;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.95);
  color: #4a3f8c;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  &:hover {
    background: white;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const BtnGhost = styled(Btn)`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.6);
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const Hint = styled.p`
  margin: 6px 0 0;
  font-size: 0.82rem;
  opacity: 0.92;
  line-height: 1.4;
`;

const ErrorText = styled.p`
  margin: 8px 0 0;
  font-size: 0.85rem;
  color: #ffdede;
`;

const MapArea = styled.div`
  flex: 1;
  min-height: 0;
  position: relative;
`;

const MapDiv = styled.div`
  width: 100%;
  height: 100%;
`;

const BackBtn = styled.button`
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 1000;
  padding: 12px 18px;
  font-size: 1rem;
  font-weight: 700;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  &:hover {
    filter: brightness(1.05);
  }
`;

function newSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 카카오 지도 + 브라우저 Geolocation.
 * - 공유하기: 내 위치를 주기적으로 서버에 전송하고, 링크로 다른 사람이 같은 지도에서 마커를 봅니다.
 * - 보기: watchSessionId가 있으면 폴링으로 상대 마커만 표시합니다.
 */
const LocationShareView = ({ onBack, watchSessionId }) => {
  const isWatcher = Boolean(watchSessionId);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const lastPosRef = useRef(null);

  const [sharing, setSharing] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [lastSentAt, setLastSentAt] = useState(null);
  const [lastRemoteAt, setLastRemoteAt] = useState(null);
  const [copyDone, setCopyDone] = useState(false);
  const [watchGone, setWatchGone] = useState(false);

  const moveMarker = useCallback((lat, lng) => {
    if (!window.kakao?.maps || !mapRef.current || !markerRef.current) return;
    const pos = new window.kakao.maps.LatLng(lat, lng);
    markerRef.current.setPosition(pos);
    mapRef.current.setCenter(pos);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const boot = () => {
      if (cancelled) return;
      if (!window.kakao?.maps) {
        setTimeout(boot, 100);
        return;
      }
      const el = document.getElementById('kakao-map-location-share');
      if (!el) {
        setTimeout(boot, 50);
        return;
      }
      const center = new window.kakao.maps.LatLng(37.5665, 126.978);
      const map = new window.kakao.maps.Map(el, { center, level: 5 });
      const marker = new window.kakao.maps.Marker({ position: center, map });
      mapRef.current = map;
      markerRef.current = marker;
    };
    boot();
    return () => {
      cancelled = true;
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (isWatcher || !sharing || !sessionId) return undefined;
    if (!navigator.geolocation) {
      setGeoError('이 브라우저는 위치 정보를 지원하지 않습니다.');
      return undefined;
    }
    setGeoError(null);
    setApiError(null);
    const opts = { enableHighAccuracy: true, timeout: 20000, maximumAge: 3000 };
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        lastPosRef.current = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        moveMarker(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setGeoError(err.message || '위치 권한을 허용해 주세요.');
      },
      opts
    );
    const intervalId = setInterval(async () => {
      const p = lastPosRef.current;
      if (!p) return;
      try {
        await api.post(`/share/${sessionId}`, {
          latitude: p.lat,
          longitude: p.lng,
          accuracy: p.accuracy,
        });
        setLastSentAt(Date.now());
        setApiError(null);
      } catch (e) {
        setApiError(e.response?.data?.message || e.message || '서버 전송 실패');
      }
    }, 3000);
    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(intervalId);
    };
  }, [isWatcher, sharing, sessionId, moveMarker]);

  useEffect(() => {
    if (!isWatcher || !watchSessionId) return undefined;
    setWatchGone(false);
    setApiError(null);
    const poll = async () => {
      try {
        const { data } = await api.get(`/share/${watchSessionId}`);
        moveMarker(data.latitude, data.longitude);
        setLastRemoteAt(data.updatedAt || null);
        setWatchGone(false);
      } catch (e) {
        if (e.response?.status === 404) {
          setWatchGone(true);
        } else if (e.response?.status === 400) {
          setApiError('잘못된 공유 링크입니다.');
        } else {
          setApiError(e.message || '불러오기 실패');
        }
      }
    };
    poll();
    const intervalId = setInterval(poll, 2500);
    return () => clearInterval(intervalId);
  }, [isWatcher, watchSessionId, moveMarker]);

  const startShare = () => {
    setGeoError(null);
    setApiError(null);
    setSessionId(newSessionId());
    setSharing(true);
    lastPosRef.current = null;
  };

  const stopShare = () => {
    setSharing(false);
    setSessionId(null);
    lastPosRef.current = null;
    setLastSentAt(null);
  };

  const copyLink = async () => {
    if (!sessionId) return;
    const url = `${window.location.origin}${window.location.pathname}?share=${encodeURIComponent(sessionId)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    } catch {
      window.prompt('아래 링크를 복사하세요', url);
    }
  };

  const secure = typeof window !== 'undefined' && window.isSecureContext;

  return (
    <Wrap>
      <Toolbar>
        <Title>{isWatcher ? '실시간 위치 (보기)' : '실시간 위치 공유'}</Title>
        {!isWatcher && (
          <Hint>
            공유 시작 후 링크를 주면 상대방이 카카오 지도에서 내 위치를 볼 수 있습니다. 세션은 약 30분 후 만료됩니다.
          </Hint>
        )}
        {isWatcher && (
          <Hint>상대가 공유 중일 때만 마커가 갱신됩니다. HTTPS 환경에서 사용하세요.</Hint>
        )}
        {!secure && <ErrorText>위치 공유는 HTTPS(또는 localhost)에서만 동작합니다.</ErrorText>}
        {geoError && <ErrorText>{geoError}</ErrorText>}
        {apiError && <ErrorText>{apiError}</ErrorText>}
        {watchGone && <ErrorText>공유가 끊겼거나 만료되었습니다.</ErrorText>}

        {!isWatcher && (
          <ToolbarRow>
            {!sharing && (
              <Btn type="button" onClick={startShare} disabled={!secure}>
                공유 시작
              </Btn>
            )}
            {sharing && sessionId && (
              <>
                <Btn type="button" onClick={copyLink}>
                  {copyDone ? '복사됨' : '링크 복사'}
                </Btn>
                <BtnGhost type="button" onClick={stopShare}>
                  공유 중지
                </BtnGhost>
                {lastSentAt && (
                  <Hint style={{ marginTop: 0, width: '100%' }}>
                    마지막 전송: {new Date(lastSentAt).toLocaleTimeString('ko-KR')}
                  </Hint>
                )}
              </>
            )}
          </ToolbarRow>
        )}
        {isWatcher && lastRemoteAt && (
          <Hint style={{ marginTop: 8 }}>
            마지막 갱신: {new Date(lastRemoteAt).toLocaleTimeString('ko-KR')}
          </Hint>
        )}
      </Toolbar>
      <MapArea>
        <BackBtn type="button" onClick={onBack} aria-label="메인으로">
          ← 메인
        </BackBtn>
        <MapDiv id="kakao-map-location-share" />
      </MapArea>
    </Wrap>
  );
};

export default LocationShareView;
