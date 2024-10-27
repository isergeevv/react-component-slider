'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');

exports.SLIDER_TYPE = void 0;
(function (SLIDER_TYPE) {
    SLIDER_TYPE["VERTICAL"] = "vertical";
    SLIDER_TYPE["HORIZONTAL"] = "horizontal";
})(exports.SLIDER_TYPE || (exports.SLIDER_TYPE = {}));
exports.SLIDER_DIRECTIONS = void 0;
(function (SLIDER_DIRECTIONS) {
    SLIDER_DIRECTIONS["UP"] = "up";
    SLIDER_DIRECTIONS["DOWN"] = "down";
    SLIDER_DIRECTIONS["LEFT"] = "left";
    SLIDER_DIRECTIONS["RIGHT"] = "right";
})(exports.SLIDER_DIRECTIONS || (exports.SLIDER_DIRECTIONS = {}));

const FPS = 60;
const DELTA_TIME = 1000 / FPS;
const MOVE_PIXELS = 10;
const getDeltaTimeMultiplier = (timestamp, lastTimestamp) => {
    if (!lastTimestamp) {
        return 1;
    }
    const msPassed = timestamp - lastTimestamp;
    const frameInterval = 1000 / msPassed;
    return DELTA_TIME / frameInterval;
};
const getElementSize = (rect, type) => {
    switch (type) {
        case exports.SLIDER_TYPE.VERTICAL:
            return rect.height;
        case exports.SLIDER_TYPE.HORIZONTAL:
            return rect.width;
    }
};
const removeFillerItems = (sliderElement) => {
    const fillerItems = sliderElement.querySelectorAll('li.filler');
    for (let i = 0; i < fillerItems.length; i++) {
        sliderElement.removeChild(fillerItems[i]);
    }
};
const addFillerItems = (sliderRect, sliderElement, sliderItemElements, config) => {
    const sliderSize = getElementSize(sliderRect, config.type);
    let topSize = 0;
    let bottomSize = 0;
    let currentItemIndex = 0;
    currentItemIndex = sliderItemElements.length - 1;
    while (topSize < sliderSize) {
        const elementRect = sliderItemElements[currentItemIndex].getBoundingClientRect();
        const itemSize = getElementSize(elementRect, config.type);
        const itemCopy = sliderItemElements[currentItemIndex].cloneNode(true);
        itemCopy.classList.add('filler');
        sliderElement.prepend(itemCopy);
        topSize += itemSize;
        currentItemIndex--;
        if (currentItemIndex < 0) {
            currentItemIndex = sliderItemElements.length - 1;
        }
    }
    currentItemIndex = 0;
    while (bottomSize < sliderSize) {
        const elementRect = sliderItemElements[currentItemIndex].getBoundingClientRect();
        const itemSize = getElementSize(elementRect, config.type);
        const itemCopy = sliderItemElements[currentItemIndex].cloneNode(true);
        itemCopy.classList.add('filler');
        sliderElement.append(itemCopy);
        bottomSize += itemSize;
        currentItemIndex++;
        if (currentItemIndex > sliderItemElements.length - 1) {
            currentItemIndex = 0;
        }
    }
};
const parseConfig = (props) => {
    var _a, _b, _c, _d, _e, _f;
    const type = (_a = props.type) !== null && _a !== void 0 ? _a : exports.SLIDER_TYPE.HORIZONTAL;
    const direction = (_b = props.direction) !== null && _b !== void 0 ? _b : (type === exports.SLIDER_TYPE.HORIZONTAL ? exports.SLIDER_DIRECTIONS.RIGHT : exports.SLIDER_DIRECTIONS.DOWN);
    const speed = (_c = props.speed) !== null && _c !== void 0 ? _c : 1;
    const gap = (_d = props.gap) !== null && _d !== void 0 ? _d : 0;
    const pauseOnHover = (_e = props.pauseOnHover) !== null && _e !== void 0 ? _e : false;
    const autoPlay = (_f = props.autoPlay) !== null && _f !== void 0 ? _f : true;
    return {
        type,
        direction,
        speed,
        gap,
        pauseOnHover,
        autoPlay,
    };
};
function useSlider(props) {
    const [sliderRect, setSliderRect] = react.useState(null);
    const [playing, setPlaying] = react.useState(false);
    const [hoverPaused, setHoverPaused] = react.useState(false);
    const config = react.useRef(parseConfig(props !== null && props !== void 0 ? props : {}));
    const sliderContainerRef = react.useRef(null);
    const sliderRef = react.useRef(null);
    const offset = react.useRef(0);
    const lastTimestamp = react.useRef(0);
    const updateSliderInterval = react.useRef(null);
    const animationFrame = react.useRef(0);
    const toggleSliderMove = (value) => {
        setPlaying((prev) => value !== null && value !== void 0 ? value : !prev);
    };
    const updateSliderRect = () => {
        if (!sliderContainerRef.current)
            return;
        setSliderRect(sliderContainerRef.current.getBoundingClientRect());
    };
    const setupSliderItems = react.useCallback(() => {
        if (!sliderRef.current) {
            throw new Error('Missing items list element.');
        }
        if (!sliderRect) {
            throw new Error('Missing slider rect.');
        }
        removeFillerItems(sliderRef.current);
        const itemElements = sliderRef.current.querySelectorAll('li');
        addFillerItems(sliderRect, sliderRef.current, itemElements, config.current);
        const startItemRect = itemElements[0].getBoundingClientRect();
        offset.current = -startItemRect.top + offset.current;
        sliderRef.current.style.transform = `translateY(${offset.current}px)`;
    }, [sliderRect]);
    const moveCallback = react.useCallback((timestamp) => {
        if (!playing)
            return;
        if (!sliderRef.current) {
            throw new Error('Missing items list element.');
        }
        if (sliderRect) {
            const itemElements = sliderRef.current.querySelectorAll('li:not(.filler)');
            const startRect = itemElements[0].getBoundingClientRect();
            const endRect = itemElements[itemElements.length - 1].getBoundingClientRect();
            const sliderSize = getElementSize(sliderRect, config.current.type);
            const deltaTimeMultiplier = getDeltaTimeMultiplier(timestamp, lastTimestamp.current);
            switch (config.current.type) {
                case exports.SLIDER_TYPE.VERTICAL: {
                    switch (config.current.direction) {
                        case exports.SLIDER_DIRECTIONS.DOWN: {
                            offset.current += deltaTimeMultiplier * MOVE_PIXELS * config.current.speed;
                            if (sliderSize - offset.current < startRect.top) {
                                offset.current = -endRect.top + (sliderSize - endRect.height) - config.current.gap;
                            }
                            break;
                        }
                        case exports.SLIDER_DIRECTIONS.UP: {
                            offset.current -= deltaTimeMultiplier * MOVE_PIXELS * config.current.speed;
                            if (endRect.top + endRect.height < 0) {
                                offset.current -= startRect.top - config.current.gap;
                            }
                            break;
                        }
                    }
                    break;
                }
                case exports.SLIDER_TYPE.HORIZONTAL: {
                    throw new Error('Horizontal slider has not been implemented.');
                }
            }
        }
        sliderRef.current.style.transform = `translateY(${offset.current}px)`;
        lastTimestamp.current = timestamp;
        animationFrame.current = window.requestAnimationFrame(moveCallback);
    }, [playing, sliderRect]);
    // on slider rect update update the slider items
    react.useEffect(() => {
        if (sliderRect) {
            setupSliderItems();
        }
    }, [sliderRect, setupSliderItems]);
    // on window resize get new slider rect
    react.useEffect(() => {
        const onSliderResize = () => {
            if (updateSliderInterval.current) {
                clearInterval(updateSliderInterval.current);
            }
            updateSliderInterval.current = setTimeout(updateSliderRect, 200);
        };
        window.addEventListener('resize', onSliderResize);
        return () => {
            window.removeEventListener('resize', onSliderResize);
        };
    }, []);
    // on mouse enter and exit
    react.useEffect(() => {
        const onMouseEnter = () => {
            if (!sliderRect)
                return;
            if (!config.current.pauseOnHover)
                return;
            if (!playing)
                return;
            setPlaying(false);
            setHoverPaused(true);
        };
        const onMouseLeave = () => {
            if (!sliderRect)
                return;
            if (!config.current.pauseOnHover)
                return;
            if (playing)
                return;
            if (!hoverPaused)
                return;
            setPlaying(true);
            setHoverPaused(false);
        };
        if (sliderRef.current) {
            sliderRef.current.addEventListener('mouseenter', onMouseEnter);
            sliderRef.current.addEventListener('mouseleave', onMouseLeave);
        }
        return () => {
            if (sliderRef.current) {
                sliderRef.current.removeEventListener('mouseenter', onMouseEnter);
                sliderRef.current.removeEventListener('mouseleave', onMouseLeave);
            }
        };
    }, [playing, sliderRect]);
    // on playing start animation frame
    react.useEffect(() => {
        if (playing) {
            animationFrame.current = window.requestAnimationFrame(moveCallback);
        }
        return () => {
            window.cancelAnimationFrame(animationFrame.current);
            lastTimestamp.current = 0;
        };
    }, [playing, moveCallback]);
    // initialize slider references
    react.useEffect(() => {
        if (!sliderContainerRef.current) {
            throw new Error('Missing slider container reference.');
        }
        sliderContainerRef.current.classList.add('slider-container');
        sliderRef.current = sliderContainerRef.current.querySelector('ul');
        if (!sliderRef.current) {
            throw new Error('Missing items list element.');
        }
        sliderRef.current.classList.add('slider');
        sliderRef.current.style.display = 'flex';
        sliderRef.current.style.flexDirection = 'column';
        if (config.current.gap > 0) {
            sliderRef.current.style.gap = `${config.current.gap}px`;
        }
        const itemElements = sliderRef.current.querySelectorAll('li');
        if (itemElements.length < 1) {
            throw new Error('Missing item elements in the list.');
        }
        for (let i = 0; i < itemElements.length; i++) {
            itemElements[i].classList.add('slider-item');
        }
        setSliderRect(sliderContainerRef.current.getBoundingClientRect());
        if (config.current.autoPlay) {
            setPlaying(true);
        }
    }, []);
    return {
        sliderRef: sliderContainerRef,
        toggleSliderMove,
    };
}

exports.default = useSlider;
