import { useId } from 'react';


interface Props {
labelA: string;
labelB: string;
valueA: number;
valueB: number;
onChangeA: (n: number) => void;
onChangeB: (n: number) => void;
}


export default function ScoreInput({ labelA, labelB, valueA, valueB, onChangeA, onChangeB }: Props) {
const idA = useId();
const idB = useId();
return (
<div className="grid grid-cols-2 gap-3 items-end">
<div>
<label htmlFor={idA} className="label">{labelA}</label>
<input id={idA} type="number" min={0} className="input w-full" value={valueA}
onChange={e=>onChangeA(parseInt(e.target.value||'0'))} />
</div>
<div>
<label htmlFor={idB} className="label">{labelB}</label>
<input id={idB} type="number" min={0} className="input w-full" value={valueB}
onChange={e=>onChangeB(parseInt(e.target.value||'0'))} />
</div>
</div>
);
}