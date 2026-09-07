'use client';
import {useState,useEffect} from 'react';
import {PaperTexture} from '@paper-design/shaders-react';
export function BlogPaper() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? (
    <div className="blog-paper" aria-hidden="true">
      <PaperTexture
        colorBack="#f6f3e9"
        colorFront="#c5ccd3"
        contrast={0.36}
        roughness={1}
        fiber={0.27}
        fiberSize={0.27}
        crumples={0.51}
        crumpleSize={0.33}
        folds={0.57}
        foldCount={8}
        drops={0.13}
        fade={0}
        seed={546.8}
        scale={0.5}
        fit="cover"
        speed={0}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  ) : null;
}
