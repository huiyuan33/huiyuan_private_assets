declare type Language = 'en' | 'zh';

declare type LanguageFieldsConfig<T> = {
    [key in Language]: T;
};
