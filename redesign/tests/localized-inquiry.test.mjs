import test from 'node:test';
import assert from 'node:assert/strict';
import {initialDraft,inquiryText} from '../src/consultation.mjs';
test('Chinese and English inquiry text preserve selections and clearly identify preview status',()=>{const draft={...initialDraft('single'),services:['ticket','vehicle'],contact:'preview-test',dateMode:'month',month:'2027-03',people:'4'};const zh=inquiryText(draft,'PREVIEW-TEST','zh'),en=inquiryText(draft,'PREVIEW-TEST','en');assert.match(zh,/景区门票 \+ 专车与机场接送/);assert.match(zh,/2027-03/);assert.match(zh,/尚未确认预订/);assert.doesNotMatch(zh,/[가-힣]/);assert.match(en,/Attraction tickets \+ Vehicles and airport transfers/);assert.match(en,/not a confirmed booking/);assert.doesNotMatch(en,/[가-힣]/);assert.match(en,/PREVIEW-TEST/);});
