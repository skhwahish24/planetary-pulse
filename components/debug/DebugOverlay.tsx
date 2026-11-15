'use client';

import { useEffect, useState } from 'react';
import { useExplorerStore } from '@/store/useExplorerStore';

export function DebugOverlay() {
  const activeLayer = useExplorerStore((s) => s.activeLayer);
  const quality = useExplorerStore((s) => s.quality);
  const [fps, setFps] = useState(60);
  const [wireframe, setWireframe] = useState(false);
  const [uvTest, setUvTest] = useState(false);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const loop = (now: number) => {
      frameCount++;
      if (now - lastTime >= 500) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const toggleWireframe = () => {
    const next = !wireframe;
    setWireframe(next);
    window.dispatchEvent(new CustomEvent('globe:debugWireframe', { detail: { wireframe: next } }));
  };

  const toggleUv = () => {
    const next = !uvTest;
    setUvTest(next);
    window.dispatchEvent(new CustomEvent('globe:debugUv', { detail: { uvTest: next } }));
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        backgroundColor: 'var(--surface-overlay)',
        border: '1px solid var(--border-active)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.625rem 0.75rem',
        fontSize: '0.6875rem',
        fontFamily: 'monospace',
        color: 'var(--text-secondary)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
        minWidth: '200px',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          color: 'var(--accent-primary)',
          fontWeight: 700,
          borderBottom: '1px solid var(--border-hairline)',
          paddingBottom: '0.25rem',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>GL-DIAGNOSTIC</span>
        <span>{fps} FPS</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Active Layer:</span>
        <span style={{ color: 'var(--text-primary)' }}>{activeLayer}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Mesh Quality:</span>
        <span style={{ color: 'var(--text-primary)' }}>{quality}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Tex Resolution:</span>
        <span style={{ color: 'var(--text-primary)' }}>360x181 HalfFloat</span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginTop: '0.25rem',
          paddingTop: '0.375rem',
          borderTop: '1px solid var(--border-hairline)',
        }}
      >
        <button
          type="button"
          onClick={toggleWireframe}
          style={{
            flex: 1,
            padding: '3px 6px',
            fontSize: '0.625rem',
            fontFamily: 'monospace',
            backgroundColor: wireframe ? 'var(--accent-primary)' : 'var(--surface-sunken)',
            color: wireframe ? 'var(--surface-sunken)' : 'var(--text-secondary)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
        >
          WIREFRAME
        </button>

        <button
          type="button"
          onClick={toggleUv}
          style={{
            flex: 1,
            padding: '3px 6px',
            fontSize: '0.625rem',
            fontFamily: 'monospace',
            backgroundColor: uvTest ? 'var(--accent-primary)' : 'var(--surface-sunken)',
            color: uvTest ? 'var(--surface-sunken)' : 'var(--text-secondary)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
        >
          UV TEST
        </button>
      </div>
    </div>
  );
}
