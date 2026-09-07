'use client';
import type {AriaAttributes} from 'react';
type Props=AriaAttributes & {value:number[];min:number;max:number;step:number;onValueChange:(value:number[])=>void;className?:string};
export function Slider({value,onValueChange,className,...props}:Props){return <input {...props} className={className} type="range" value={value[0]} onChange={e=>onValueChange([e.currentTarget.valueAsNumber])}/>}
