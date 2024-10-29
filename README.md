# React Component Slider

A slider for your images/containers.

`Only vertical(up and down) have been implemented. If i have time or need it i will implement the horizontal. Also if someone else needs to use it with horizontal just open an issue and i will try to find time to implement it.`

## Installation

Install react-component-slider with npm

```bash
  npm install @isergeevv/react-component-slider
```

## Usage/Examples

```tsx
import useSlider, { SLIDER_TYPE, SLIDER_VERTICAL_DIRECTIONS } from '@isergeevv/react-component-slider';

const sliderConfig = {
  type: SLIDER_TYPE.VERTICAL,
  direction: SLIDER_VERTICAL_DIRECTIONS.DOWN,
  speed: 1,
  gap: 20,
  pauseOnHover: true,
};

function App() {
  const sliderRef = useSlider(sliderConfig);

  return (
    <div ref={sliderRef}>
      <ul>
        {leftList.map((image, index) => (
          <li key={index}>
            <img alt={`image ${index}`} src={image.src} />
          </li>
        ))}
      </ul>
    </div>
  );
}
```

You can view it live on the desktop version of [https://iphie.digital/archive](https://iphie.digital/archive)
