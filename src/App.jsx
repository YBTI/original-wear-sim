import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Transformer, Group } from 'react-konva';
import useImage from 'use-image';

// --- 設定値 ---
const STAGE_WIDTH = 500;
const STAGE_HEIGHT = 600;

// カテゴリー定義
const CATEGORIES = [
  { id: 'all', label: 'すべて' },
  { id: 'text', label: '英数字' },
  { id: 'illustration', label: 'イラスト' },
  { id: 'basketball', label: 'バスケット' },
];

// ★修正箇所：IDを重複しない連番に書き換えました
const REGISTERED_STICKERS = [
  // --- 英数字 ---
  { id: 1, url: "/stickers/text_00.png", name: "00", category: 'text' },
  { id: 2, url: "/stickers/text_01.png", name: "01", category: 'text' },
  { id: 3, url: "/stickers/text_02.png", name: "02", category: 'text' },
  { id: 4, url: "/stickers/text_03.png", name: "03", category: 'text' },
  { id: 5, url: "/stickers/text_04.png", name: "04", category: 'text' },
  { id: 6, url: "/stickers/text_05.png", name: "05", category: 'text' },
  { id: 7, url: "/stickers/text_06.png", name: "06", category: 'text' },
  { id: 8, url: "/stickers/text_07.png", name: "07", category: 'text' },
  { id: 9, url: "/stickers/text_08.png", name: "08", category: 'text' },
  { id: 10, url: "/stickers/text_09.png", name: "09", category: 'text' },
  
  // --- イラスト ---
  { id: 11, url: "/stickers/rz_01.png", name: "Star01", category: 'illustration' },
  { id: 12, url: "/stickers/rz_02.png", name: "Star02", category: 'illustration' },
  { id: 13, url: "/stickers/rz_03.png", name: "Star03", category: 'illustration' },
  { id: 14, url: "/stickers/rz_04.png", name: "Star04", category: 'illustration' },
  { id: 15, url: "/stickers/rz_05.png", name: "Star05", category: 'illustration' },
  
  // --- バスケット ---
  { id: 16, url: "/stickers/basket_ball_01.png", name: "Ball01", category: 'basketball' },
  { id: 17, url: "/stickers/basket_ball_02.png", name: "Ball02", category: 'basketball' },
  { id: 18, url: "/stickers/basket_ball_03.png", name: "Ball03", category: 'basketball' },
  { id: 19, url: "/stickers/basket_ball_04.png", name: "Ball04", category: 'basketball' },
];

// 服のカラーパレット
const FABRIC_COLORS = [
  { name: "ホワイト", hex: "#ffffff", opacity: 0 },
  { name: "グレー",   hex: "#808080", opacity: 0.5 },
  { name: "ベージュ", hex: "#dccbba", opacity: 0.6 },
  { name: "ネイビー", hex: "#1d2951", opacity: 0.7 },
  { name: "ブラック", hex: "#222222", opacity: 0.85 },
];

// ベース服の画像設定
const WEAR_CONFIG = {
  hoodie: {
    front: "/wear/hoodie_front.png", 
    back: "/wear/hoodie_back.png"
  },
  trainer: {
    front: "/wear/trainer_front.png",
    back: "/wear/trainer_back.png"
  }
};

// --- コンポーネント ---
const UrlImage = ({ src, ...props }) => {
  const [image] = useImage(src);
  return <KonvaImage image={image} {...props} />;
};

const StickerItem = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <UrlImage
        src={shapeProps.src}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: scaleX,
            scaleY: scaleY,
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
};

