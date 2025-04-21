// import React from 'react';
// import { useState, useEffect, useRef } from 'react';
import { hslToRgb, adjustLightness, adjustHue,
	 init, drawTool, drawState, uiFunctions } from './museopaint';

export
function ColorButtons({set, colors, selectedIndex}) {
    let i = 0;
    return colors.map(c => {
	const [r, g, b] = c;
	const selected = i == selectedIndex;
	++i;
	return (
	    <input type="radio"
		   name="color"
		   key={`${r}${g}${b}`}
		   className="color-button"
		   defaultChecked={selected}
		   style={{backgroundColor: `rgb(${r*255}, ${g*255}, ${b*255})`}}
		   onClick={(ev) => set([r, g, b])} />
	);
    });
}

export
function GrayColorButtons({count, set, selectedIndex}) {
    const colors = [];
    for (let i = 0; i < count; ++i) {
	const v = i / (count-1);
	colors.push([v, v, v]);
    }
    return <ColorButtons set={set}
			 colors={colors}
			 selectedIndex={selectedIndex} />;
}
		      
export
function SkinColorButtons({count, set}) {
    const colors = [];

    const darkColor = [15/360.0, 0.30, 0.2];
    const midColor = [15/360.0, 0.40, 0.5];
    const lightColor = [25/360.0, 0.73, 0.90];
    console.log(count, typeof(count));
    if (count === 2) {
	colors.push(hslToRgb(...darkColor));
	colors.push(hslToRgb(...lightColor));
    } else if (count === 3) {
	colors.push(hslToRgb(...darkColor));
	colors.push(hslToRgb(...midColor));
	colors.push(hslToRgb(...lightColor));
    } else {
	const c = Math.floor((count - 3) / 2);
	for (let i = 0; i < c + 2; i++) {
            const ratio = i / ((c + 2) - 1);
            const h = darkColor[0] * (1-ratio) + midColor[0] * ratio;
            const s = darkColor[1] * (1-ratio) + midColor[1] * ratio;
            const l = darkColor[2] * (1-ratio) + midColor[2] * ratio;
	    colors.push(hslToRgb(h, s, l));
	}
	for (let i = 1; i < c + 1; i++) {
            const ratio = i / ((c + 1) - 1);
            const h = midColor[0] * (1-ratio) + lightColor[0] * ratio;
            const s = midColor[1] * (1-ratio) + lightColor[1] * ratio;
            const l = midColor[2] * (1-ratio) + lightColor[2] * ratio;
	    colors.push(hslToRgb(h, s, l));
	}
    }

    return <ColorButtons set={set}
			 colors={colors}/>;    
}

export
function ColorColorButtons({hueCount, lightnessCount, set}) {
    const colors = [];
    const lightnessIncrement = -0.16;
    const hueIncrement = (360-30) / hueCount;
        
    for (let lightnessIdx = 0; lightnessIdx < lightnessCount; ++lightnessIdx) {
	let linearColor = [1, 0, 0];
	linearColor = adjustLightness(linearColor, -0.20*lightnessIdx);
	for (let hueIdx = 0; hueIdx < hueCount; ++hueIdx) {
	    colors.push(linearColor);
	    linearColor =  adjustHue(linearColor, hueIncrement);
	}
    }

    return <ColorButtons set={set}
			 colors={colors}/>;    
}


