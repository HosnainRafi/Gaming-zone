import { useState, useEffect } from "react";

export function useThreeScene() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const w = window.innerWidth;
    const mobile = w < 768;
    setIsMobile(mobile);

    // Respect reduced-motion: skip WebGL scenes entirely
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      setShouldRender(false);
      return;
    }

    if (mobile) {
      try {
        const canvas = document.createElement("canvas");
        const gl =
          canvas.getContext("webgl2") || canvas.getContext("webgl");
        if (gl) {
          const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
          const renderer = debugInfo
            ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
            : "";
          const isLowEnd =
            /mali-t|adreno 3|powervr sgx|apple gpu/i.test(renderer) &&
            !/adreno 6|mali-g|apple gpu (m1|m2|m3|m4)/i.test(renderer);
          setShouldRender(!isLowEnd);
        } else {
          setShouldRender(false);
        }
      } catch {
        setShouldRender(false);
      }
    } else {
      try {
        const canvas = document.createElement("canvas");
        setShouldRender(
          !!canvas.getContext("webgl2") || !!canvas.getContext("webgl")
        );
      } catch {
        setShouldRender(false);
      }
    }
  }, []);

  return { shouldRender, isMobile };
}

export default useThreeScene;
