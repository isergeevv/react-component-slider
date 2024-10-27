declare enum SLIDER_TYPE {
    VERTICAL = "vertical",
    HORIZONTAL = "horizontal"
}
declare enum SLIDER_DIRECTIONS {
    UP = "up",
    DOWN = "down",
    LEFT = "left",
    RIGHT = "right"
}
type SliderConfiguration = {
    speed: number;
    gap: number;
    pauseOnHover: boolean;
    autoPlay: boolean;
} & ({
    type: SLIDER_TYPE.HORIZONTAL;
    direction: SLIDER_DIRECTIONS.LEFT | SLIDER_DIRECTIONS.RIGHT;
} | {
    type: SLIDER_TYPE.VERTICAL;
    direction: SLIDER_DIRECTIONS.UP | SLIDER_DIRECTIONS.DOWN;
});
interface Slider {
    sliderRef: React.MutableRefObject<HTMLDivElement | null>;
    toggleSliderMove: (value?: boolean) => void;
}

declare function useSlider(props?: Partial<SliderConfiguration>): Slider;

export { SLIDER_DIRECTIONS, SLIDER_TYPE, type Slider, type SliderConfiguration, useSlider as default };
