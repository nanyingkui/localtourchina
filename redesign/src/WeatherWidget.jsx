import React,{useEffect,useRef} from 'react';
import {mountWeatherWidget} from '../public/assets/weather-widget.mjs';
import '../public/assets/weather-widget.css';
export default function WeatherWidget({lang='ko'}){const host=useRef(null);useEffect(()=>mountWeatherWidget(host.current,{lang,compact:true}),[lang]);return <section className="home-weather" aria-label={lang==='zh'?'张家界天气':lang==='en'?'Zhangjiajie weather':'장가계 날씨'}><div ref={host}/></section>}
