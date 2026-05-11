"use client"

const LETTERS: Record<string, number[][]> = {
  M: [
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 1, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  e: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  z: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  o: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  " ": [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ],
  D: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
  p: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
  ],
  l: [
    [1, 0, 0],
    [1, 0, 0],
    [1, 0, 0],
    [1, 0, 0],
    [1, 0, 0],
    [1, 0, 0],
    [1, 0, 0],
    [1, 0, 0],
    [0, 1, 1],
    [0, 0, 0],
    [0, 0, 0],
  ],
  y: [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
}

const WORD = "Mezo Deploy"
const LETTER_GAP = 2 // tight gap
const ROWS = 11

function buildGrid(): { grid: number[][]; totalCols: number } {
  const letterGrids = WORD.split("").map((ch) => LETTERS[ch])
  let totalCols = 0
  letterGrids.forEach((lg, i) => {
    totalCols += lg[0].length
    if (i < letterGrids.length - 1) totalCols += LETTER_GAP
  })

  const grid: number[][] = Array.from({ length: ROWS }, () =>
    Array(totalCols).fill(0),
  )

  let colOffset = 0
  letterGrids.forEach((lg, li) => {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < lg[r].length; c++) {
        grid[r][colOffset + c] = lg[r][c]
      }
    }
    colOffset += lg[0].length
    if (li < letterGrids.length - 1) colOffset += LETTER_GAP
  })

  return { grid, totalCols }
}

const { grid, totalCols } = buildGrid()

function getBlockStyle(colIndex: number): React.CSSProperties {
  const t = colIndex / (totalCols - 1)

  let r: number, g: number, b: number
  let blur = 0
  let opacity = 1

  if (t < 0.25) {
    // Left edge - fuzzy gray/white
    r = 160
    g = 160
    b = 160
    blur = 6 * (1 - t / 0.25) // max blur on the left
    opacity = 0.5 + (t / 0.25) * 0.5
  } else if (t < 0.7) {
    // Middle - sharp white/light gray
    r = 240
    g = 240
    b = 240
    blur = 0
    opacity = 1
  } else {
    // Right edge - blurry primary
    const rt = (t - 0.7) / 0.3
    r = 240 - rt * (240 - 179)
    g = 240 - rt * (240 - 236)
    b = 240 - rt * (240 - 17)
    blur = 6 * rt // increases towards right
    opacity = 1 - rt * 0.4
  }

  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity})`,
    filter: blur > 0 ? `blur(${blur}px)` : undefined,
  }
}

export default function HeroPixelText() {
  return (
    <div className="relative w-full flex items-center justify-center overflow-visible py-10">
      {/* Pixel grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${totalCols}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          gap: "clamp(2px, 0.4vw, 5px)",
          width: "min(95%, 1100px)",
          aspectRatio: `${totalCols} / ${ROWS}`,
        }}
        aria-label="Mezo Deploy pixel art text"
        role="img"
        className="2xl:scale-125"
      >
        {grid.flatMap((row, ri) =>
          row.map((cell, ci) => (
            <div
              key={`${ri}-${ci}`}
              style={
                cell
                  ? {
                      ...getBlockStyle(ci),
                      borderRadius: "0px", // Reference has sharp square pixels
                    }
                  : undefined
              }
            />
          )),
        )}
      </div>
    </div>
  )
}
