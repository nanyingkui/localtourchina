import React from 'react';
export default function UiIcon({kind='next'}) {
 const paths={previous:'M15 6 9 12l6 6',next:'m9 6 6 6-6 6',arrow:'M5 12h14m-6-6 6 6-6 6',external:'M7 17 17 7M7 7h10v10',down:'m6 9 6 6 6-6'};
 return <svg className="ui-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[kind]||paths.next}/></svg>;
}
