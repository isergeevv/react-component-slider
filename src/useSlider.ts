import { useCallback, useEffect, useRef, useState } from 'react';
import { Slider, SLIDER_DIRECTIONS, SLIDER_TYPE, SliderConfiguration } from './types';

const FPS = 60;
const DELTA_TIME = 1000 / FPS;
const MOVE_PIXELS = 10;

const getDeltaTimeMultiplier = (timestamp: number, lastTimestamp: number) => {
  if (!lastTimestamp) {
    return 1;
  }

  const msPassed = timestamp - lastTimestamp;
  const frameInterval = 1000 / msPassed;
  return DELTA_TIME / frameInterval;
};

const getElementSize = (rect: DOMRect, type: SLIDER_TYPE) => {
  switch (type) {
    case SLIDER_TYPE.VERTICAL:
      return rect.height;
    case SLIDER_TYPE.HORIZONTAL:
      return rect.width;
  }
};

const removeFillerItems = (sliderElement: HTMLUListElement) => {
  const fillerItems = sliderElement.querySelectorAll('li.filler');
  for (let i = 0; i < fillerItems.length; i++) {
    sliderElement.removeChild(fillerItems[i]);
  }
};

const addFillerItems = (
  sliderRect: DOMRect,
  sliderElement: HTMLUListElement,
  sliderItemElements: NodeListOf<HTMLLIElement>,
  config: SliderConfiguration,
) => {
  const sliderSize = getElementSize(sliderRect, config.type);

  let topSize = 0;
  let bottomSize = 0;
  let currentItemIndex = 0;

  currentItemIndex = sliderItemElements.length - 1;
  while (topSize < sliderSize) {
    const elementRect = sliderItemElements[currentItemIndex].getBoundingClientRect();
    const itemSize = getElementSize(elementRect, config.type);

    const itemCopy = sliderItemElements[currentItemIndex].cloneNode(true) as HTMLLIElement;
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

    const itemCopy = sliderItemElements[currentItemIndex].cloneNode(true) as HTMLLIElement;
    itemCopy.classList.add('filler');

    sliderElement.append(itemCopy);

    bottomSize += itemSize;

    currentItemIndex++;
    if (currentItemIndex > sliderItemElements.length - 1) {
      currentItemIndex = 0;
    }
  }
};

const parseConfig = (props: Partial<SliderConfiguration>): SliderConfiguration => {
  const type = props.type ?? SLIDER_TYPE.HORIZONTAL;
  const direction = props.direction ?? (type === SLIDER_TYPE.HORIZONTAL ? SLIDER_DIRECTIONS.RIGHT : SLIDER_DIRECTIONS.DOWN);
  const speed = props.speed ?? 1;
  const gap = props.gap ?? 0;
  const pauseOnHover = props.pauseOnHover ?? false;
  const autoPlay = props.autoPlay ?? true;

  return {
    type,
    direction,
    speed,
    gap,
    pauseOnHover,
    autoPlay,
  } as SliderConfiguration;
};

export default function useSlider(props?: Partial<SliderConfiguration>): Slider {
  const [sliderRect, setSliderRect] = useState<DOMRect | null>(null);
  const [playing, setPlaying] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);

  const config = useRef(parseConfig(props ?? {}));

  const sliderContainerRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<HTMLUListElement | null>(null);

  const offset = useRef<number>(0);
  const lastTimestamp = useRef<number>(0);
  const updateSliderInterval = useRef<NodeJS.Timeout | null>(null);
  const animationFrame = useRef<number>(0);

  const toggleSliderMove = (value?: boolean) => {
    setPlaying((prev) => value ?? !prev);
  };

  const updateSliderRect = () => {
    if (!sliderContainerRef.current) return;

    setSliderRect(sliderContainerRef.current.getBoundingClientRect());
  };

  const setupSliderItems = useCallback(() => {
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

  const moveCallback = useCallback(
    (timestamp: number) => {
      if (!playing) return;

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
          case SLIDER_TYPE.VERTICAL: {
            switch (config.current.direction) {
              case SLIDER_DIRECTIONS.DOWN: {
                offset.current += deltaTimeMultiplier * MOVE_PIXELS * config.current.speed;

                if (sliderSize - offset.current < startRect.top) {
                  offset.current = -endRect.top + (sliderSize - endRect.height) - config.current.gap;
                }

                break;
              }
              case SLIDER_DIRECTIONS.UP: {
                offset.current -= deltaTimeMultiplier * MOVE_PIXELS * config.current.speed;

                if (endRect.top + endRect.height < 0) {
                  offset.current -= startRect.top - config.current.gap;
                }

                break;
              }
            }

            break;
          }
          case SLIDER_TYPE.HORIZONTAL: {
            throw new Error('Horizontal slider has not been implemented.');
          }
        }
      }

      sliderRef.current.style.transform = `translateY(${offset.current}px)`;

      lastTimestamp.current = timestamp;
      animationFrame.current = window.requestAnimationFrame(moveCallback);
    },
    [playing, sliderRect],
  );

  // on slider rect update update the slider items
  useEffect(() => {
    if (sliderRect) {
      setupSliderItems();
    }
  }, [sliderRect, setupSliderItems]);

  // on window resize get new slider rect
  useEffect(() => {
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
  useEffect(() => {
    const onMouseEnter = () => {
      if (!sliderRect) return;
      if (!config.current.pauseOnHover) return;
      if (!playing) return;

      setPlaying(false);
      setHoverPaused(true);
    };

    const onMouseLeave = () => {
      if (!sliderRect) return;
      if (!config.current.pauseOnHover) return;
      if (playing) return;
      if (!hoverPaused) return;

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
  useEffect(() => {
    if (playing) {
      animationFrame.current = window.requestAnimationFrame(moveCallback);
    }

    return () => {
      window.cancelAnimationFrame(animationFrame.current);
      lastTimestamp.current = 0;
    };
  }, [playing, moveCallback]);

  // initialize slider references
  useEffect(() => {
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
