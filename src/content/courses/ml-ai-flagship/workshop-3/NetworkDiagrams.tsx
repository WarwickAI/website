import { useId, useState, type ReactNode } from 'react'

const NEURON_COLOUR = '#3b82f6'
const ACTIVATION_COLOUR = '#22c55e'

const relu = (z: number) => Math.max(z, 0)

const formatNumber = (value: number, digits = 1) =>
  `${value < 0 ? '−' : ''}${Math.abs(value).toFixed(digits)}`

function useSvgId() {
  return useId().replace(/[^a-zA-Z0-9]/g, '')
}

function ArrowMarker({ id }: { id: string }) {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX={9}
      refY={5}
      markerWidth={9}
      markerHeight={9}
      markerUnits="userSpaceOnUse"
      orient="auto"
    >
      <path d="M 0 0 L 10 5 L 0 10 z" className="fill-current" />
    </marker>
  )
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

function Slider({
  label,
  value,
  min,
  max,
  step,
  colour,
  onChange,
}: SliderProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="font-mono">
          {formatNumber(value, step >= 1 ? 0 : 1)}
        </span>
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

interface NeuronDrawingProps {
  /** Label for each input pill, in order from the top. */
  inputs: string[]
  /** Label on each input's arrow, in the same order. */
  weights: string[]
  bias: string
  activation: string
  label: string
}

/** Inputs on the left, bias from above, a blue "add up" node, a green activation node, then the output. */
function NeuronDrawing({
  inputs,
  weights,
  bias,
  activation,
  label,
}: NeuronDrawingProps) {
  const markerId = useSvgId()
  const [sumX, sumY, sumR] = [190, 110, 32]
  const [actX, actY, actR] = [300, 110, 30]
  const outX = 390
  const [biasX, biasY, biasR] = [sumX, 28, 16]
  const gap = 50
  const inputYs = inputs.map(
    (_, i) => sumY + (i - (inputs.length - 1) / 2) * gap,
  )

  return (
    <svg
      viewBox="0 0 430 200"
      className="mx-auto w-full max-w-md"
      role="img"
      aria-label={label}
    >
      <defs>
        <ArrowMarker id={markerId} />
      </defs>
      {inputs.map((input, i) => {
        const [ix, iy] = [52, inputYs[i]]
        const dx = sumX - ix
        const dy = sumY - iy
        const length = Math.hypot(dx, dy)
        const [ux, uy] = [dx / length, dy / length]
        const [x1, y1] = [ix + ux * 32, iy + uy * 32]
        const [x2, y2] = [sumX - ux * (sumR + 2), sumY - uy * (sumR + 2)]
        const [lx, ly] = [(x1 + x2) / 2 - uy * 10, (y1 + y2) / 2 + ux * 10]
        return (
          <g key={i}>
            <rect
              x={ix - 30}
              y={iy - 13}
              width={60}
              height={26}
              rx={13}
              className="fill-background stroke-current"
            />
            <text
              x={ix}
              y={iy + 4}
              textAnchor="middle"
              className="fill-current text-[12px]"
            >
              {input}
            </text>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              strokeWidth={1.5}
              markerEnd={`url(#${markerId})`}
              className="stroke-current"
            />
            <text
              x={lx}
              y={ly + 4}
              textAnchor="middle"
              className="fill-current text-[13px]"
            >
              {weights[i]}
            </text>
          </g>
        )
      })}
      <circle
        cx={biasX}
        cy={biasY}
        r={biasR}
        className="fill-background stroke-current"
      />
      <text
        x={biasX}
        y={biasY + 5}
        textAnchor="middle"
        className="fill-current text-[14px]"
      >
        {bias}
      </text>
      <line
        x1={biasX}
        y1={biasY + biasR + 2}
        x2={sumX}
        y2={sumY - sumR - 2}
        strokeWidth={1.5}
        markerEnd={`url(#${markerId})`}
        className="stroke-current"
      />
      <circle
        cx={sumX}
        cy={sumY}
        r={sumR}
        fill={NEURON_COLOUR}
        className="stroke-current"
      />
      <text
        x={sumX}
        y={sumY + 4}
        textAnchor="middle"
        className="fill-white text-[12px]"
      >
        add up
      </text>
      <line
        x1={sumX + sumR + 2}
        y1={sumY}
        x2={actX - actR - 2}
        y2={actY}
        strokeWidth={1.5}
        markerEnd={`url(#${markerId})`}
        className="stroke-current"
      />
      <circle
        cx={actX}
        cy={actY}
        r={actR}
        fill={ACTIVATION_COLOUR}
        className="stroke-current"
      />
      <text
        x={actX}
        y={actY + 4}
        textAnchor="middle"
        className="fill-white text-[11px]"
      >
        {activation}
      </text>
      <line
        x1={actX + actR + 2}
        y1={actY}
        x2={outX - 32}
        y2={actY}
        strokeWidth={1.5}
        markerEnd={`url(#${markerId})`}
        className="stroke-current"
      />
      <rect
        x={outX - 30}
        y={actY - 13}
        width={60}
        height={26}
        rx={13}
        className="fill-background stroke-current"
      />
      <text
        x={outX}
        y={actY + 4}
        textAnchor="middle"
        className="fill-current text-[12px]"
      >
        output
      </text>
    </svg>
  )
}

/** One neuron with three inputs: weighted sum, plus bias, through an activation function. */
export function Neuron() {
  return (
    <NeuronDrawing
      inputs={['input 1', 'input 2', 'input 3']}
      weights={['w₁', 'w₂', 'w₃']}
      bias="b"
      activation="activation"
      label="A neuron with three inputs"
    />
  )
}

type Scale = (value: number) => number

interface PlotProps {
  x: [number, number]
  y: [number, number]
  xStep?: number
  yStep?: number
  xLabel: string
  title?: string
  children: (sx: Scale, sy: Scale) => ReactNode
}

/** A small graph with axes, drawing whatever the children return using the x and y scales. */
function Plot({
  x,
  y,
  xStep = 2,
  yStep = 2,
  xLabel,
  title,
  children,
}: PlotProps) {
  const clipId = useSvgId()
  const [width, height, left, right, top, bottom] = [
    320,
    220,
    28,
    8,
    title ? 22 : 12,
    30,
  ]
  const sx: Scale = (value) =>
    left + ((value - x[0]) / (x[1] - x[0])) * (width - left - right)
  const sy: Scale = (value) =>
    height - bottom - ((value - y[0]) / (y[1] - y[0])) * (height - top - bottom)
  const ticks = (domain: [number, number], step: number) => {
    const values = []
    for (
      let i = Math.ceil(domain[0] / step - 1e-9);
      i * step <= domain[1] + 1e-9;
      i++
    )
      values.push(Number((i * step).toFixed(6)))
    return values
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label={title ?? 'Graph'}
    >
      {title && (
        <text
          x={width / 2}
          y={13}
          textAnchor="middle"
          className="fill-current text-[12px]"
        >
          {title}
        </text>
      )}
      <clipPath id={clipId}>
        <rect
          x={left}
          y={top}
          width={width - left - right}
          height={height - top - bottom}
        />
      </clipPath>
      <rect
        x={left}
        y={top}
        width={width - left - right}
        height={height - top - bottom}
        className="fill-none stroke-current opacity-30"
      />
      {y[0] < 0 && y[1] > 0 && (
        <line
          x1={left}
          x2={width - right}
          y1={sy(0)}
          y2={sy(0)}
          className="stroke-current opacity-30"
        />
      )}
      {ticks(x, xStep).map((tick) => (
        <text
          key={`x${tick}`}
          x={sx(tick)}
          y={height - bottom + 12}
          textAnchor="middle"
          className="fill-current text-[9px] opacity-70"
        >
          {formatNumber(tick, 0)}
        </text>
      ))}
      {ticks(y, yStep).map((tick) => (
        <text
          key={`y${tick}`}
          x={left - 4}
          y={sy(tick) + 3}
          textAnchor="end"
          className="fill-current text-[9px] opacity-70"
        >
          {formatNumber(tick, 0)}
        </text>
      ))}
      <text
        x={(left + width - right) / 2}
        y={height - 4}
        textAnchor="middle"
        className="fill-current text-[10px]"
      >
        {xLabel}
      </text>
      <g clipPath={`url(#${clipId})`}>{children(sx, sy)}</g>
    </svg>
  )
}

function curve(
  f: (x: number) => number,
  [x0, x1]: [number, number],
  sx: Scale,
  sy: Scale,
) {
  return Array.from({ length: 201 }, (_, i) => {
    const x = x0 + ((x1 - x0) * i) / 200
    return `${sx(x)},${sy(f(x))}`
  }).join(' ')
}

/** The same neuron with one input, with sliders for its weight and bias and a graph of its output. */
export function OneInputNeuron() {
  const [weight, setWeight] = useState(1)
  const [bias, setBias] = useState(0)

  return (
    <>
      <div className="grid items-center gap-4 sm:grid-cols-2">
        <NeuronDrawing
          inputs={['input']}
          weights={[`× ${formatNumber(weight)}`]}
          bias={formatNumber(bias)}
          activation="ReLU"
          label="A neuron with one input"
        />
        <Plot x={[-5, 5]} y={[-5, 5]} xLabel="input">
          {(sx, sy) => (
            <polyline
              points={curve((x) => relu(weight * x + bias), [-5, 5], sx, sy)}
              fill="none"
              stroke={ACTIVATION_COLOUR}
              strokeWidth={3}
            />
          )}
        </Plot>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider
          label="weight"
          value={weight}
          min={-2}
          max={2}
          step={0.1}
          colour={NEURON_COLOUR}
          onChange={setWeight}
        />
        <Slider
          label="bias"
          value={bias}
          min={-3}
          max={3}
          step={0.1}
          colour={NEURON_COLOUR}
          onChange={setBias}
        />
      </div>
    </>
  )
}

/** A layer that grows one neuron at a time, with the matching PyTorch line laid out over the drawing. */
export function Layer() {
  const [count, setCount] = useState(1)
  const markerId = useSvgId()
  const inputs = ['input 1', 'input 2', 'input 3']
  const [ix, sumX, actX, ox, r, maxCount] = [52, 190, 290, 400, 18, 5]
  const inputYs = [80, 130, 180]
  const gap = 42
  const neuronYs = Array.from(
    { length: count },
    (_, j) => 130 + (j - (count - 1) / 2) * gap,
  )
  const arrow = {
    strokeWidth: 1.2,
    markerEnd: `url(#${markerId})`,
    className: 'stroke-current',
  }
  const button = 'rounded-md border px-3 py-1 text-sm disabled:opacity-40'

  return (
    <>
      <svg
        viewBox="0 0 460 240"
        className="mx-auto w-full max-w-lg"
        role="img"
        aria-label={`A layer of ${count} neurons`}
      >
        <defs>
          <ArrowMarker id={markerId} />
        </defs>
        <g className="fill-current font-mono text-[12px]">
          <text x={sumX - 90} y={22} textAnchor="end">
            nn.Sequential(
          </text>
          <text x={sumX} y={22} textAnchor="middle">
            nn.Linear(3, {count}),
          </text>
          <text x={actX} y={22} textAnchor="middle">
            nn.ReLU()
          </text>
          <text x={actX + 72} y={22}>
            )
          </text>
        </g>
        {inputYs.map((iy, i) =>
          neuronYs.map((ny, j) => {
            const [dx, dy] = [sumX - ix, ny - iy]
            const length = Math.hypot(dx, dy)
            const [ux, uy] = [dx / length, dy / length]
            return (
              <line
                key={`${i}-${j}`}
                x1={ix + ux * 32}
                y1={iy + uy * 32}
                x2={sumX - ux * (r + 2)}
                y2={ny - uy * (r + 2)}
                {...arrow}
              />
            )
          }),
        )}
        {inputs.map((input, i) => (
          <g key={input}>
            <rect
              x={ix - 30}
              y={inputYs[i] - 13}
              width={60}
              height={26}
              rx={13}
              className="fill-background stroke-current"
            />
            <text
              x={ix}
              y={inputYs[i] + 4}
              textAnchor="middle"
              className="fill-current text-[12px]"
            >
              {input}
            </text>
          </g>
        ))}
        {neuronYs.map((ny, j) => (
          <g key={j}>
            <circle
              cx={sumX}
              cy={ny}
              r={r}
              fill={NEURON_COLOUR}
              className="stroke-current"
            />
            <line
              x1={sumX + r + 2}
              y1={ny}
              x2={actX - r - 2}
              y2={ny}
              {...arrow}
            />
            <circle
              cx={actX}
              cy={ny}
              r={r}
              fill={ACTIVATION_COLOUR}
              className="stroke-current"
            />
            <line x1={actX + r + 2} y1={ny} x2={ox - 32} y2={ny} {...arrow} />
            <rect
              x={ox - 30}
              y={ny - 13}
              width={60}
              height={26}
              rx={13}
              className="fill-background stroke-current"
            />
            <text
              x={ox}
              y={ny + 4}
              textAnchor="middle"
              className="fill-current text-[12px]"
            >
              output {j + 1}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex justify-center gap-2">
        <button
          type="button"
          className={button}
          onClick={() => setCount(count - 1)}
          disabled={count <= 1}
        >
          Remove a neuron
        </button>
        <button
          type="button"
          className={button}
          onClick={() => setCount(count + 1)}
          disabled={count >= maxCount}
        >
          Add a neuron
        </button>
      </div>
    </>
  )
}

/** A neuron drawn small: blue left half for the add-up, green right half for the activation. All blue when there is no activation. */
function SmallNeuron({
  cx,
  cy,
  r,
  activation = true,
}: {
  cx: number
  cy: number
  r: number
  activation?: boolean
}) {
  return (
    <g>
      {activation ? (
        <>
          <path
            d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} Z`}
            fill={NEURON_COLOUR}
          />
          <path
            d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z`}
            fill={ACTIVATION_COLOUR}
          />
        </>
      ) : (
        <circle cx={cx} cy={cy} r={r} fill={NEURON_COLOUR} />
      )}
      <circle cx={cx} cy={cy} r={r} className="fill-none stroke-current" />
    </g>
  )
}

/** A network with one input, two hidden layers of three, and one output, with the PyTorch pieces stacked over each column. */
export function Network() {
  const markerId = useSvgId()
  const [ix, hid1X, hid2X, outX, px, r] = [52, 200, 340, 480, 580, 18]
  const [iy, oy] = [140, 140]
  const hiddenYs = [98, 140, 182]
  const arrow = {
    strokeWidth: 1.2,
    markerEnd: `url(#${markerId})`,
    className: 'stroke-current',
  }
  const toward = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    pad1: number,
    pad2: number,
  ) => {
    const [dx, dy] = [x2 - x1, y2 - y1]
    const length = Math.hypot(dx, dy)
    const [ux, uy] = [dx / length, dy / length]
    return {
      x1: x1 + ux * pad1,
      y1: y1 + uy * pad1,
      x2: x2 - ux * pad2,
      y2: y2 - uy * pad2,
    }
  }

  return (
    <svg
      viewBox="0 0 640 250"
      className="mx-auto w-full max-w-2xl"
      role="img"
      aria-label="A network with two hidden layers of three neurons"
    >
      <defs>
        <ArrowMarker id={markerId} />
      </defs>
      <g className="fill-current font-mono text-[12px]">
        <text x={hid1X - 68} y={22} textAnchor="end">
          nn.Sequential(
        </text>
        <text x={hid1X} y={22} textAnchor="middle">
          nn.Linear(1, 3),
        </text>
        <text x={hid1X} y={38} textAnchor="middle">
          nn.ReLU(),
        </text>
        <text x={hid2X} y={22} textAnchor="middle">
          nn.Linear(3, 3),
        </text>
        <text x={hid2X} y={38} textAnchor="middle">
          nn.ReLU(),
        </text>
        <text x={outX} y={22} textAnchor="middle">
          nn.Linear(3, 1)
        </text>
        <text x={outX + 68} y={22}>
          )
        </text>
      </g>
      <g className="fill-current text-[10px] opacity-70">
        <text x={ix} y={232} textAnchor="middle">
          input
        </text>
        <text x={(hid1X + hid2X) / 2} y={232} textAnchor="middle">
          hidden layers
        </text>
        <text x={outX} y={232} textAnchor="middle">
          output layer
        </text>
      </g>
      {hiddenYs.map((hy, j) => (
        <g key={j}>
          <line {...toward(ix, iy, hid1X, hy, 32, r + 2)} {...arrow} />
          {hiddenYs.map((hy2, k) => (
            <line
              key={k}
              {...toward(hid1X, hy, hid2X, hy2, r + 2, r + 2)}
              {...arrow}
            />
          ))}
          <line {...toward(hid2X, hy, outX, oy, r + 2, r + 2)} {...arrow} />
        </g>
      ))}
      {hiddenYs.map((hy, j) => (
        <g key={j}>
          <SmallNeuron cx={hid1X} cy={hy} r={r} />
          <SmallNeuron cx={hid2X} cy={hy} r={r} />
        </g>
      ))}
      <rect
        x={ix - 30}
        y={iy - 13}
        width={60}
        height={26}
        rx={13}
        className="fill-background stroke-current"
      />
      <text
        x={ix}
        y={iy + 4}
        textAnchor="middle"
        className="fill-current text-[12px]"
      >
        input
      </text>
      <SmallNeuron cx={outX} cy={oy} r={r} activation={false} />
      <line x1={outX + r + 2} y1={oy} x2={px - 36} y2={oy} {...arrow} />
      <rect
        x={px - 34}
        y={oy - 13}
        width={68}
        height={26}
        rx={13}
        className="fill-background stroke-current"
      />
      <text
        x={px}
        y={oy + 4}
        textAnchor="middle"
        className="fill-current text-[12px]"
      >
        prediction
      </text>
    </svg>
  )
}

const DOTS_X = Array.from({ length: 21 }, (_, i) => i / 2)
const HIDDEN = [
  { weight: 1, bias: -2, outputWeight: 1, change: 'starts to climb' },
  { weight: 1, bias: -5, outputWeight: -2, change: 'turns down' },
  { weight: 1, bias: -8, outputWeight: 1, change: 'flattens out' },
]
const OUTPUT_BIAS = 1
const DOTS_Y = DOTS_X.map((x) =>
  HIDDEN.reduce(
    (total, { weight, bias, outputWeight }) =>
      total + outputWeight * relu(weight * x + bias),
    OUTPUT_BIAS,
  ),
)
const CHOICES = ['No neurons', '1 neuron', '2 neurons', '3 neurons']

/** A one-hidden-layer network whose neurons are added one at a time, with its output plotted beside it. */
export function NetworkComputes() {
  const [added, setAdded] = useState(0)
  const [useRelu, setUseRelu] = useState(true)
  const markerId = useSvgId()
  const [ix, hidX, outX, px, r] = [40, 150, 250, 322, 16]
  const [iy, oy] = [110, 110]
  const hiddenYs = [55, 110, 165]
  const arrow = {
    strokeWidth: 1.2,
    markerEnd: `url(#${markerId})`,
    className: 'stroke-current',
  }
  const toward = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    pad1: number,
    pad2: number,
  ) => {
    const [dx, dy] = [x2 - x1, y2 - y1]
    const length = Math.hypot(dx, dy)
    const [ux, uy] = [dx / length, dy / length]
    return {
      x1: x1 + ux * pad1,
      y1: y1 + uy * pad1,
      x2: x2 - ux * pad2,
      y2: y2 - uy * pad2,
    }
  }

  const output = (x: number) =>
    HIDDEN.slice(0, added).reduce((total, { weight, bias, outputWeight }) => {
      const line = weight * x + bias
      return total + outputWeight * (useRelu ? relu(line) : line)
    }, OUTPUT_BIAS)
  const newest = HIDDEN[added - 1]
  const caption = !newest
    ? `No neurons yet, so only the output's bias, a flat line at ${OUTPUT_BIAS}.`
    : useRelu
      ? `Neuron ${added} adds ${formatNumber(newest.outputWeight, 0)} × ReLU(input − ${-newest.bias}), so the line ${newest.change} at input = ${-newest.bias}.`
      : `Neuron ${added} adds ${formatNumber(newest.outputWeight, 0)} × (input − ${-newest.bias}), a straight line, so the output stays straight.`
  const button = (active: boolean) =>
    `rounded-md border px-3 py-1 text-sm ${active ? 'bg-foreground text-background' : 'hover:bg-muted'}`

  return (
    <>
      <div className="grid items-center gap-4 sm:grid-cols-2">
        <svg
          viewBox="0 0 370 220"
          className="w-full"
          role="img"
          aria-label="A network with one hidden layer of three neurons"
        >
          <defs>
            <ArrowMarker id={markerId} />
          </defs>
          {HIDDEN.map(({ weight, bias, outputWeight }, i) => {
            const hy = hiddenYs[i]
            const out = toward(hidX, hy, outX, oy, r + 2, r + 2)
            const [dx, dy] = [out.x2 - out.x1, out.y2 - out.y1]
            const length = Math.hypot(dx, dy)
            const label =
              dx / length >= 0 === dy / length > 0
                ? { nx: dy / length, ny: -dx / length }
                : { nx: -dy / length, ny: dx / length }
            if (label.ny > 0) [label.nx, label.ny] = [-label.nx, -label.ny]
            return (
              <g key={i} opacity={i < added ? 1 : 0.15}>
                <line {...toward(ix, iy, hidX, hy, 32, r + 2)} {...arrow} />
                <line
                  {...out}
                  strokeWidth={1 + Math.abs(outputWeight)}
                  markerEnd={`url(#${markerId})`}
                  className="stroke-current"
                />
                <text
                  x={(out.x1 + out.x2) / 2 + label.nx * 9}
                  y={(out.y1 + out.y2) / 2 + label.ny * 9 + 3}
                  textAnchor="middle"
                  className="fill-current text-[10px]"
                >
                  × {formatNumber(outputWeight, 0)}
                </text>
                <SmallNeuron cx={hidX} cy={hy} r={r} activation={useRelu} />
                <text
                  x={hidX}
                  y={hy + 4}
                  textAnchor="middle"
                  className="fill-white text-[11px] font-semibold"
                >
                  {i + 1}
                </text>
                <text
                  x={hidX}
                  y={hy + r + 11}
                  textAnchor="middle"
                  className="fill-current text-[9px]"
                >
                  {useRelu
                    ? `ReLU(${weight} × input − ${-bias})`
                    : `${weight} × input − ${-bias}`}
                </text>
              </g>
            )
          })}
          <rect
            x={ix - 30}
            y={iy - 13}
            width={60}
            height={26}
            rx={13}
            className="fill-background stroke-current"
          />
          <text
            x={ix}
            y={iy + 4}
            textAnchor="middle"
            className="fill-current text-[12px]"
          >
            input
          </text>
          <SmallNeuron cx={outX} cy={oy} r={r} activation={false} />
          <text
            x={outX}
            y={oy + 4}
            textAnchor="middle"
            className="fill-white text-[10px]"
          >
            + {OUTPUT_BIAS}
          </text>
          <line x1={outX + r + 2} y1={oy} x2={px - 36} y2={oy} {...arrow} />
          <rect
            x={px - 34}
            y={oy - 13}
            width={68}
            height={26}
            rx={13}
            className="fill-background stroke-current"
          />
          <text
            x={px}
            y={oy + 4}
            textAnchor="middle"
            className="fill-current text-[12px]"
          >
            prediction
          </text>
        </svg>
        <Plot x={[0, 10]} y={[-1, 6]} xLabel="input" title="Prediction">
          {(sx, sy) => (
            <>
              {DOTS_X.map((x, i) => (
                <circle
                  key={x}
                  cx={sx(x)}
                  cy={sy(DOTS_Y[i])}
                  r={2.5}
                  className="fill-current opacity-40"
                />
              ))}
              <polyline
                points={curve(output, [0, 10], sx, sy)}
                strokeWidth={3}
                className="fill-none stroke-current"
              />
              {useRelu &&
                HIDDEN.slice(0, added).map(({ weight, bias }, i) => {
                  const bend = -bias / weight
                  return (
                    <g key={i}>
                      <circle
                        cx={sx(bend)}
                        cy={sy(output(bend))}
                        r={7}
                        fill={ACTIVATION_COLOUR}
                        className="stroke-current"
                      />
                      <text
                        x={sx(bend)}
                        y={sy(output(bend)) + 3.5}
                        textAnchor="middle"
                        className="fill-white text-[9px] font-semibold"
                      >
                        {i + 1}
                      </text>
                    </g>
                  )
                })}
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
            className={button(added === count)}
          >
            {label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={useRelu}
            onChange={(event) => setUseRelu(event.target.checked)}
          />
          ReLU
        </label>
      </div>
    </>
  )
}

/** A network of any shape: sliders for inputs, hidden layers and neurons per layer, with the code and parameter count live. */
export function AnyShape() {
  const [inputs, setInputs] = useState(3)
  const [layers, setLayers] = useState(2)
  const [neurons, setNeurons] = useState(3)
  const [outputs, setOutputs] = useState(1)
  const markerId = useSvgId()
  // A fixed canvas, sized for the largest shape, so the figure never resizes under the sliders.
  const [width, height, r, rowGap, colGap, maxRows] = [700, 340, 14, 34, 130, 8]
  const midY = 50 + (maxRows * rowGap) / 2
  const span = (layers + 1) * colGap + 90
  const left = (width - span) / 2
  const columnX = (c: number) => left + c * colGap
  const outX = columnX(layers + 1)
  const px = outX + 90
  const ysFor = (n: number) =>
    Array.from({ length: n }, (_, i) => midY + (i - (n - 1) / 2) * rowGap)
  const inputYs = ysFor(inputs)
  const hiddenYs = ysFor(neurons)
  const outputYs = ysFor(outputs)
  const weight = { strokeWidth: 1, className: 'stroke-current opacity-50' } // Plain lines, since arrowheads pile up on a big network.
  const arrow = {
    strokeWidth: 1,
    markerEnd: `url(#${markerId})`,
    className: 'stroke-current opacity-70',
  }
  const toward = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    pad1: number,
    pad2: number,
  ) => {
    const [dx, dy] = [x2 - x1, y2 - y1]
    const length = Math.hypot(dx, dy)
    const [ux, uy] = [dx / length, dy / length]
    return {
      x1: x1 + ux * pad1,
      y1: y1 + uy * pad1,
      x2: x2 - ux * pad2,
      y2: y2 - uy * pad2,
    }
  }
  const sizes = [
    inputs,
    ...Array.from({ length: layers }, () => neurons),
    outputs,
  ]
  const parameters = sizes
    .slice(1)
    .reduce((total, size, i) => total + sizes[i] * size + size, 0)
  const pieces = sizes
    .slice(1)
    .map((size, i) => `nn.Linear(${sizes[i]}, ${size})`)

  return (
    <>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto w-full max-w-2xl"
        role="img"
        aria-label="A network of any shape"
      >
        <defs>
          <ArrowMarker id={markerId} />
        </defs>
        <g className="fill-current font-mono text-[11px]">
          <text x={columnX(1) - 58} y={18} textAnchor="end">
            nn.Sequential(
          </text>
          {pieces.map((piece, i) => (
            <g key={i}>
              <text x={columnX(i + 1)} y={18} textAnchor="middle">
                {piece}
                {i < pieces.length - 1 ? ',' : ''}
              </text>
              {i < pieces.length - 1 && (
                <text x={columnX(i + 1)} y={32} textAnchor="middle">
                  nn.ReLU(),
                </text>
              )}
            </g>
          ))}
          <text x={outX + 58} y={18}>
            )
          </text>
        </g>
        {inputYs.map((iy, i) =>
          hiddenYs.map((hy, j) => (
            <line
              key={`in-${i}-${j}`}
              {...toward(columnX(0), iy, columnX(1), hy, 30, r + 2)}
              {...weight}
            />
          )),
        )}
        {Array.from({ length: layers - 1 }, (_, l) =>
          hiddenYs.map((y1, i) =>
            hiddenYs.map((y2, j) => (
              <line
                key={`h-${l}-${i}-${j}`}
                {...toward(
                  columnX(l + 1),
                  y1,
                  columnX(l + 2),
                  y2,
                  r + 2,
                  r + 2,
                )}
                {...weight}
              />
            )),
          ),
        )}
        {hiddenYs.map((hy, j) =>
          outputYs.map((oy, k) => (
            <line
              key={`out-${j}-${k}`}
              {...toward(columnX(layers), hy, outX, oy, r + 2, r + 2)}
              {...weight}
            />
          )),
        )}
        {inputYs.map((iy, i) => (
          <g key={`input-${i}`}>
            <rect
              x={columnX(0) - 28}
              y={iy - 11}
              width={56}
              height={22}
              rx={11}
              className="fill-background stroke-current"
            />
            <text
              x={columnX(0)}
              y={iy + 4}
              textAnchor="middle"
              className="fill-current text-[10px]"
            >
              input {i + 1}
            </text>
          </g>
        ))}
        {Array.from({ length: layers }, (_, l) =>
          hiddenYs.map((hy, j) => (
            <SmallNeuron
              key={`n-${l}-${j}`}
              cx={columnX(l + 1)}
              cy={hy}
              r={r}
            />
          )),
        )}
        {outputYs.map((oy, k) => (
          <g key={`output-${k}`}>
            <SmallNeuron cx={outX} cy={oy} r={r} activation={false} />
            <line x1={outX + r + 2} y1={oy} x2={px - 36} y2={oy} {...arrow} />
            <rect
              x={px - 34}
              y={oy - 11}
              width={68}
              height={22}
              rx={11}
              className="fill-background stroke-current"
            />
            <text
              x={px}
              y={oy + 4}
              textAnchor="middle"
              className="fill-current text-[10px]"
            >
              {outputs === 1 ? 'prediction' : `prediction ${k + 1}`}
            </text>
          </g>
        ))}
      </svg>
      <p className="mt-2 text-center text-sm">
        <span className="font-mono">{parameters.toLocaleString()}</span>{' '}
        parameters, every weight and bias added up.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Slider
          label="inputs"
          value={inputs}
          min={1}
          max={8}
          step={1}
          onChange={setInputs}
        />
        <Slider
          label="hidden layers"
          value={layers}
          min={1}
          max={3}
          step={1}
          onChange={setLayers}
        />
        <Slider
          label="neurons per layer"
          value={neurons}
          min={1}
          max={8}
          step={1}
          onChange={setNeurons}
        />
        <Slider
          label="outputs"
          value={outputs}
          min={1}
          max={8}
          step={1}
          onChange={setOutputs}
        />
      </div>
    </>
  )
}

const ACTIVATIONS: { name: string; f: (z: number) => number }[] = [
  { name: 'nn.ReLU()', f: relu },
  { name: 'nn.Sigmoid()', f: (z) => 1 / (1 + Math.exp(-z)) },
  { name: 'nn.Tanh()', f: Math.tanh },
]

/** Three common activation functions, side by side. */
export function Activations() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {ACTIVATIONS.map(({ name, f }) => (
        <div key={name}>
          <p className="text-center font-mono text-xs">{name}</p>
          <Plot x={[-3, 3]} y={[-1.5, 3]} xStep={1} yStep={1} xLabel="in">
            {(sx, sy) => (
              <polyline
                points={curve(f, [-3, 3], sx, sy)}
                fill="none"
                stroke={ACTIVATION_COLOUR}
                strokeWidth={3}
              />
            )}
          </Plot>
        </div>
      ))}
    </div>
  )
}
