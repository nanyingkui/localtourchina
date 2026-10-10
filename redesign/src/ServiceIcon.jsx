import React from 'react';
const paths={
 package:<><rect x="6" y="9" width="20" height="19" rx="3"/><path d="M12 9V5h8v4M10 9v19M22 9v19M12 29v1m8-1v1"/><path d="m13 17 2 2 4-4"/></>,
 itinerary:<><path d="M8 8h16M8 16h9M8 24h6"/><circle cx="5" cy="8" r="1"/><circle cx="5" cy="16" r="1"/><circle cx="5" cy="24" r="1"/><path d="M24 29s-6-6-6-10a6 6 0 1 1 12 0c0 4-6 10-6 10Z"/><circle cx="24" cy="19" r="2"/></>,
 information:<><path d="M16 8c-4-3-9-3-13-1v20c4-2 9-2 13 1 4-3 9-3 13-1V7c-4-2-9-2-13 1Zm0 0v20M7 12h5m-5 5h5m8-5h5m-5 5h5"/></>,
 ticket:<><path d="M5 8h22v6a3 3 0 0 0 0 6v5H5v-5a3 3 0 0 0 0-6V8Z"/><path d="M21 11v2m0 4v2m0 3v1" stroke="var(--icon-accent,#d97400)"/></>,
 vehicle:<><path d="m7 12 3-6h12l3 6M5 13h22v11H5V13Zm3 11v3m16-3v3"/><path d="M9 18h3m8 0h3M10 9h12" stroke="var(--icon-accent,#d97400)"/></>,
 guide:<><circle cx="13" cy="10" r="4"/><path d="M5 26v-3a8 8 0 0 1 16 0v3M24 26V5"/><path d="m24 5 6 3-6 3" stroke="var(--icon-accent,#d97400)"/></>,
 day:<><path d="m3 26 8-12 6 8 4-6 8 10H3Z"/><circle cx="23" cy="8" r="4" stroke="var(--icon-accent,#d97400)"/><path d="m8 18 3 2 2-2"/></>,
 custom:<><path d="M6 7h20M6 16h20M6 25h20"/><circle cx="12" cy="7" r="3" fill="white" stroke="var(--icon-accent,#d97400)"/><circle cx="22" cy="16" r="3" fill="white"/><circle cx="10" cy="25" r="3" fill="white" stroke="var(--icon-accent,#d97400)"/></>,
 support:<><path d="M5 16v-2a11 11 0 0 1 22 0v6a6 6 0 0 1-6 6h-3"/><rect x="3" y="14" width="5" height="9" rx="2"/><rect x="24" y="14" width="5" height="9" rx="2"/><path d="M13 14h6m-6 4h4" stroke="var(--icon-accent,#d97400)"/><path d="M16 26h3" stroke="var(--icon-accent,#d97400)"/></>
};
export default function ServiceIcon({kind}){return <span className="service-symbol"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[kind]}</svg></span>;}
