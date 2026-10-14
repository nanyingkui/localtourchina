import {createWeatherProxy} from './proxy.mjs';
// Deploy with gateway JWT verification enabled. Keep the key only in Edge Function secrets.
Deno.serve(createWeatherProxy({getKey:()=>Deno.env.get('VISUAL_CROSSING_API_KEY')}));
