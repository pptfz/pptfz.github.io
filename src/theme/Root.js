// import React, { useEffect } from 'react';

// export default function Root({ children }) {
//   useEffect(() => {
//     const script = document.createElement('script');
//     script.src = 'https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/autoload.js';
//     script.async = true;
//     document.body.appendChild(script);

//     return () => {
//       document.body.removeChild(script);
//     };
//   }, []);

//   return <>{children}</>;
// }

import React, { useEffect } from 'react';

export default function Root({ children }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/autoload.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      {children}

      {/* 右下角的 GIF 图片 */}
      <div className="gifImageBottom">
        <img 
          src="https://raw.githubusercontent.com/pptfz/picgo-images/master/img/dance-2straps.gif" 
          alt="Right Bottom Gif" 
          className="gifImage"
        />
      </div>
      {/* 右上角 GIF 图片 */}
      <div className="gifImageTop"></div>
        <img 
          src="https://raw.githubusercontent.com/pptfz/picgo-images/master/img/sing-dance-rap-basketball-transparent.gif" 
          className="gifImageTop" 
          alt="Right Top GIF" 
        />
      </div>
  );
}
