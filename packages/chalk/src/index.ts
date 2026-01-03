import logIcon from './icon/log.png';
import warnIcon from './icon/warn.png';
import errorIcon from './icon/error.png';
import eventIcon from './icon/event.png';
import readyIcon from './icon/ready.png';

enum ChalkDefaultColorConfig {
    _black = '#000000',
    _white = '#FFFFFF',
    _red = '#FF0000',
    _yellow = '#FFFF00',
    _green = '#008000',
    _blue = '#0000FF',
    _purple = '#A020F0',
    _lightYellow = '#FFFFE0',
    _lightGreen = '#90EE90',
    _lightBlue = '#9BD0E1',
    _lib = '#606060',
    _version = '#42c02e',
}
type ChalkDefaultColorPrimary = keyof typeof ChalkDefaultColorConfig;
type ChalkColorPrimary<C> = C | ChalkDefaultColorPrimary;

const chalkDefaultLogType = <const>['log', 'warn', 'error', 'event', 'ready'];
type ChalkDefaultLogType = (typeof chalkDefaultLogType)[number];
type ChalkLogType<T> = T | ChalkDefaultLogType;
type ChalkLogTypeConfig<C = ChalkDefaultColorPrimary> = {
    colorPrimay: C | ChalkDefaultColorPrimary;
    icon?: string;
};

type ChalkHeartConfig<T extends string = ChalkDefaultColorPrimary> = {
    color: T | ChalkDefaultColorPrimary;
    bgColor: T | ChalkDefaultColorPrimary;
    heartColor: T | ChalkDefaultColorPrimary;
    fontSize: number;
    padding: [number, number];
};

type ChalkImageConfig = {
    width: number;
    height: number;
};

/**
 * T: 用于扩展Chalk内置日志类型
 * C: 用于扩展Chalk内置颜色
 */
export class Chalk<
    T extends string = ChalkDefaultLogType,
    C extends string = ChalkDefaultColorPrimary,
> {
    private _colorMap = new Map<ChalkColorPrimary<C>, string>();
    private _logTypeMap = new Map<ChalkLogType<T>, ChalkLogTypeConfig<C>>();

    private _cached = {
        images: new Map<string, string>(),
    };

    constructor() {
        this._initDefaultConfig();
    }

    // 初始化默认配置
    _initDefaultConfig() {
        // 内置默认颜色配置
        Object.keys(ChalkDefaultColorConfig).forEach((key) => {
            this._colorMap.set(
                <ChalkDefaultColorPrimary>key,
                ChalkDefaultColorConfig[<ChalkDefaultColorPrimary>key],
            );
        });
        // 内置日志配置
        this._initLogTypeConfig();
    }

    // 配置默认日志
    _initLogTypeConfig() {
        chalkDefaultLogType.forEach((item) => {
            switch (item) {
                case 'log':
                    this.setLogType('log', {
                        colorPrimay: '_black',
                        icon: logIcon,
                    });
                    break;
                case 'warn':
                    this.setLogType('warn', {
                        colorPrimay: '_purple',
                        icon: warnIcon,
                    });
                    break;
                case 'ready':
                    this.setLogType('ready', {
                        colorPrimay: '_green',
                        icon: readyIcon,
                    });
                    break;
                case 'event':
                    this.setLogType('event', {
                        colorPrimay: '_blue',
                        icon: eventIcon,
                    });
                    break;
                case 'error':
                    this.setLogType('error', {
                        colorPrimay: '_red',
                        icon: errorIcon,
                    });
                    break;
            }
        });
    }

    async _beautifyMsg(
        type: ChalkLogType<T>,
        msg: string,
        logConf: ChalkLogTypeConfig<C>,
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
    _loadImage(url: string): Promise<string> {
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
        type: ChalkLogType<T>,
        msg: string,
        logConf: ChalkLogTypeConfig<C>,
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
                    color: ${this._reflectColor(logConf.colorPrimay)};
                `,
                `
                    color: ${this._reflectColor(logConf.colorPrimay)};
                `,
            );
        } else {
            cb(
                `%c  %c [${type[0].toUpperCase() + type.slice(1)}]: %c${msg}`,
                ``,
                `
                    color: ${this._reflectColor(logConf.colorPrimay)};
                `,
                `
                    color: ${this._reflectColor(logConf.colorPrimay)};
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

    _reflectColor(primary: ChalkColorPrimary<C>) {
        return this._colorMap.get(primary);
    }

    /**
     * 配置自定义日志类型
     * @param type 日志类型
     * @param conf 打印样式配置
     */
    setLogType(type: ChalkLogType<T>, conf: ChalkLogTypeConfig<C>) {
        if (type && conf) {
            this._logTypeMap.set(type, conf);
        }
    }

    /**
     * 修改colorPrimary对应的色值
     * @param primary
     * @param color
     */
    updateColorPrimary(primary: ChalkColorPrimary<C>, color: string) {
        if (primary && color) {
            if (this._colorMap.has(primary)) {
                this._colorMap.set(primary, color);
            }
        }
    }

    log(type: ChalkLogType<T>, msg: string) {
        if (msg && type) {
            const levelConf = this._logTypeMap.get(type);
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
     * 输出包名以及对应版本号
     *
     * @param lib       包名
     * @param version   包版本
     */
    version(lib: string, version: string) {
        console.log(
            `%c ${lib} %c V${version} `,
            `
                padding: 2px 1px; 
                border-radius: 3px 0 0 3px; 
                color: ${this._reflectColor('_white')}; 
                background: ${this._reflectColor('_lib')}; 
                font-weight: bold;`,
            `
                padding: 2px 1px; 
                border-radius: 0 3px 3px 0; 
                color: ${this._reflectColor('_white')}; 
                background: ${this._reflectColor('_version')}; 
                font-weight: bold;
            `,
        );
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

    hearts(word: string, config: Partial<ChalkHeartConfig<C>> = {}) {
        const { fontSize, padding, color, bgColor, heartColor } = {
            color: config.color ? this._reflectColor(config.color) : '#fff',
            bgColor: config.bgColor ? this._reflectColor(config.bgColor) : '#b03',
            heartColor: config.heartColor
                ? this._reflectColor(config.heartColor)
                : '#d35',
            fontSize: config.fontSize ?? 20,
            padding: config.padding ?? [12, 20],
        };

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
}
