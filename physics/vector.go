package physics

import "math"

var (
	Gravity Vector = Vector(-5)
)

type Direction int

const (
	PositiveDirection Direction = 1
	NegativeDirection           = -1
)

type Vector float64

func (f Vector) Direction() Direction {
	if f > 0 {
		return PositiveDirection
	}
	return NegativeDirection
}

func (f Vector) Magnitude() float64 {
	return math.Abs(float64(f))
}

func AddVectors(vectors ...Vector) Vector {
	var result Vector

	for _, v := range vectors {
		result += v
	}

	return result
}
