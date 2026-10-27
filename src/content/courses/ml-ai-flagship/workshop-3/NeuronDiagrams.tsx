import { useId, useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

const NEURON_COLOURS = ['#3b82f6', '#f97316', '#22c55e']

const relu = (z: number) => Math.max(z, 0)

function scale(value: number, [d0, d1]: [number, number], [r0, r1]: [number, number]) {
  return r0 + ((value - d0) / (d1 - d0)) * (r1 - r0)
}

function useSvgId() {
  return useId().replace(/[^a-zA-Z0-9]/g, '')
}

function Figure({ children }: { children: ReactNode }) {
  return <div className="not-prose my-6 rounded-xl border p-4 text-foreground">{children}</div>
}

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  colour?: string
  onChange: (value: number) => void
}

function Slider({ label, value, min, max, step, colour, onChange }: SliderProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="font-mono">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ accentColor: colour ?? 'currentColor' }}
      />
    </label>
  )
}

type Scale = (value: number) => number

interface PlotProps {
  x: [number, number]
  y: [number, number]
  xLabel: string
  title?: string
  children: (sx: Scale, sy: Scale) => ReactNode
}

function Plot({ x, y, xLabel, title, children }: PlotProps) {
  const clipId = useSvgId()
  const [width, height, left, right, top, bottom] = [320, 220, 28, 8, 22, 30]
  const sx: Scale = (value) => scale(value, x, [left, width - right])
  const sy: Scale = (value) => scale(value, y, [height - bottom, top])
  const ticks = (domain: [number, number]) => {
    const values = []
    for (let tick = Math.ceil(domain[0] / 2) * 2; tick <= domain[1]; tick += 2) values.push(tick)
    return values
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label={title}>
      {title && (
        <text x={width / 2} y={13} textAnchor="middle" className="fill-current text-[12px]">
          {title}
        </text>
      )}
      <clipPath id={clipId}>
        <rect x={left} y={top} width={width - left - right} height={height - top - bottom} />
      </clipPath>
      <rect
        x={left}
        y={top}
        width={width - left - right}
        height={height - top - bottom}
        className="fill-none stroke-current opacity-30"
      />
      <line x1={left} x2={width - right} y1={sy(0)} y2={sy(0)} className="stroke-current opacity-30" />
      {ticks(x).map((tick) => (
        <text key={tick} x={sx(tick)} y={height - bottom + 12} textAnchor="middle" className="fill-current text-[9px] opacity-70">
          {tick}
        </text>
      ))}
      {ticks(y).map((tick) => (
        <text key={tick} x={left - 4} y={sy(tick) + 3} textAnchor="end" className="fill-current text-[9px] opacity-70">
          {tick}
        </text>
      ))}
      <text x={(left + width - right) / 2} y={height - 4} textAnchor="middle" className="fill-current text-[10px]">
        {xLabel}
      </text>
      <g clipPath={`url(#${clipId})`}>{children(sx, sy)}</g>
    </svg>
  )
}

function curve(f: (x: number) => number, [x0, x1]: [number, number], sx: Scale, sy: Scale) {
  const points = []
  for (let i = 0; i <= 200; i++) {
    const x = x0 + ((x1 - x0) * i) / 200
    points.push(`${sx(x)},${sy(f(x))}`)
  }
  return points.join(' ')
}

function Arrow({ x1, x2, y, markerId }: { x1: number; x2: number; y: number; markerId: string }) {
  return <line x1={x1} x2={x2} y1={y} y2={y} strokeWidth={2} markerEnd={`url(#${markerId})`} className="stroke-current" />
}

function ArrowMarker({ id }: { id: string }) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" className="fill-current" />
    </marker>
  )
}

