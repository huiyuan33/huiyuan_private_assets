import logIcon from './icon/log.png';
import warnIcon from './icon/warn.png';
import errorIcon from './icon/error.png';
import eventIcon from './icon/event.png';
import readyIcon from './icon/ready.png';

type ChalkDefaultColorPrimary =
    | '_black'
    | '_white'
    | '_red'
    | '_yellow'
    | '_green'
    | '_blue'
    | '_purple'
    | '_lightYellow'
    | '_lightGreen'
    | '_lightBlue'
    | '_lib'
    | '_version';
type ChalkDefaultLevel = 'log' | 'warn' | 'error' | 'event' | 'ready';

type ChalkColorPrimary<T extends string = ChalkDefaultColorPrimary> =
    | T
    | ChalkDefaultColorPrimary;

type ChalkLevel<Level extends string = ChalkDefaultLevel> =
    | Level
    | ChalkDefaultLevel;

type ChalkLevelConf<ColorPrimary extends string = ChalkDefaultColorPrimary> = {
    colorPrimay: ChalkDefaultColorPrimary | ColorPrimary;
    icon?: string;
};

type ChalkImageConfig = {
    width: number;
    height: number;
};

type ChalkVersionConfig<T extends string = ChalkDefaultColorPrimary> = {
    name: string;
    color?: T | ChalkDefaultColorPrimary;
    bgColor?: T | ChalkDefaultColorPrimary;
};

type ChalkHeartConfig<T extends string = ChalkDefaultColorPrimary> = {
    color: T | ChalkDefaultColorPrimary;
    bgColor: T | ChalkDefaultColorPrimary;
    heartColor: T | ChalkDefaultColorPrimary;
    fontSize: number;
    padding: [number, number];
};

/**
 * C: 用于扩展颜色
 * L: 用于扩展日志类型
 */
export class Chalk<
    C extends { [key: string]: string } = {
        [key in ChalkDefaultColorPrimary]: string;
    },
    L extends string = ChalkLevel,
