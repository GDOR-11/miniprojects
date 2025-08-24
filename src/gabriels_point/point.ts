import Decimal from "decimal.js";

export default class Point {
    x: Decimal;
    y: Decimal;
    constructor(x: Decimal | number, y: Decimal | number) {
        this.x = typeof x == "number" ? new Decimal(x) : x;
        this.y = typeof y == "number" ? new Decimal(y) : y;
    }
    set(p: Point) {
        this.x = p.x;
        this.y = p.y;
    }
    plus(p: Point): Point {
        return new Point(this.x.plus(p.x), this.y.plus(p.y))
    }
    minus(p: Point): Point {
        return new Point(this.x.minus(p.x), this.y.minus(p.y))
    }
    times(x: number | Decimal): Point {
        if (typeof x === "number") x = new Decimal(x);
        return new Point(this.x.times(x), this.y.times(x));
    }
    dot(p: Point): Decimal {
        return this.x.times(p.x).plus(this.y.times(p.y));
    }
    lenSq(): Decimal {
        return this.x.times(this.x).plus(this.y.times(this.y));
    }
    len(): Decimal {
        return this.lenSq().sqrt();
    }
}
