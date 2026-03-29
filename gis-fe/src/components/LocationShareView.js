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

const Legend = styled.div`
  margin-top: 8px;
  font-size: 0.78rem;
  opacity: 0.9;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
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

const PARTICIPANT_STORAGE_KEY = 'gis-ls-participant-id';

function newUuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getOrCreateParticipantId() {
  try {
    let id = localStorage.getItem(PARTICIPANT_STORAGE_KEY);
    if (!id) {
      id = newUuid();
      localStorage.setItem(PARTICIPANT_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return newUuid();
  }
}

/**
 * 양방향 실시간 위치: 같은 방(room) 참가자 전원이 위치를 올리고, 서버에서 모두의 좌표를 받아 마커 표시.
 * - menuRoomId: 메인에서 들어올 때 App이 미리 만든 방(바로 공유 가능)
 * - watchSessionId: ?share= 로 참가하는 방(우선)
 */
const LocationShareView = ({ onBack, watchSessionId, menuRoomId, onMenuRoomLeave }) => {
  const [participantId] = useState(() => getOrCreateParticipantId());
  const [roomId, setRoomId] = useState(null);
  const [roomActive, setRoomActive] = useState(false);
  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;

  const mapRef = useRef(null);
  const markersRef = useRef({});
  const lastPosRef = useRef(null);
  const lastParticipantsRef = useRef({});

  const [geoError, setGeoError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [lastSentAt, setLastSentAt] = useState(null);
  const [lastPollAt, setLastPollAt] = useState(null);
  const [copyDone, setCopyDone] = useState(false);
  const [othersCount, setOthersCount] = useState(0);

  useEffect(() => {
    if (watchSessionId) {
      setRoomId(watchSessionId);
      setRoomActive(true);
      return;
    }
    if (menuRoomId) {
      setRoomId(menuRoomId);
      setRoomActive(true);
    }
  }, [watchSessionId, menuRoomId]);

  /* 메인 등으로 화면 이탈 시에도 서버에서 내 마커 제거 → 상대 지도에서 사라짐 */
  useEffect(() => {
    return () => {
      const rid = roomIdRef.current;
      if (rid) {
        api
          .delete(`/share/${rid}/participants/${encodeURIComponent(participantId)}`)
          .catch(() => {});
      }
    };
  }, [participantId]);

  const applyParticipantsOnMap = useCallback((participants, myPid) => {
    const kakao = window.kakao?.maps;
    if (!kakao || !mapRef.current || !participants) return;

    const map = mapRef.current;
    const markers = markersRef.current;
    const seen = new Set();
    const bounds = new kakao.LatLngBounds();
    let n = 0;

    const starSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png';
    const redSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png';
    const size = new kakao.Size(24, 35);
    const point = new kakao.Point(12, 35);

    Object.entries(participants).forEach(([pid, dto]) => {
      if (!dto || typeof dto.latitude !== 'number' || typeof dto.longitude !== 'number') return;
      seen.add(pid);
      const pos = new kakao.LatLng(dto.latitude, dto.longitude);
      bounds.extend(pos);
      n += 1;
      let m = markers[pid];
      if (!m) {
        const isMe = pid === myPid;
        const img = new kakao.MarkerImage(
          isMe ? starSrc : redSrc,
          size,
          { offset: point },
        );
        m = new kakao.Marker({ position: pos, map, image: img });
        markers[pid] = m;
      } else {
        m.setPosition(pos);
      }
    });

    Object.keys(markers).forEach((pid) => {
      if (!seen.has(pid)) {
        markers[pid].setMap(null);
        delete markers[pid];
      }
    });

    if (n >= 2) {
      map.setBounds(bounds);
    } else if (n === 1) {
      const [dto] = Object.values(participants).filter(
        (d) => d && typeof d.latitude === 'number',
      );
      if (dto) {
        map.setCenter(new kakao.LatLng(dto.latitude, dto.longitude));
      }
    }

    const otherIds = Object.keys(participants).filter((id) => id !== myPid);
    setOthersCount(otherIds.length);
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
      mapRef.current = new window.kakao.maps.Map(el, { center, level: 5 });
    };
    boot();
    return () => {
      cancelled = true;
      Object.values(markersRef.current).forEach((m) => m.setMap(null));
      markersRef.current = {};
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!roomActive || !roomId || !participantId) return undefined;
    if (!navigator.geolocation) {
      setGeoError('이 브라우저는 위치 정보를 지원하지 않습니다.');
      return undefined;
    }
    setGeoError(null);
    setApiError(null);
    lastPosRef.current = null;

    const opts = { enableHighAccuracy: true, timeout: 20000, maximumAge: 3000 };
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        lastPosRef.current = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        const merged = {
          ...lastParticipantsRef.current,
          [participantId]: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            updatedAt: Date.now(),
          },
        };
        applyParticipantsOnMap(merged, participantId);
      },
      (err) => {
        setGeoError(err.message || '위치 권한을 허용해 주세요.');
      },
      opts,
    );

    const intervalId = setInterval(async () => {
      const p = lastPosRef.current;
      if (!p) return;
      try {
        await api.post(`/share/${roomId}/position`, {
          participantId,
          latitude: p.lat,
          longitude: p.lng,
          accuracy: p.accuracy,
        });
        setLastSentAt(Date.now());
        setApiError(null);
      } catch (e) {
        if (e.response?.status === 409) {
          setApiError('참가 인원이 가득 찼습니다. 새 방을 만들어 주세요.');
        } else {
          setApiError(e.response?.data?.message || e.message || '서버 전송 실패');
        }
      }
    }, 3000);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(intervalId);
    };
  }, [roomActive, roomId, participantId, applyParticipantsOnMap]);

  useEffect(() => {
    if (!roomActive || !roomId || !participantId) return undefined;

    const poll = async () => {
      try {
        const { data } = await api.get(`/share/${roomId}/participants`);
        const list = data?.participants || {};
        lastParticipantsRef.current = list;
        applyParticipantsOnMap(list, participantId);
        setLastPollAt(Date.now());
        setApiError(null);
      } catch (e) {
        if (e.response?.status === 400) {
          setApiError('잘못된 공유 링크입니다.');
        } else {
          setApiError(e.message || '불러오기 실패');
        }
      }
    };

    poll();
    const intervalId = setInterval(poll, 2500);
    return () => clearInterval(intervalId);
  }, [roomActive, roomId, participantId, applyParticipantsOnMap]);

  const startShare = () => {
    setGeoError(null);
    setApiError(null);
    setRoomId(newUuid());
    setRoomActive(true);
    lastPosRef.current = null;
  };

  const stopShare = () => {
    const rid = roomIdRef.current;
    if (rid) {
      api
        .delete(`/share/${rid}/participants/${encodeURIComponent(participantId)}`)
        .catch(() => {});
    }
    onMenuRoomLeave?.();
    setRoomActive(false);
    setRoomId(null);
    lastPosRef.current = null;
    setLastSentAt(null);
    setLastPollAt(null);
    setOthersCount(0);
    lastParticipantsRef.current = {};
    Object.values(markersRef.current).forEach((m) => m.setMap(null));
    markersRef.current = {};
  };

  const copyLink = async () => {
    if (!roomId) return;
    const url = `${window.location.origin}${window.location.pathname}?share=${encodeURIComponent(roomId)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    } catch {
      window.prompt('아래 링크를 복사하세요', url);
    }
  };

  const secure = typeof window !== 'undefined' && window.isSecureContext;
  const joinedByLink = Boolean(watchSessionId && !menuRoomId);

  return (
    <Wrap>
      <Toolbar>
        <Title>실시간 위치 공유</Title>
        {roomActive && menuRoomId && !watchSessionId && (
          <Hint>새 방이 열렸습니다. 아래에서 링크 복사로 상대를 초대할 수 있습니다.</Hint>
        )}
        {joinedByLink && roomActive && (
          <Hint>링크로 참여 중입니다. 위치 권한을 허용하면 상대와 서로 볼 수 있습니다.</Hint>
        )}
        {!secure && <ErrorText>위치 공유는 HTTPS(또는 localhost)에서만 동작합니다.</ErrorText>}
        {geoError && <ErrorText>{geoError}</ErrorText>}
        {apiError && <ErrorText>{apiError}</ErrorText>}

        {!roomActive && (
          <ToolbarRow>
            <Btn type="button" onClick={startShare} disabled={!secure}>
              공유 시작 (방 만들기)
            </Btn>
          </ToolbarRow>
        )}

        {roomActive && roomId && (
          <ToolbarRow>
            <Btn type="button" onClick={copyLink}>
              {copyDone ? '복사됨' : '링크 복사'}
            </Btn>
            <BtnGhost type="button" onClick={stopShare}>
              나가기
            </BtnGhost>
            {(lastSentAt || lastPollAt) && (
              <Hint style={{ marginTop: 0, width: '100%' }}>
                {lastSentAt && `전송: ${new Date(lastSentAt).toLocaleTimeString('ko-KR')}`}
                {lastSentAt && lastPollAt ? ' · ' : ''}
                {lastPollAt && `동기화: ${new Date(lastPollAt).toLocaleTimeString('ko-KR')}`}
                {` · 상대 ${othersCount}명`}
              </Hint>
            )}
          </ToolbarRow>
        )}

        {roomActive && (
          <Legend>
            <span>⭐ 내 위치</span>
            <span>📍 빨간 핀: 다른 참가자</span>
          </Legend>
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