> {
    public colorMap = new Map<
        Extract<keyof C, string> | ChalkDefaultColorPrimary,
        string
    >();
    public levelMap = new Map<
        ChalkLevel<L>,
        ChalkLevelConf<ChalkColorPrimary<Extract<keyof C, string>>>
    >();
    private _cached = {
        images: new Map<string, string>(),
    };

    constructor(colors?: C) {
        // 初始化成员变量
        this._init();
        if (colors) {
            Object.keys(colors).forEach((key) => {
                if (key.startsWith('_')) {
                    this.log(
                        'error',
                        `${key} config failed, you can't start with _ !`,
                    );
                } else {
                    this.colorMap.set(<Extract<keyof C, string>>key, colors[key]);
                }
            });
        }
    }

    /**
     * 配置日志类型对应的配置
     *
     * @param type 日志类型
     * @param conf 日志配置
     */
    setLevelConf(
        type: ChalkLevel<L>,
        conf: ChalkLevelConf<Extract<keyof C, string>>,
    ) {
        if (type && conf) {
            this.levelMap.set(type, conf);
        }
    }

    /**
     * 更改颜色配置,不支持添加
     *
     * @param primary
     * @param color
     */
    updateColor(
        primary: ChalkColorPrimary<Extract<keyof C, string>>,
        color: string,
    ) {
        if (primary && color) {
            if (this.colorMap.has(primary)) {
                this.colorMap.set(primary, color);
            }
        }
    }

    /**
     * 输出特定类型的日志
     *
     * @param type 日志类型
     * @param msg  日志内容
     */
    log(type: ChalkLevel<L>, msg: string) {
        if (msg && type) {
            const levelConf = this.levelMap.get(type);
            if (levelConf) {
                this._beautifyMsg(type, msg, levelConf);
            } else {
                // 未配置对应levelConf
                console.warn(
                    `[Chalk]: Log type %c${type}`,
                    `color: red`,
                    `isn't config a levelConf!`,
                );
            }
        }
    }

    /**
     * 输出不同颜色的字
     *
     * @param msgs
     * {
     *    msg: {
     *      color: 'colorPrimary',
     *      bgColor: 'colorPrimary',
     *    },
     *    ...
     * }
     */
    msg(msgs: {
        [key: string]: Required<
            Pick<ChalkVersionConfig<Extract<keyof C, string>>, 'color'>
        > & { background?: ChalkColorPrimary<Extract<keyof C, string>> };
    }) {
        if (msgs && typeof msgs === 'object') {
            const arr = [''];
            Object.keys(msgs).forEach((msg) => {
                arr[0] += `%c${msg}`;
                const style = Object.entries(msgs[msg]).map(([key, value]) => {
                    return `${key}:${this._reflectPrimaryColor(value)};`;
                });
                arr.push(style.join(''));
            });
            console.log(...arr);
        }
    }

    /**
     * 输出图片
     *
     * @param url       图片地址
     * @param config    图片配置
     */
    image(url: string, config: Partial<ChalkImageConfig> = {}) {
        if (url) {
            this._drawImage(
                url,
                Object.assign(
                    // default config
                    {
                        width: 0,
                        height: 0,
                    },
                    // user defined config
                    config,
                ),
            );
        }
    }

    /**
     * 输出包以及对应版本号
     *
     * @param lib       包配置
     * @param version   版本配置
     */
    version(
        lib: string | ChalkVersionConfig<Extract<keyof C, string>>,
        version: string | ChalkVersionConfig<Extract<keyof C, string>>,
    ) {
        const libC: Required<ChalkVersionConfig<Extract<keyof C, string>>> = {
            name: typeof lib === 'object' ? lib.name : lib,
            color:
                typeof lib === 'object'
                    ? lib.color
                        ? lib.color
                        : '_white'
                    : '_white',
            bgColor:
                typeof lib === 'object'
                    ? lib.bgColor
                        ? lib.bgColor
                        : '_lib'
                    : '_lib',
        };

        const verC: Required<ChalkVersionConfig<Extract<keyof C, string>>> = {
            name: typeof version === 'object' ? version.name : version,
            color:
                typeof version === 'object'
                    ? version.color
                        ? version.color
                        : '_white'
                    : '_white',
            bgColor:
                typeof version === 'object'
                    ? version.bgColor
                        ? version.bgColor
                        : '_version'
                    : '_version',
        };

        console.log(
            `%c ${libC.name} %c V${verC.name} `,
            `
                padding: 2px 1px; 
                border-radius: 3px 0 0 3px; 
                color: ${this._reflectPrimaryColor(libC.color)}; 
                background: ${this._reflectPrimaryColor(libC.bgColor)}; 
                font-weight: bold;`,
            `
                padding: 2px 1px; 
                border-radius: 0 3px 3px 0; 
                color: ${this._reflectPrimaryColor(verC.color)}; 
                background: ${this._reflectPrimaryColor(verC.bgColor)}; 
                font-weight: bold;
            `,
        );
    }

    hearts(
        word: unknown,
        config: Partial<ChalkHeartConfig<Extract<keyof C, string>>> = {},
    ) {
        const defaultConfig = {
            color: '#fff',
            bgColor: '#b03',
            heartColor: '#d35',
            fontSize: 24,
            padding: [10, 40],
        };
        if (typeof config) {
            Object.keys(config).forEach((key) => {
                const newKey = <keyof ChalkHeartConfig<Extract<keyof C, string>>>key;
                if (
                    newKey === 'color' ||
                    newKey === 'bgColor' ||
                    newKey === 'heartColor'
                ) {
                    defaultConfig[newKey] = this._reflectPrimaryColor(
                        config[newKey]!,
                    );
                } else {
                    defaultConfig[newKey] = <any>config[newKey];
                }
            });
        }

        const { fontSize, padding, color, bgColor, heartColor } = defaultConfig;
        console.log(
            `%c${word}`,
            `
                padding: ${padding[0]}px ${padding[1]}px;
                font-size: ${fontSize}px;
                font-weight: 600;
                border-radius: 10px;
                background:
                radial-gradient(circle closest-side at 60% 43%, 
                            ${bgColor} 26%, 
                            rgba(187,0,51,0) 27%),
                radial-gradient(circle closest-side at 40% 43%, 
                            ${bgColor} 26%, 
                            rgba(187,0,51,0) 27%),
                radial-gradient(circle closest-side at 42% 22%, 
                            ${heartColor} 43%, 
                            rgba(221,51,85,0) 45%),
                radial-gradient(circle closest-side at 58% 22%, 
                            ${heartColor} 43%, 
                            rgba(221,51,85,0) 45%),
                radial-gradient(circle closest-side at 50% 35%, 
                            ${heartColor} 32%, 
                            rgba(221,51,85,0) 27%),
                radial-gradient(circle closest-side at 60% 43%, 
                            ${bgColor} 26%, 
                            rgba(187,0,51,0) 27%) 50px 50px,
                radial-gradient(circle closest-side at 40% 43%, 
                            ${bgColor} 26%, 
                            rgba(187,0,51,0) 27%) 50px 50px,
                radial-gradient(circle closest-side at 40% 22%, 
                            ${heartColor} 40%, 
                            rgba(221,51,85,0) 45%) 52px 50px,
                radial-gradient(circle closest-side at 60% 22%, 
                            ${heartColor} 40%, 
                            rgba(221,51,85,0) 45%) 48px 50px,
                radial-gradient(circle closest-side at 50% 35%, 
                            ${heartColor} 30%, 
                            rgba(221,51,85,0) 37%) 50px 50px;
                color: ${color};
                background-color: ${bgColor};
                background-size: 100px 100px;
            `,
        );
    }

    _init() {
        const defaultColors: { [key in ChalkDefaultColorPrimary]: string } = {
            _black: '#00000',
            _white: '#FFFFFF',
            _red: '#FF0000',
            _yellow: '#FFFF00',
            _green: '#008000',
            _blue: '#0000FF',
            _purple: '#A020F0',
            _lightYellow: '#FFFFE0',
            _lightGreen: '#90EE90',
            _lightBlue: '#0000FF',
            _lib: '#606060',
            _version: '#42c02e',
        };
        Object.keys(defaultColors).forEach((key) => {
            this.colorMap.set(
                <ChalkDefaultColorPrimary>key,
                defaultColors[<ChalkDefaultColorPrimary>key],
            );
        });

        const defaultLevel: { [key in ChalkLevel]: ChalkLevelConf } = {
            log: {
                colorPrimay: '_black',
                icon: logIcon,
            },
            event: {
                colorPrimay: '_blue',
                icon: eventIcon,
            },
            warn: {
                colorPrimay: '_purple',
                icon: warnIcon,
            },
            error: {
                colorPrimay: '_red',
                icon: errorIcon,
            },
            ready: {
                colorPrimay: '_green',
                icon: readyIcon,
            },
        };
        Object.keys(defaultLevel).forEach((key) => {
            this.levelMap.set(<ChalkLevel>key, defaultLevel[<ChalkLevel>key]);
        });
    }

    async _beautifyMsg(
        type: ChalkLevel<L>,
        msg: string,
        logConf: ChalkLevelConf<Extract<keyof C, string> | ChalkDefaultColorPrimary>,
    ) {
        if (logConf.icon) {
            // 加载图片
            const url = await this._loadImage(logConf.icon);
            this._consoleMsg(type, msg, logConf, url);
        } else {
            this._consoleMsg(type, msg, logConf);
        }
    }

    // 支持base64以及网络路径图片
    async _loadImage(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const iconMap = this._cached.images;
            // base64图片
            if (url.startsWith('data:image')) {
                return resolve(url);
            }
            // 缓存处理
            if (iconMap.has(url)) {
                return resolve(<string>this._cached.images.get(url));
            }

            // 网络图片
            fetch(url)
                .then(async (res) => {
                    if (res.status === 200 && res.body) {
                        const fileReader = new FileReader();
                        const blob = await res.blob();

                        if (blob && blob.type.includes('image/')) {
                            fileReader.readAsDataURL(blob);
                            fileReader.onload = (e) => {
                                if (e.target?.result) {
                                    // 进行缓存
                                    iconMap.set(url, <string>e.target.result);
                                    resolve(<string>e.target.result);
                                } else {
                                    resolve('');
                                }
                            };
                            fileReader.onerror = (err) => {
                                reject(err);
                            };
                        }
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    _consoleMsg(
        type: ChalkLevel<L>,
        msg: string,
        logConf: ChalkLevelConf<Extract<keyof C, string> | ChalkDefaultColorPrimary>,
        imageUrl?: string,
    ) {
        const cb = console.log;
        if (imageUrl) {
            cb(
                `%c %c [${type[0].toUpperCase() + type.slice(1)}]: %c${msg}`,
                `
                    padding: 3px;
                    background-image: url(${imageUrl});
                    background-repeat: no-repeat;
                    background-size: contain;
                    background-position: center;
                `,
                `
                    color: ${this._reflectPrimaryColor(logConf.colorPrimay)};
                `,
                `
                    color: ${this._reflectPrimaryColor(logConf.colorPrimay)};
                `,
            );
        } else {
            cb(
                `%c  %c [${type[0].toUpperCase() + type.slice(1)}]: %c${msg}`,
                ``,
                `
                    color: ${this._reflectPrimaryColor(logConf.colorPrimay)};
                `,
                `
                    color: ${this._reflectPrimaryColor(logConf.colorPrimay)};
                `,
            );
        }
    }

    async _drawImage(url: string, config: ChalkImageConfig) {
        const dataUri = await this._loadImage(url);
        if (dataUri) {
            const img = new Image();
            img.src = url;
            img.crossOrigin = 'anonymous';

            img.addEventListener('load', () => {
                const w = config.width || img.width,
                    h = config.height || img.height;
                // 进行canvas绘制
                const c = document.createElement('canvas');
                const ctx = c.getContext('2d');
                if (ctx) {
                    c.width = w;
                    c.height = h;
                    ctx.drawImage(img, 0, 0, w, h);
                    this._resolveImage(ctx, config);

                    const target = c.toDataURL('image/png');
                    console.log(
                        `%c `,
                        `   
                            padding: ${w / 2}px ${h / 2}px;
                            background: url(${target}) no-repeat center;
                        `,
                    );
                }
            });
        }
    }

    _resolveImage(ctx: CanvasRenderingContext2D, config: ChalkImageConfig) {}

    _reflectPrimaryColor(
        primary: Extract<keyof C, string> | ChalkDefaultColorPrimary,
    ) {
        return this.colorMap.get(primary) || '';
    }
}