export function OneNeuron() {
  const [weight, setWeight] = useState(1)
  const [bias, setBias] = useState(0)
  const markerId = useSvgId()
  const bend = weight !== 0 ? -bias / weight : null

  return (
    <Figure>
      <div className="grid items-center gap-4 sm:grid-cols-2">
        <svg viewBox="0 0 320 150" className="w-full" role="img" aria-label="A neuron with one input">
          <defs>
            <ArrowMarker id={markerId} />
          </defs>
          <text x={160} y={14} textAnchor="middle" className="fill-current text-[12px]">
            output = ReLU(weight × x + bias)
          </text>
          <circle cx={36} cy={80} r={20} className="fill-background stroke-current" />
          <text x={36} y={85} textAnchor="middle" className="fill-current text-[15px]">
            x
          </text>
          <Arrow x1={58} x2={128} y={80} markerId={markerId} />
          <text x={93} y={70} textAnchor="middle" className="fill-current text-[12px]">
            × {weight.toFixed(1)}
          </text>
          <circle cx={170} cy={80} r={38} fill={NEURON_COLOURS[0]} className="stroke-current" />
          <text x={170} y={76} textAnchor="middle" className="fill-white text-[12px]">
            + {bias.toFixed(1)}
          </text>
          <text x={170} y={92} textAnchor="middle" className="fill-white text-[12px]">
            ReLU
          </text>
          <Arrow x1={210} x2={262} y={80} markerId={markerId} />
          <text x={266} y={84} className="fill-current text-[12px]">
            output
          </text>
        </svg>
        <Plot x={[-5, 5]} y={[-5, 5]} xLabel="x (input)">
          {(sx, sy) => (
            <>
              <polyline
                points={curve((x) => weight * x + bias, [-5, 5], sx, sy)}
                strokeDasharray="4 3"
                className="fill-none stroke-current opacity-50"
              />
              <polyline
                points={curve((x) => relu(weight * x + bias), [-5, 5], sx, sy)}
                fill="none"
                stroke={NEURON_COLOURS[0]}
                strokeWidth={3}
              />
              {bend !== null && Math.abs(bend) <= 5 && <circle cx={sx(bend)} cy={sy(0)} r={4} className="fill-current" />}
            </>
          )}
        </Plot>
      </div>
      <p className="mt-2 text-center text-xs opacity-70">Dashed: weight × x + bias. Blue: after ReLU. Dot: the bend.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label="weight" value={weight} min={-2} max={2} step={0.1} colour={NEURON_COLOURS[0]} onChange={setWeight} />
        <Slider label="bias" value={bias} min={-3} max={3} step={0.1} colour={NEURON_COLOURS[0]} onChange={setBias} />
      </div>
    </Figure>
  )
}

const DOTS_X = Array.from({ length: 21 }, (_, i) => i / 2)
const DOTS_Y = DOTS_X.map((x) => 1 + relu(x - 2) - 2 * relu(x - 5) + relu(x - 8))
const HIDDEN = [
  { weight: 1, bias: -2, outputWeight: 1, change: 'starts to climb' },
  { weight: 1, bias: -5, outputWeight: -2, change: 'turns down' },
  { weight: 1, bias: -8, outputWeight: 1, change: 'flattens out' },
]
const OUTPUT_BIAS = 1
const CHOICES = ['No neurons', '1 neuron', '2 neurons', '3 neurons']