const App = () => {
  const [wearType, setWearType] = useState('hoodie');
  const [viewSide, setViewSide] = useState('front');
  const [selectedColor, setSelectedColor] = useState(FABRIC_COLORS[0]);
  const [currentCategory, setCurrentCategory] = useState('all');
  
  const [stickers, setStickers] = useState([]);
  const [selectedId, selectSticker] = useState(null);

  // 選択解除
  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) selectSticker(null);
  };

  // ステッカー追加
  const addSticker = (stickerUrl) => {
    const newSticker = {
      src: stickerUrl,
      x: STAGE_WIDTH / 2 - 50,
      y: STAGE_HEIGHT / 2 - 50,
      width: 100,
      height: 100,
      id: 'sticker-' + Date.now() + Math.random(), // 追加時のIDも重複しないように念のため乱数追加
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      side: viewSide, 
      wearType: wearType 
    };
    setStickers([...stickers, newSticker]);
  };

  // ステッカー削除
  const deleteSelectedSticker = () => {
    if (!selectedId) return;
    const newStickers = stickers.filter(s => s.id !== selectedId);
    setStickers(newStickers);
    selectSticker(null);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        deleteSelectedSticker();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, stickers]);

  const filteredPalette = currentCategory === 'all'
    ? REGISTERED_STICKERS
    : REGISTERED_STICKERS.filter(s => s.category === currentCategory);

  const currentCanvasStickers = stickers.filter(
    s => s.side === viewSide && s.wearType === wearType
  );

  return (
    <div className="app-container">
      <style>{`
        .app-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          background: #f5f5f5;
          min-height: 100vh;
          font-family: sans-serif;
        }
        .app-title {
          margin-bottom: 20px;
          color: #333;
          font-size: 24px;
        }
        .main-layout {
          display: flex;
          gap: 20px;
          justify-content: center;
          align-items: flex-start;
          flex-direction: row;
        }
        .control-panel {
          width: 340px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .canvas-area {
          border: 1px solid #ccc;
          background: white;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        @media (max-width: 768px) {
          .main-layout {
            flex-direction: column-reverse;
            align-items: center;
            width: 100%;
          }
          .control-panel {
            width: 100%;
            max-width: 500px;
          }
          .canvas-area {
            max-width: 100%;
            overflow: hidden;
          }
        }
      `}</style>

      <h1 className="app-title">オリジナルウェアシミュレータ</h1>

      <div className="main-layout">
        
        {/* コントロールパネル */}
        <div className="control-panel">
          
          {/* ベース設定 */}
          <div style={{ background: 'white', padding: 15, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>1. ベース設定</h3>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <button onClick={() => setWearType('hoodie')} style={{ flex: 1, padding: 8, background: wearType === 'hoodie' ? '#333' : '#eee', color: wearType === 'hoodie' ? '#fff' : '#000', borderRadius: 4, border: 'none' }}>パーカー</button>
              <button onClick={() => setWearType('trainer')} style={{ flex: 1, padding: 8, background: wearType === 'trainer' ? '#333' : '#eee', color: wearType === 'trainer' ? '#fff' : '#000', borderRadius: 4, border: 'none' }}>トレーナー</button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
              <button onClick={() => { setViewSide('front'); selectSticker(null); }} style={{ flex: 1, padding: 8, background: viewSide === 'front' ? '#007bff' : '#eee', color: viewSide === 'front' ? '#fff' : '#000', borderRadius: 4, border: 'none' }}>前</button>
              <button onClick={() => { setViewSide('back'); selectSticker(null); }} style={{ flex: 1, padding: 8, background: viewSide === 'back' ? '#007bff' : '#eee', color: viewSide === 'back' ? '#fff' : '#000', borderRadius: 4, border: 'none' }}>後</button>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {FABRIC_COLORS.map((color) => (
                <div key={color.name} onClick={() => setSelectedColor(color)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', width: '50px' }}>
                  <div style={{ width: 30, height: 30, background: color.hex, borderRadius: '50%', border: selectedColor.name === color.name ? '3px solid #007bff' : '1px solid #ddd', marginBottom: 5 }} />
                  <span style={{ fontSize: '10px' }}>{color.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ステッカー設定 */}
          <div style={{ background: 'white', padding: 15, borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>2. ステッカー配置</h3>
            
            <div style={{ marginBottom: 15, borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                <button 
                  onClick={deleteSelectedSticker}
                  disabled={!selectedId}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: selectedId ? '#ff4d4f' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: selectedId ? 'pointer' : 'not-allowed',
                    fontWeight: 'bold'
                  }}
                >
                  {selectedId ? '🗑 選択したステッカーを削除' : 'ステッカーを選択してください'}
                </button>
            </div>

            <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCurrentCategory(cat.id)}
                  style={{
                    padding: '5px 10px',
                    fontSize: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '15px',
                    background: currentCategory === cat.id ? '#007bff' : 'white',
                    color: currentCategory === cat.id ? 'white' : '#333',
                    cursor: 'pointer'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, maxHeight: '300px', overflowY: 'auto' }}>
              {filteredPalette.map((s) => (
                <div key={s.id} onClick={() => addSticker(s.url)} style={{ cursor: 'pointer', border: '1px solid #eee', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60px' }}>
                  <img src={s.url} alt={s.name} style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }} />
                </div>
              ))}
            </div>
            {filteredPalette.length === 0 && <p style={{fontSize: '12px', color: '#999', textAlign: 'center'}}>該当するステッカーはありません</p>}
          </div>
        </div>

        {/* キャンバスエリア */}
        <div className="canvas-area">
          <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT} onMouseDown={checkDeselect} onTouchStart={checkDeselect}>
            <Layer>
              <Group>
                <UrlImage src={WEAR_CONFIG[wearType][viewSide]} x={0} y={0} width={STAGE_WIDTH} height={STAGE_HEIGHT} />
                <Rect x={0} y={0} width={STAGE_WIDTH} height={STAGE_HEIGHT} fill={selectedColor.hex} opacity={selectedColor.opacity} globalCompositeOperation="source-atop" listening={false} />
              </Group>
              {currentCanvasStickers.map((sticker, i) => {
                const realIndex = stickers.findIndex(s => s.id === sticker.id);
                return (
                  <StickerItem
                    key={sticker.id}
                    shapeProps={sticker}
                    isSelected={sticker.id === selectedId}
                    onSelect={() => selectSticker(sticker.id)}
                    onChange={(newAttrs) => {
                      const newStickers = [...stickers];
                      newStickers[realIndex] = newAttrs;
                      setStickers(newStickers);
                    }}
                  />
                );
              })}
            </Layer>
          </Stage>
        </div>

      </div>
    </div>
  );
};

export default App;