import React from 'react';
export default function UiIcon({kind='next'}) {
 const paths={private:'M5 5h14v12H9l-4 4V5Zm4 4h6m-6 4h4',ticket:'M4 5h16v5a2 2 0 0 0 0 4v5H4v-5a2 2 0 0 0 0-4V5Zm11 0v3m0 3v2m0 3v3',vehicle:'m4 10 2-5h12l2 5M3 10h18v8H3v-8Zm3 8v2m12-2v2M6 14h2m8 0h2',guide:'M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-6 8v-2a6 6 0 0 1 12 0v2m3-11h3m-3 4h3m-3 4h3',previous:'M15 6 9 12l6 6',next:'m9 6 6 6-6 6',arrow:'M5 12h14m-6-6 6 6-6 6',external:'M7 17 17 7M7 7h10v10',down:'m6 9 6 6 6-6'};
 return <svg className="ui-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[kind]||paths.next}/></svg>;
}