export function NeuronsAddUp() {
  const [added, setAdded] = useState(0)
  const [useRelu, setUseRelu] = useState(true)

  const output = (x: number) =>
    HIDDEN.slice(0, added).reduce((total, { weight, bias, outputWeight }) => {
      const line = weight * x + bias
      return total + outputWeight * (useRelu ? relu(line) : line)
    }, OUTPUT_BIAS)
  const newest = HIDDEN[added - 1]
  const caption = !newest
    ? `No neurons yet: only the output's bias, a flat line at ${OUTPUT_BIAS}.`
    : useRelu
      ? `Neuron ${added} adds ${newest.outputWeight} × ReLU(${newest.weight} × x − ${-newest.bias}): the line ${newest.change} at x = ${-newest.bias}.`
      : `Neuron ${added} adds ${newest.outputWeight} × (${newest.weight} × x − ${-newest.bias}): a straight line, so the output stays straight.`

  return (
    <Figure>
      <div className="grid items-center gap-4 sm:grid-cols-2">
        <svg viewBox="0 0 320 200" className="w-full" role="img" aria-label="A network with one hidden layer of three neurons">
          <text x={160} y={14} textAnchor="middle" className="fill-current text-[12px]">
            Input → hidden layer → output
          </text>
          {HIDDEN.map(({ weight, bias, outputWeight }, i) => {
            const y = 50 + 55 * i
            return (
              <g key={i} opacity={i < added ? 1 : 0.15}>
                <line x1={36} y1={105} x2={110} y2={y} className="stroke-current opacity-40" />
                <line x1={210} y1={y} x2={284} y2={105} stroke={NEURON_COLOURS[i]} strokeWidth={1 + Math.abs(outputWeight)} />
                <rect x={110} y={y - 14} width={100} height={28} rx={8} fill={NEURON_COLOURS[i]} className="stroke-current" />
                <text x={160} y={y + 4} textAnchor="middle" className="fill-white text-[10px]">
                  {useRelu ? `ReLU(${weight} × x − ${-bias})` : `${weight} × x − ${-bias}`}
                </text>
                <text x={244} y={(y + 105) / 2 - 6} textAnchor="middle" className="fill-current text-[11px]">
                  × {outputWeight}
                </text>
              </g>
            )
          })}
          <circle cx={36} cy={105} r={20} className="fill-background stroke-current" />
          <text x={36} y={110} textAnchor="middle" className="fill-current text-[15px]">
            x
          </text>
          <circle cx={284} cy={105} r={22} className="fill-background stroke-current" />
          <text x={284} y={109} textAnchor="middle" className="fill-current text-[11px]">
            + {OUTPUT_BIAS}
          </text>
        </svg>
        <Plot x={[0, 10]} y={[-1, 6]} xLabel="x (input)" title="Output">
          {(sx, sy) => (
            <>
              {DOTS_X.map((x, i) => (
                <circle key={x} cx={sx(x)} cy={sy(DOTS_Y[i])} r={2.5} className="fill-current opacity-40" />
              ))}
              <polyline points={curve(output, [0, 10], sx, sy)} strokeWidth={3} className="fill-none stroke-current" />
              {useRelu &&
                HIDDEN.slice(0, added).map(({ weight, bias }, i) => (
                  <circle key={i} cx={sx(-bias / weight)} cy={sy(output(-bias / weight))} r={5} fill={NEURON_COLOURS[i]} className="stroke-current" />
                ))}
            </>
          )}
        </Plot>
      </div>
      <p className="mt-2 text-center text-sm">{caption}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {CHOICES.map((label, count) => (
          <button
            key={count}
            type="button"
            aria-pressed={added === count}
            onClick={() => setAdded(count)}
            className={cn('rounded-md border px-3 py-1 text-sm', added === count ? 'bg-foreground text-background' : 'hover:bg-muted')}
          >
            {label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm">
          <input type="checkbox" checked={useRelu} onChange={(event) => setUseRelu(event.target.checked)} />
          ReLU
        </label>
      </div>
    </Figure>
  )
}

export function LayersAndParameters() {
  const [inputs, setInputs] = useState(1)
  const [neurons, setNeurons] = useState(3)
  const [hiddenLayers, setHiddenLayers] = useState(1)

  const sizes = [inputs, ...Array(hiddenLayers).fill(neurons), 1]
  const parameters = sizes.slice(1).reduce((total, after, i) => total + sizes[i] * after + after, 0)
  const names = ['inputs', ...sizes.slice(1, -1).map((_, i) => `hidden layer ${i + 1}`), 'output']
  const layers = sizes.map((size, column) =>
    Array.from({ length: size }, (_, row) => ({
      x: scale(column, [0, sizes.length - 1], [50, 470]),
      y: 130 + 24 * ((size - 1) / 2 - row),
    })),
  )

  return (
    <Figure>
      <p className="text-center font-medium">{parameters.toLocaleString('en-GB')} parameters</p>
      <svg viewBox="0 0 520 290" className="w-full" role="img" aria-label={`A network with ${parameters} parameters`}>
        {layers.slice(1).map((after, column) =>
          layers[column].flatMap((from, i) =>
            after.map((to, j) => (
              <line key={`${column}-${i}-${j}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="stroke-current opacity-25" />
            )),
          ),
        )}
        {layers.map((layer, column) => (
          <g key={column}>
            {layer.map(({ x, y }, row) =>
              column > 0 && column < layers.length - 1 ? (
                <circle key={row} cx={x} cy={y} r={8} fill={NEURON_COLOURS[0]} className="stroke-current" />
              ) : (
                <circle key={row} cx={x} cy={y} r={8} className="fill-background stroke-current" />
              ),
            )}
            <text x={layer[0].x} y={282} textAnchor="middle" className="fill-current text-[11px]">
              {names[column]}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Slider label="inputs" value={inputs} min={1} max={8} step={1} onChange={setInputs} />
        <Slider label="neurons per hidden layer" value={neurons} min={1} max={10} step={1} colour={NEURON_COLOURS[0]} onChange={setNeurons} />
        <Slider label="hidden layers" value={hiddenLayers} min={1} max={3} step={1} onChange={setHiddenLayers} />
      </div>
    </Figure>
  )
}
