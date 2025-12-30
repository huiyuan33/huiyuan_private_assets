class FireFly {
    static w = 6;
    static h = 6;

    public fire: HTMLDivElement | null = null;
    public vw = 0;
    public vh = 0;
    public ow = 0;
    public oh = 0;
    public timer: null | number = null;

    public speedCoefficient: { [key in keyof CSSStyleDeclaration]?: number } = {
        left: 0,
        top: 0,
    };

    constructor(animationName: string) {
        this.vw = document.documentElement.clientWidth;
        this.vh = document.documentElement.clientHeight;
        this.ow = this.vw - FireFly.w;
        this.oh = this.vh - FireFly.h;

        const fire = (this.fire = document.createElement('div'));
        fire.style.position = 'absolute';
        fire.style.width = FireFly.w + 'px';
        fire.style.height = FireFly.h + 'px';
        fire.style.borderRadius = '50%';
        fire.style.backgroundImage =
            'radial-gradient(rgba(255, 255, 199, 1), rgba(203, 255, 138, 0.8), rgba(105, 193, 114, 0.8))';
        fire.style.animation = `${animationName} 2s infinite;`;

        this.setStyle();
    }

    setStyle() {
        if (this.fire) {
            this.fire.style.left = this.genRandomNum(0, this.ow) + 'px';
            this.fire.style.top = this.genRandomNum(0, this.oh) + 'px';
            this.speedCoefficient.top = this.genRandomNum(0, this.oh);
            this.speedCoefficient.left = this.genRandomNum(0, this.ow);

            document.body.appendChild(this.fire);
            this.fireFlying();
        }
    }

    genRandomNum(min: number, max: number) {
        return Math.round(Math.random() * (max - min)) + min;
    }

    fireFlying() {
        if (this.fire) {
            const randomOffset = this.speedCoefficient;

            for (const attr in randomOffset) {
                const currentValue = parseInt(
                    window.getComputedStyle(this.fire)[attr],
                );
                if (currentValue === randomOffset[attr]) {
                    // 重置速度系数
                    this.speedCoefficient.top = this.genRandomNum(0, this.oh);
                    this.speedCoefficient.left = this.genRandomNum(0, this.ow);
                } else {
                    let offset = (randomOffset[attr]! - currentValue) / 10000;
                    offset = offset > 0 ? Math.ceil(offset) : Math.floor(offset);
                    this.fire.style[attr] = currentValue + offset + 'px';
                }
            }
            requestAnimationFrame(this.fireFlying.bind(this));
        }
    }

    remove() {
        this.fire?.remove();
    }
}

class FireFlyFactory {
    public subs: InstanceType<typeof FireFly>[] = [];

    constructor(count = 35, animationName = 'fire-fly-flashing') {
        Array.from({ length: count }).forEach(() => {
            this.subs.push(new FireFly(animationName));
        });
    }

    destroye() {
        this.subs.forEach((sub) => {
            sub.remove();
        });
    }
}

export default FireFlyFactory;
